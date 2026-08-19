// ================= 初始化 =================
document.getElementById('year').textContent = new Date().getFullYear();
document.body.classList.add('loaded');

// ================= 雨滴背景效果 =================
const rainCanvas = document.getElementById('rain');
const rainCtx = rainCanvas.getContext('2d');
let raindrops = [];

function resizeRain() {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
}

function createRain() {
    raindrops = [];
    const count = Math.min(window.innerWidth / 6, 120);
    for (let i = 0; i < count; i++) {
        raindrops.push({
            x: Math.random() * rainCanvas.width,
            y: Math.random() * rainCanvas.height,
            length: Math.random() * 25 + 12,
            speed: Math.random() * 4 + 3,
            opacity: Math.random() * 0.3 + 0.15
        });
    }
}

function animateRain() {
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    rainCtx.strokeStyle = 'rgba(200, 200, 205, 1)';
    rainCtx.lineWidth = 1;

    raindrops.forEach(d => {
        d.y += d.speed;
        d.x -= 0.6;
        rainCtx.globalAlpha = d.opacity;
        rainCtx.beginPath();
        rainCtx.moveTo(d.x, d.y);
        rainCtx.lineTo(d.x - 2, d.y - d.length);
        rainCtx.stroke();

        if (d.y > rainCanvas.height) {
            d.y = -d.length;
            d.x = Math.random() * rainCanvas.width;
        }
    });

    rainCtx.globalAlpha = 1;
    requestAnimationFrame(animateRain);
}

// ================= 漂浮尘埃粒子 =================
const pCanvas = document.getElementById('particles');
const pCtx = pCanvas.getContext('2d');
const pCount = Math.min(window.innerWidth / 18, 45);
let motes = [];

function resizeParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
}

function createMotes() {
    motes = [];
    for (let i = 0; i < pCount; i++) {
        motes.push({
            x: Math.random() * pCanvas.width,
            y: Math.random() * pCanvas.height,
            r: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            opacity: Math.random() * 0.35 + 0.1
        });
    }
}

function animateMotes() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    motes.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < 0 || m.x > pCanvas.width) m.vx *= -1;
        if (m.y < 0 || m.y > pCanvas.height) m.vy *= -1;

        pCtx.beginPath();
        pCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        pCtx.fillStyle = 'rgba(190, 190, 195, ' + m.opacity + ')';
        pCtx.fill();
    });
    requestAnimationFrame(animateMotes);
}

// ================= Web Audio 忧伤钢琴旋律 =================
let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let audioStarted = false;

const noteFreq = {
    A2: 110.00, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61,
    G3: 196.00, A3: 220.00, B3: 246.94, C4: 261.63, D4: 293.66,
    E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99,
    A5: 880.00, C6: 1046.50
};

// 伤感和弦进行：Am - F - C - G
const chords = [
    ['A3', 'C4', 'E4', 'A4'],
    ['F3', 'A3', 'C4', 'F4'],
    ['C4', 'E4', 'G4', 'C5'],
    ['G3', 'B3', 'D4', 'G4']
];

const melody = [
    'E5', 'C5', 'A4', 'C5', 'D5', 'E5', 'C5', 'A4',
    'G4', 'A4', 'C5', 'A4', 'G4', 'E4', 'A4', 'G4',
    'E5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5',
    'E5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5'
];

function playNote(freq, startTime, duration, volume) {
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const gain2 = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(volume * 0.35, startTime + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain).connect(masterGain);
    osc2.connect(gain2).connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.1);
}

function initAudio() {
    if (audioStarted) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        // 该环境不支持音频，仅提示
        audioCtx = null;
        return;
    }
    audioStarted = true;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;

    // 混响感
    const delay = audioCtx.createDelay(1);
    delay.delayTime.value = 0.35;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.3;
    const wet = audioCtx.createGain();
    wet.gain.value = 0.35;
    masterGain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(audioCtx.destination);
    masterGain.connect(audioCtx.destination);
}

function playPattern() {
    if (!isPlaying || !audioCtx) return;
    const startTime = audioCtx.currentTime + 0.1;
    const chordDur = 3.2;
    const noteDur = 2.8;

    // 和弦
    for (let c = 0; c < chords.length; c++) {
        const t = startTime + c * chordDur;
        chords[c].forEach(n => {
            playNote(noteFreq[n], t, chordDur * 0.9, 0.09);
        });
    }

    // 主旋律
    const headStart = startTime + 0.3;
    const melInterval = (chordDur * chords.length) / melody.length;
    melody.forEach((n, i) => {
        const t = headStart + i * melInterval * 0.5;
        playNote(noteFreq[n], t, noteDur * 0.5, 0.11);
    });
}

function startMusic() {
    // 自动播放钢琴旋律（在用户点击"进入"的手势下触发）
    if (!audioStarted) {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }
    if (isPlaying) return;
    isPlaying = true;
    const badge = document.getElementById('musicBadge');
    if (badge) badge.classList.add('show');
    playPattern();
}

// ================= 打字效果 =================
const lines = [
    '...有些回忆，原来只能停留在那个冬天',
    '...我以为说了再见，就真的能再见',
    '...听说雨停的那天，人会变得勇敢'
];
let lineIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const el = document.getElementById('typedText');
    const current = lines[lineIndex];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    el.innerHTML = current.substring(0, charIndex) + '<span class="cursor"></span>';

    let delay = isDeleting ? 35 : 90;

    if (!isDeleting && charIndex === current.length) {
        delay = 2200;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        delay = 500;
    }

    setTimeout(typeEffect, delay);
}

// ================= 滚动显示 =================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ================= 导航 =================
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('show');
}

document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('show');
    });
});

const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const backTop = document.querySelector('.back-top');

window.addEventListener('scroll', () => {
    const pos = window.scrollY + 80;
    sections.forEach(s => {
        const top = s.offsetTop - 140;
        const bottom = top + s.offsetHeight;
        if (pos >= top && pos < bottom) {
            navAnchors.forEach(a => a.classList.remove('active'));
            const id = s.getAttribute('id');
            document.querySelector('.nav-links a[href="#' + id + '"]')?.classList.add('active');
        }
    });

    if (window.scrollY > 400) backTop.classList.add('show');
    else backTop.classList.remove('show');
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= 记事本本地保存 =================
const noteArea = document.getElementById('noteArea');
const noteHint = document.getElementById('noteHint');

function loadNote() {
    const saved = localStorage.getItem('rainNote');
    if (saved) {
        noteArea.value = saved;
        noteHint.textContent = '已找回上次写下的心里话';
    }
}

function saveNote() {
    localStorage.setItem('rainNote', noteArea.value);
    noteHint.textContent = '已保存 ✓ 下次打开还会在';
    noteHint.style.color = '#cfcfd4';
    setTimeout(() => { noteHint.style.color = ''; }, 2500);
}

// ================= 忧郁开场幕 =================
const intro = document.getElementById('intro');
const introRainCanvas = document.getElementById('introRain');
const introCtx = introRainCanvas.getContext('2d');
let introDrops = [];

function sizeIntroRain() {
    introRainCanvas.width = window.innerWidth;
    introRainCanvas.height = window.innerHeight;
}

function makeIntroDrops() {
    introDrops = [];
    const n = Math.min(window.innerWidth / 5, 110);
    for (let i = 0; i < n; i++) {
        introDrops.push({
            x: Math.random() * introRainCanvas.width,
            y: Math.random() * introRainCanvas.height,
            len: Math.random() * 28 + 14,
            sp: Math.random() * 4 + 3,
            op: Math.random() * 0.3 + 0.15
        });
    }
}

function drawIntroRain() {
    introCtx.clearRect(0, 0, introRainCanvas.width, introRainCanvas.height);
    introCtx.strokeStyle = 'rgba(205, 205, 210, 1)';
    introCtx.lineWidth = 1;
    introDrops.forEach(d => {
        d.y += d.sp;
        d.x -= 0.6;
        introCtx.globalAlpha = d.op;
        introCtx.beginPath();
        introCtx.moveTo(d.x, d.y);
        introCtx.lineTo(d.x - 2, d.y - d.len);
        introCtx.stroke();
        if (d.y > introRainCanvas.height) { d.y = -d.len; d.x = Math.random() * introRainCanvas.width; }
    });
    introCtx.globalAlpha = 1;
    requestAnimationFrame(drawIntroRain);
}

function runIntro() {
    // 逐行浮现
    const l1 = document.getElementById('introLine1');
    const l2 = document.getElementById('introLine2');
    const l3 = document.getElementById('introLine3');
    const fade = document.getElementById('introFade');
    const btn = document.getElementById('introEnter');

    setTimeout(() => l1.classList.add('show'), 600);
    setTimeout(() => l2.classList.add('show'), 2200);
    setTimeout(() => l3.classList.add('show'), 3800);

    setTimeout(() => l1.classList.add('dim'), 5400);
    setTimeout(() => l2.classList.add('dim'), 5600);
    setTimeout(() => l3.classList.add('dim'), 5800);

    // 全屏淡白，浮现进入按钮
    setTimeout(() => fade.classList.add('show'), 7000);
    setTimeout(() => { btn.classList.add('show'); }, 7600);
}

function enterSite() {
    const btn = document.getElementById('introEnter');
    // 锁定滚动
    document.body.classList.add('intro-hidden');

    // 用户点击"进入"即为手势，立即启动自动播放音乐（须在同步调用栈内，保证浏览器放行音频）
    startMusic();

    // 淡出开场幕
    setTimeout(() => {
        intro.classList.add('hidden');
        document.body.classList.remove('intro-hidden');
        // 开始主页面雨滴/粒子
        resizeRain(); createRain(); animateRain();
        resizeParticles(); createMotes(); animateMotes();
    }, 300);
}

document.getElementById('introEnter').addEventListener('click', enterSite);

// ================= 启动 =================
window.addEventListener('load', () => {
    // 开场幕下雨
    sizeIntroRain(); makeIntroDrops(); drawIntroRain();
    runIntro();
    // 主页面提前初始化雨滴（在开场幕后可见）
    sizeIntroRain(); makeIntroDrops();
    typeEffect();
    loadNote();
});

window.addEventListener('resize', () => {
    sizeIntroRain(); makeIntroDrops();
    resizeRain(); createRain();
    resizeParticles(); createMotes();
});