// --- 1. Inisialisasi Global ---
const videoElement = document.getElementById('webcam-stream');
const gameCanvas = document.getElementById('game-canvas');
const canvasCtx = gameCanvas.getContext('2d');

// --- 2. Variabel & Konstanta Game ---
const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    SETTINGS: 'SETTINGS',
    MODE_SELECTION: 'MODE_SELECTION',
    WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS', 
    COUNTDOWN: 'COUNTDOWN', 
    GAME_OVER: 'GAME_OVER', 
    GAME_WIN: 'GAME_WIN'
};
let gameState = GameState.MENU;

let detectionMode = 'HAND'; // Hanya 'HAND' dan 'NOSE' sekarang
let difficulty = 'EASY'; // 'EASY', 'MEDIUM', 'HARD', 'TEAMWORK'

const DWELL_TIME = 1.5; 
let dwellTimer = 0;
const bgMusic = new Audio('https://files.catbox.moe/uswvy3.mp3');
bgMusic.loop = true;

// Waktu permainan
let startTime = 0;
let elapsedTime = 0;

// Tema Warna (Light / Dark Mode)
let currentTheme = 'DARK';
const themes = {
    DARK: {
        bg: '#000022',
        overlay: 'rgba(0, 0, 34, 0.9)',
        text: '#FFFFFF',
        textMuted: '#E2E8F0',
        wall: '#4A5568',
        path: '#1A202C',
        btnBg: 'rgba(20, 20, 50, 0.7)',
        gridBorder: '#000022'
    },
    LIGHT: {
        bg: '#F7FAFC',
        overlay: 'rgba(247, 250, 252, 0.9)',
        text: '#1A202C',
        textMuted: '#2D3748',
        wall: '#A0AEC0',
        path: '#FFFFFF',
        btnBg: 'rgba(226, 232, 240, 0.8)',
        gridBorder: '#E2E8F0'
    }
};

// Tombol Menu Utama
const startButton1P = { x: 0, y: 0, w: 0, h: 0 };
const startButton2P = { x: 0, y: 0, w: 0, h: 0 };
const settingsButton = { x: 0, y: 0, w: 0, h: 0 };
const modeButton = { x: 0, y: 0, w: 0, h: 0 };

// Tombol Settings
const closeSettingsButton = { x: 0, y: 0, w: 0, h: 0 };
const settingOption1Button = { x: 0, y: 0, w: 0, h: 0 }; // Hand
const settingOption2Button = { x: 0, y: 0, w: 0, h: 0 }; // Nose
const themeToggleButton = { x: 0, y: 0, w: 0, h: 0 }; // Toggle Light/Dark

// Tombol Pemilihan Mode
const easyModeButton = { x: 0, y: 0, w: 0, h: 0 };
const mediumModeButton = { x: 0, y: 0, w: 0, h: 0 };
const hardModeButton = { x: 0, y: 0, w: 0, h: 0 };
const teamworkModeButton = { x: 0, y: 0, w: 0, h: 0 };
const backToMenuButton = { x: 0, y: 0, w: 0, h: 0 };

// Tombol Game Over/Win
const restartButton = { x: 0, y: 0, w: 0, h: 0 };
const menuButton = { x: 0, y: 0, w: 0, h: 0 };

// --- Variabel untuk Multi-Player ---
let playerCount = 1;
let winnerLabel = "";
let countdownValue = 3;
let countdownTimer = 0;

// Pointers (L = Kiri, R = Kanan)
const pointers = [
    { x: 0, y: 0, visible: false, color: 'rgba(255, 50, 50, 0.6)', label: 'L' },
    { x: 0, y: 0, visible: false, color: 'rgba(50, 255, 50, 0.6)', label: 'R' }
];

let pointerOffsets = [{x: 0, y: 0}, {x: 0, y: 0}]; 
let pointerWasVisible = [false, false]; 

// Players (Tambahan property hasFinished untuk mode Teamwork)
const players = [
    { x: 0, y: 0, size: 0, color: '#FF3333', label: 'L', isDead: false, hasFinished: false },
    { x: 0, y: 0, size: 0, color: '#33FF33', label: 'R', isDead: false, hasFinished: false }
];

let playerTrail = [];
let explosionParticles = [];
let particles = [];

// --- 3. Logika Maze & Level ---
const GRID_SIZE = 19;
let tileSize = 0;    
let offsetX = 0;     
let offsetY = 0;      

// Kode Tile: 0=Jalan, 1=Tembok, 2=Spawn, 3=Finish/Finish L, 4=Start Timer, 5=Finish R (Teamwork)
const easyMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,2,0,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,1,1,1,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const mediumMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,2,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,0,1,0,0,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,1],
    [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const hardMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,0,0,0,0,0,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,0,0,0,1,1,1,0,1,1,1,1],
    [1,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,1],
    [1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];   

// BARU: Map Teamwork dengan 2 garis finish (3 untuk L, 5 untuk R)
const teamworkMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,5,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,6,1], // 3: Finish L (Kiri Atas), 5: Finish R (Kanan Atas)
    [1,0,1,1,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,0,1],
    [1,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,1], // Area persimpangan luar
    [1,0,0,0,1,1,1,0,1,1,1,0,1,1,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1], // Jalan tikus melintang
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // HIGHWAY TENGAH: Bebas bertukar sisi!
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,1,1,1,0,1,1,1,0,1,1,1,0,0,0,1],
    [1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1], // Area perpotongan bawah
    [1,0,0,0,1,0,1,1,1,0,1,1,1,0,1,0,0,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1], // 2: Spawn di tengah bawah
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let maze = easyMaze;

// --- 4. Fungsi Deteksi & Visual ---
function playSound(sound) {
    sound.currentTime = 0; 
    sound.play().catch(e => {}); 
}

function updateAndDrawPlayerTrail() {
    if (gameState === GameState.PLAYING) {
        for (let i = 0; i < playerCount; i++) {
            if (pointers[i].visible && !players[i].isDead && !players[i].hasFinished) {
                playerTrail.push({
                    x: players[i].x + players[i].size / 2,
                    y: players[i].y + players[i].size / 2,
                    size: players[i].size * 0.8,
                    alpha: 1.0,
                    color: players[i].color
                });
            }
        }
    }

    for (let i = playerTrail.length - 1; i >= 0; i--) {
        let p = playerTrail[i];
        p.alpha -= 0.05; 
        p.size *= 0.95; 
        if (p.alpha <= 0) {
            playerTrail.splice(i, 1); 
        } else {
            canvasCtx.globalAlpha = p.alpha;
            canvasCtx.fillStyle = p.color; 
            canvasCtx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            canvasCtx.globalAlpha = 1.0;
        }
    }
}

function updateAndDrawExplosions() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        let p = explosionParticles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.02; 
        if (p.alpha <= 0) {
            explosionParticles.splice(i, 1);
        } else {
            canvasCtx.globalAlpha = p.alpha;
            canvasCtx.fillStyle = p.color;
            canvasCtx.beginPath();
            canvasCtx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.globalAlpha = 1.0;
        }
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 60; i++) {
        explosionParticles.push({
            x: x, y: y,
            speedX: (Math.random() - 0.5) * 15,
            speedY: (Math.random() - 0.5) * 15,
            size: Math.random() * 5 + 2,
            alpha: 1.0,
            color: color || `hsl(${Math.random() * 60 + 180}, 100%, 70%)`
        });
    }
}

function createParticles() {
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * gameCanvas.width,
            y: Math.random() * gameCanvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            color: `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.2})` 
        });
    }
}

function updateAndDrawParticles() {
    window.updateAndDrawParticles = function() {
        for (let p of particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > gameCanvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > gameCanvas.height) p.speedY *= -1;
            canvasCtx.fillStyle = p.color;
            canvasCtx.fillRect(p.x, p.y, p.size, p.size);
        }
    }
    window.updateAndDrawParticles();
}

function onHandResults(results) {
    PointerHandler.updateFromHand(results, pointers, gameCanvas);
}

function onFaceResults(results) {
    PointerHandler.updateFromFace(results, pointers, gameCanvas, detectionMode);
}

const hands = new window.Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
hands.onResults(onHandResults);

const faceMesh = new window.FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({ maxNumFaces: 2, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
faceMesh.onResults(onFaceResults);

const camera = new window.Camera(videoElement, {
    onFrame: async () => {
        if (detectionMode === 'HAND') await hands.send({ image: videoElement });
        else await faceMesh.send({ image: videoElement });
    },
    width: 640, height: 480
});

camera.start().catch(err => {
    console.error("Failed to acquire camera feed:", err);
    alert("Gagal memulai kamera.");
});

// --- Helper UI Interaksi ---
function isPointerInButton(pointer, button) {
    return (
        pointer.x >= button.x &&
        pointer.x <= button.x + button.w &&
        pointer.y >= button.y &&
        pointer.y <= button.y + button.h
    );
}

function getHoverInteraction(buttons) {
    for (let i = 0; i < pointers.length; i++) {
        if (!pointers[i].visible) continue;
        for (let btn of buttons) {
            if (isPointerInButton(pointers[i], btn)) return { button: btn, pointerIdx: i };
        }
    }
    return { button: null, pointerIdx: -1 };
}

// --- 5. Logika Utama Game ---
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000 || 0;
    lastTime = timestamp;

    canvasCtx.fillStyle = themes[currentTheme].bg;
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    updateAndDrawParticles();

    switch (gameState) {
        case GameState.MENU: drawMenu(deltaTime); break;
        case GameState.SETTINGS: drawSettings(deltaTime); break;
        case GameState.MODE_SELECTION: drawModeSelection(deltaTime); break;
        case GameState.WAITING_FOR_PLAYERS: drawWaitingOverlay(deltaTime); break;
        case GameState.COUNTDOWN: drawCountdown(deltaTime); break;
        case GameState.PLAYING:
            updatePlayer(deltaTime);
            drawPlaying(deltaTime, true);
            break;
        case GameState.GAME_OVER: drawGameOver(deltaTime); break;
        case GameState.GAME_WIN: drawGameWin(deltaTime); break;
    }

    drawModeInfoBox(); 
    
    // Gambar pointer hanya jika status bukan bermain ATAU (jika bermain, pemain belum mati & belum finish)
    for (let i = 0; i < pointers.length; i++) {
        let ptr = pointers[i];
        let p = players[i];

        if (ptr.visible && (gameState !== GameState.PLAYING || (!p.isDead && !p.hasFinished))) {
            let drawX = ptr.x;
            let drawY = ptr.y;
            
            if (gameState === GameState.COUNTDOWN) {
                drawX = p.x + p.size / 2;
                drawY = p.y + p.size / 2;
            } else if (gameState === GameState.PLAYING) {
                drawX = ptr.x + pointerOffsets[i].x;
                drawY = ptr.y + pointerOffsets[i].y;
            }

            canvasCtx.fillStyle = ptr.color; 
            canvasCtx.beginPath();
            canvasCtx.arc(drawX, drawY, 15, 0, 2 * Math.PI);
            canvasCtx.fill();
            
            canvasCtx.fillStyle = themes[currentTheme].text;
            canvasCtx.font = "bold 14px 'Orbitron'";
            canvasCtx.textAlign = 'center';
            canvasCtx.fillText(ptr.label, drawX, drawY + 5);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// --- 6. Fungsi Gambar (Render) ---
function drawModeInfoBox() {
    const boxWidth = 300; const boxHeight = 80; const margin = 20;
    const boxX = gameCanvas.width - boxWidth - margin; const boxY = margin;
    const tc = themes[currentTheme];

    canvasCtx.fillStyle = tc.btnBg;
    canvasCtx.strokeStyle = '#00FFFF'; 
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    canvasCtx.fillRect(boxX, boxY, boxWidth, boxHeight);

    const iconSize = 40; const iconX = boxX + 20;
    const iconY = boxY + (boxHeight - iconSize) / 2;
    const textX = iconX + iconSize + 15; const textY = boxY + 30;

    let modeText = detectionMode === 'HAND' ? "TANGAN" : "HIDUNG";
    
    canvasCtx.fillStyle = tc.text;
    canvasCtx.textAlign = 'left';
    canvasCtx.font = "18px 'Orbitron'";
    canvasCtx.fillText("Mode Aktif:", textX, textY);
    canvasCtx.font = "bold 24px 'Orbitron'";
    canvasCtx.fillText(modeText, textX, textY + 28);
}

function drawMenu(deltaTime) {
    const tc = themes[currentTheme];
    canvasCtx.font = "bold 72px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.shadowColor = '#00FFFF'; 
    canvasCtx.shadowBlur = 20;
    canvasCtx.fillStyle = tc.text;
    canvasCtx.fillText("CYBERGLADE MAZE", gameCanvas.width / 2, gameCanvas.height / 2 - 100);
    canvasCtx.shadowBlur = 0; 

    const btnWidth = 300; const btnHeight = 70; const btnMargin = 20;
    const startX = (gameCanvas.width / 2) - (btnWidth / 2);
    const startY = gameCanvas.height / 2 - 50;

    startButton1P.x = startX; startButton1P.y = startY; startButton1P.w = btnWidth; startButton1P.h = btnHeight;
    startButton2P.x = startX; startButton2P.y = startY + btnHeight + btnMargin; startButton2P.w = btnWidth; startButton2P.h = btnHeight;
    settingsButton.x = startX; settingsButton.y = startY + (btnHeight + btnMargin) * 2; settingsButton.w = btnWidth; settingsButton.h = btnHeight;
    modeButton.x = startX; modeButton.y = startY + (btnHeight + btnMargin) * 3; modeButton.w = btnWidth; modeButton.h = btnHeight;

    let interaction = getHoverInteraction([startButton1P, startButton2P, settingsButton, modeButton]);
    let hoveredButton = interaction.button;

    dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;

    const drawButton = (button, text, color) => {
        canvasCtx.fillStyle = tc.btnBg; 
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
        canvasCtx.fillRect(button.x, button.y, button.w, button.h);

        if (hoveredButton === button) {
            canvasCtx.shadowColor = color; canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
            canvasCtx.shadowBlur = 0;
            
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
            canvasCtx.fillStyle = color;
            canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            canvasCtx.fillStyle = '#FFFFFF'; // Paksa putih jika terisi
        } else {
            canvasCtx.fillStyle = tc.text;
        }
        canvasCtx.font = "bold 30px 'Orbitron'";
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(text, button.x + button.w / 2, button.y + 45);
    };

    drawButton(startButton1P, "MULAI (1P)", '#4299E1');
    drawButton(startButton2P, "MULAI (2P)", '#E53E3E');
    drawButton(settingsButton, "PENGATURAN", '#38A169'); 
    drawButton(modeButton, `MAP: ${difficulty}`, '#DD6B20'); 

    if (dwellTimer >= DWELL_TIME && hoveredButton) {
        if (difficulty === 'EASY') maze = easyMaze;
        else if (difficulty === 'MEDIUM') maze = mediumMaze;
        else if (difficulty === 'HARD') maze = hardMaze;
        else if (difficulty === 'TEAMWORK') maze = teamworkMaze;

        if (hoveredButton === startButton1P) {
            if (difficulty === 'TEAMWORK') {
                alert("Mode Teamwork membutuhkan 2 Pemain! Dialihkan ke 2P.");
                playerCount = 2;
                resetGame();
                gameState = GameState.WAITING_FOR_PLAYERS;
            } else {
                playerCount = 1;
                resetGame();
                gameState = GameState.COUNTDOWN;
                countdownValue = 3; countdownTimer = 0;
            }
        } else if (hoveredButton === startButton2P) {
            playerCount = 2;
            resetGame();
            gameState = GameState.WAITING_FOR_PLAYERS;
        } else if (hoveredButton === settingsButton) {
            gameState = GameState.SETTINGS;
        } else if (hoveredButton === modeButton) {
            gameState = GameState.MODE_SELECTION;
        }
        dwellTimer = 0;
    }
}

function drawModeSelection(deltaTime) {
    const tc = themes[currentTheme];
    canvasCtx.fillStyle = tc.overlay; canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    canvasCtx.fillStyle = tc.textMuted; canvasCtx.font = "bold 48px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("PILIH TIPE MAP", gameCanvas.width / 2, 150);

    const btnWidth = 350; const btnHeight = 70; const btnMargin = 20;
    const startX = (gameCanvas.width - btnWidth) / 2; const startY = 250;

    easyModeButton.x = startX; easyModeButton.y = startY; easyModeButton.w = btnWidth; easyModeButton.h = btnHeight;
    mediumModeButton.x = startX; mediumModeButton.y = startY + btnHeight + btnMargin; mediumModeButton.w = btnWidth; mediumModeButton.h = btnHeight;
    hardModeButton.x = startX; hardModeButton.y = startY + (btnHeight + btnMargin) * 2; hardModeButton.w = btnWidth; hardModeButton.h = btnHeight;
    teamworkModeButton.x = startX; teamworkModeButton.y = startY + (btnHeight + btnMargin) * 3; teamworkModeButton.w = btnWidth; teamworkModeButton.h = btnHeight;
    backToMenuButton.x = 50; backToMenuButton.y = 50; backToMenuButton.w = 150; backToMenuButton.h = 50;

    let interaction = getHoverInteraction([easyModeButton, mediumModeButton, hardModeButton, teamworkModeButton, backToMenuButton]);
    let hoveredButton = interaction.button;

    dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;

    const drawButton = (button, text, color) => {
        const isSmall = button === backToMenuButton;
        canvasCtx.fillStyle = tc.btnBg; canvasCtx.strokeStyle = color; canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
        canvasCtx.fillRect(button.x, button.y, button.w, button.h);
        
        if (hoveredButton === button) {
            canvasCtx.shadowColor = color; canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h); canvasCtx.shadowBlur = 0;
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
            canvasCtx.fillStyle = color; canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            canvasCtx.fillStyle = '#FFFFFF';
        } else {
            canvasCtx.fillStyle = tc.textMuted;
        }
        canvasCtx.font = `bold ${isSmall ? '24px' : '30px'} 'Orbitron'`;
        canvasCtx.textAlign = 'center'; canvasCtx.fillText(text, button.x + button.w / 2, button.y + (isSmall ? 32 : 45));
    };

    drawButton(easyModeButton, "EASY", '#38A169'); 
    drawButton(mediumModeButton, "MEDIUM", '#D69E2E'); 
    drawButton(hardModeButton, "HARD", '#E53E3E');
    drawButton(teamworkModeButton, "TEAMWORK", '#9F7AEA');
    drawButton(backToMenuButton, "< MENU", '#718096');

    if (dwellTimer >= DWELL_TIME && hoveredButton) {
        if (hoveredButton === easyModeButton) { difficulty = 'EASY'; gameState = GameState.MENU; }
        else if (hoveredButton === mediumModeButton) { difficulty = 'MEDIUM'; gameState = GameState.MENU; }
        else if (hoveredButton === hardModeButton) { difficulty = 'HARD'; gameState = GameState.MENU; }
        else if (hoveredButton === teamworkModeButton) { difficulty = 'TEAMWORK'; gameState = GameState.MENU; }
        else if (hoveredButton === backToMenuButton) { gameState = GameState.MENU; }
        dwellTimer = 0;
    }
}

function drawSettings(deltaTime) {
    const tc = themes[currentTheme];
    canvasCtx.fillStyle = tc.overlay; canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    canvasCtx.fillStyle = tc.textMuted; canvasCtx.font = "bold 48px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("PENGATURAN", gameCanvas.width / 2, 150); 

    const btnWidth = 400; const btnHeight = 60; const btnMargin = 20;
    const startX = (gameCanvas.width - btnWidth) / 2; const startY = 250;

    const titleWidth = canvasCtx.measureText("PENGATURAN").width;
    closeSettingsButton.w = 50; closeSettingsButton.h = 50;
    closeSettingsButton.x = (gameCanvas.width / 2) + (titleWidth / 2) + 20; 
    closeSettingsButton.y = 150 - (closeSettingsButton.h / 2); 

    themeToggleButton.x = startX; themeToggleButton.y = startY; themeToggleButton.w = btnWidth; themeToggleButton.h = btnHeight;
    settingOption1Button.x = startX; settingOption1Button.y = startY + btnHeight + btnMargin; settingOption1Button.w = btnWidth; settingOption1Button.h = btnHeight;
    settingOption2Button.x = startX; settingOption2Button.y = startY + (btnHeight + btnMargin) * 2; settingOption2Button.w = btnWidth; settingOption2Button.h = btnHeight;

    let interaction = getHoverInteraction([themeToggleButton, settingOption1Button, settingOption2Button, closeSettingsButton]);
    let hoveredButton = interaction.button;

    dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;

    const drawOptionButton = (button, text, highlightColor) => {
        canvasCtx.fillStyle = tc.btnBg; canvasCtx.strokeStyle = highlightColor; canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
        canvasCtx.fillRect(button.x, button.y, button.w, button.h);

        if (hoveredButton === button) {
            canvasCtx.shadowColor = highlightColor; canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h); canvasCtx.shadowBlur = 0;
            
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
            canvasCtx.fillStyle = highlightColor; canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            canvasCtx.fillStyle = '#FFFFFF';
        } else {
            canvasCtx.fillStyle = tc.textMuted;
        }
        canvasCtx.font = "24px 'Orbitron'"; canvasCtx.textAlign = 'center';
        canvasCtx.fillText(text, button.x + button.w / 2, button.y + 38);
    };

    drawOptionButton(themeToggleButton, `Tema: ${currentTheme === 'DARK' ? 'GELAP' : 'TERANG'}`, '#D69E2E');
    drawOptionButton(settingOption1Button, "Ganti Mode: Tangan", '#4299E1');
    drawOptionButton(settingOption2Button, "Ganti Mode: Hidung", '#4299E1');

    // Close Button
    canvasCtx.fillStyle = tc.btnBg; canvasCtx.strokeStyle = '#E53E3E'; canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(closeSettingsButton.x, closeSettingsButton.y, closeSettingsButton.w, closeSettingsButton.h);
    canvasCtx.fillRect(closeSettingsButton.x, closeSettingsButton.y, closeSettingsButton.w, closeSettingsButton.h);
    
    if (hoveredButton === closeSettingsButton) {
        canvasCtx.shadowColor = '#E53E3E'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(closeSettingsButton.x, closeSettingsButton.y, closeSettingsButton.w, closeSettingsButton.h);
        canvasCtx.shadowBlur = 0;
        const fillWidth = Math.min((dwellTimer / DWELL_TIME) * closeSettingsButton.w, closeSettingsButton.w);
        canvasCtx.fillStyle = '#E53E3E'; canvasCtx.fillRect(closeSettingsButton.x, closeSettingsButton.y, fillWidth, closeSettingsButton.h);
        canvasCtx.fillStyle = '#FFFFFF';
    } else {
        canvasCtx.fillStyle = tc.textMuted;
    }
    canvasCtx.font = "bold 36px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("X", closeSettingsButton.x + closeSettingsButton.w / 2, closeSettingsButton.y + 38);

    if (dwellTimer >= DWELL_TIME && hoveredButton) {
        if (hoveredButton === closeSettingsButton) gameState = GameState.MENU;
        else if (hoveredButton === themeToggleButton) {
            currentTheme = currentTheme === 'DARK' ? 'LIGHT' : 'DARK';
        }
        else if (hoveredButton === settingOption1Button) detectionMode = 'HAND';
        else if (hoveredButton === settingOption2Button) detectionMode = 'NOSE';
        dwellTimer = 0;
    }
}

function drawWaitingOverlay(deltaTime) {
    drawPlaying(deltaTime, false); 
    const tc = themes[currentTheme];
    
    canvasCtx.fillStyle = tc.overlay;
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    canvasCtx.fillStyle = tc.textMuted;
    canvasCtx.font = "bold 36px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("MENUNGGU 2 PEMAIN TERDETEKSI...", gameCanvas.width / 2, gameCanvas.height / 2);

    if (pointers[0].visible && pointers[1].visible) {
        gameState = GameState.COUNTDOWN;
        countdownValue = 3;
        countdownTimer = 0;
    }
}

function drawCountdown(deltaTime) {
    drawPlaying(deltaTime, false); 

    countdownTimer += deltaTime;
    if (countdownTimer >= 1.0) {
        countdownTimer = 0;
        countdownValue--;
    }

    let text = countdownValue > 0 ? countdownValue.toString() : "GO!";
    let scale = 1 + (countdownTimer * 1.5); 
    let alpha = Math.max(0, 1 - countdownTimer); 

    canvasCtx.save();
    canvasCtx.translate(gameCanvas.width / 2, gameCanvas.height / 2);
    canvasCtx.scale(scale, scale);
    
    // Warna tulisan tergantung tema agar terlihat
    let textColor = currentTheme === 'DARK' ? '255, 255, 255' : '26, 32, 44';
    canvasCtx.fillStyle = `rgba(${textColor}, ${alpha})`;
    if (countdownValue === 0) canvasCtx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
    canvasCtx.font = "bold 80px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(text, 0, 0);
    canvasCtx.restore();

    if (countdownValue < 0) {
        startTime = performance.now();
        gameState = GameState.PLAYING;
    }
}

function drawPlaying(deltaTime, isActive = true) {
    const tc = themes[currentTheme];

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tile = maze[y][x];
            const tileX = offsetX + x * tileSize;
            const tileY = offsetY + y * tileSize;

            if (tile === 1) canvasCtx.fillStyle = tc.wall; 
            else if (tile === 2) canvasCtx.fillStyle = 'rgba(0, 150, 0, 0.5)'; 
            else if (tile === 3) canvasCtx.fillStyle = '#38A169'; // Finish Normal / Finish Kiri
            else if (tile === 4) canvasCtx.fillStyle = '#E53E3E'; // Garis Start
            else if (tile === 5) canvasCtx.fillStyle = '#E53E3E'; // Finish Kiri (Teamwork)
            else if (tile === 6) canvasCtx.fillStyle = '#38A169'; // Finish Kanan (Teamwork)
            else canvasCtx.fillStyle = tc.path; 
            
            canvasCtx.fillRect(tileX, tileY, tileSize, tileSize);
            canvasCtx.strokeStyle = tc.gridBorder;
            canvasCtx.strokeRect(tileX, tileY, tileSize, tileSize);
        }
    }

    if (isActive) {
        updateAndDrawPlayerTrail();
        updateAndDrawExplosions(); 
    }

    // Gambar Pemain (hanya yang belum mati dan belum mencapai finish)
    for (let i = 0; i < playerCount; i++) {
        if (players[i].isDead || players[i].hasFinished) continue; 

        canvasCtx.fillStyle = players[i].color; 
        canvasCtx.fillRect(players[i].x, players[i].y, players[i].size, players[i].size);
        canvasCtx.fillStyle = '#FFF';
        canvasCtx.font = "bold 12px 'Orbitron'";
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(players[i].label, players[i].x + players[i].size/2, players[i].y + players[i].size/2 + 5);
    }

    let timerText = "Waktu: 0.00s";
    if (startTime > 0 && isActive) { 
        elapsedTime = (performance.now() - startTime) / 1000;
        timerText = `Waktu: ${elapsedTime.toFixed(2)}s`;
    } else if (!isActive && startTime > 0) {
        timerText = `Waktu: ${elapsedTime.toFixed(2)}s`;
    }
    canvasCtx.fillStyle = tc.textMuted;
    canvasCtx.font = "bold 24px 'Orbitron'";
    canvasCtx.textAlign = 'left';
    canvasCtx.fillText(timerText, 20, 40);
}

function drawGameOver(deltaTime) {
    const tc = themes[currentTheme];
    canvasCtx.fillStyle = 'rgba(150, 0, 0, 0.7)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 60px 'Orbitron'"; canvasCtx.textAlign = 'center';
    let failMsg = difficulty === 'TEAMWORK' ? "T I M  G A G A L" : "K A L A H";
    canvasCtx.fillText(failMsg, gameCanvas.width / 2, gameCanvas.height / 2 - 100);

    const statsText = `Waktu: ${elapsedTime > 0 ? elapsedTime.toFixed(2) : '0.00'}s`;
    canvasCtx.font = "30px 'Orbitron'";
    canvasCtx.fillText(statsText, gameCanvas.width / 2, gameCanvas.height / 2 - 50);

    const btnWidth = 300; const btnHeight = 80; const btnMargin = 20;
    const btnX = (gameCanvas.width / 2) - (btnWidth / 2); 
    const restartBtnY = gameCanvas.height / 2; 
    restartButton.x = btnX; restartButton.y = restartBtnY; restartButton.w = btnWidth; restartButton.h = btnHeight;
    const menuBtnY = restartBtnY + btnHeight + btnMargin; 
    menuButton.x = btnX; menuButton.y = menuBtnY; menuButton.w = btnWidth; menuButton.h = btnHeight;

    let interaction = getHoverInteraction([restartButton, menuButton]);
    let hoveredButton = interaction.button;

    dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;

    canvasCtx.fillStyle = tc.btnBg; canvasCtx.strokeStyle = '#E53E3E'; canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    canvasCtx.fillRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    
    canvasCtx.strokeStyle = '#4299E1';
    canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);
    canvasCtx.fillRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);

    if (hoveredButton === restartButton) {
        canvasCtx.shadowColor = '#E53E3E'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h); canvasCtx.shadowBlur = 0;
        const fillWidth = Math.min((dwellTimer / DWELL_TIME) * restartButton.w, restartButton.w);
        canvasCtx.fillStyle = '#E53E3E'; canvasCtx.fillRect(restartButton.x, restartButton.y, fillWidth, restartButton.h);
        canvasCtx.fillStyle = '#FFFFFF';
    } else {
        canvasCtx.fillStyle = tc.textMuted;
    }
    canvasCtx.font = "bold 30px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("COBA LAGI", restartButton.x + restartButton.w / 2, restartButton.y + 50);

    if (hoveredButton === menuButton) {
        canvasCtx.shadowColor = '#4299E1'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h); canvasCtx.shadowBlur = 0;
        const fillWidth = Math.min((dwellTimer / DWELL_TIME) * menuButton.w, menuButton.w);
        canvasCtx.fillStyle = '#4299E1'; canvasCtx.fillRect(menuButton.x, menuButton.y, fillWidth, menuButton.h);
        canvasCtx.fillStyle = '#FFFFFF';
    } else {
        canvasCtx.fillStyle = tc.textMuted;
    }
    canvasCtx.fillText("MENU UTAMA", menuButton.x + menuButton.w / 2, menuButton.y + 50);

    if (dwellTimer >= DWELL_TIME && hoveredButton) {
        if (hoveredButton === restartButton) {
            resetGame();
            gameState = playerCount === 2 ? GameState.WAITING_FOR_PLAYERS : GameState.COUNTDOWN;
            countdownValue = 3; countdownTimer = 0;
        } else if (hoveredButton === menuButton) {
            gameState = GameState.MENU;
        }
        dwellTimer = 0;
    }
}

function drawGameWin(deltaTime) {
    const tc = themes[currentTheme];
    canvasCtx.fillStyle = 'rgba(0, 100, 0, 0.7)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 50px 'Orbitron'"; canvasCtx.textAlign = 'center';
    
    let winMsg = "M E N A N G !";
    if (difficulty === 'TEAMWORK') winMsg = "KERJA SAMA BERHASIL!";
    else if (playerCount === 2) winMsg = `PEMAIN '${winnerLabel}' MENANG!`;
    
    canvasCtx.fillText(winMsg, gameCanvas.width / 2, gameCanvas.height / 2 - 100);

    const statsText = `Waktu: ${elapsedTime.toFixed(2)}s`;
    canvasCtx.font = "30px 'Orbitron'";
    canvasCtx.fillText(statsText, gameCanvas.width / 2, gameCanvas.height / 2 - 50);

    const btnWidth = 300; const btnHeight = 80; const btnMargin = 20;
    const btnX = (gameCanvas.width / 2) - (btnWidth / 2); 
    const restartBtnY = gameCanvas.height / 2; 
    restartButton.x = btnX; restartButton.y = restartBtnY; restartButton.w = btnWidth; restartButton.h = btnHeight;
    const menuBtnY = restartBtnY + btnHeight + btnMargin; 
    menuButton.x = btnX; menuButton.y = menuBtnY; menuButton.w = btnWidth; menuButton.h = btnHeight;

    let interaction = getHoverInteraction([restartButton, menuButton]);
    let hoveredButton = interaction.button;

    dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;

    canvasCtx.fillStyle = tc.btnBg; canvasCtx.strokeStyle = '#38a169'; canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    canvasCtx.fillRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    
    canvasCtx.strokeStyle = '#4299E1';
    canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);
    canvasCtx.fillRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);

    if (hoveredButton === restartButton) {
        canvasCtx.shadowColor = '#38a169'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h); canvasCtx.shadowBlur = 0;
        const fillWidth = Math.min((dwellTimer / DWELL_TIME) * restartButton.w, restartButton.w);
        canvasCtx.fillStyle = '#38a169'; canvasCtx.fillRect(restartButton.x, restartButton.y, fillWidth, restartButton.h);
        canvasCtx.fillStyle = '#FFFFFF';
    } else {
        canvasCtx.fillStyle = tc.textMuted;
    }
    canvasCtx.font = "bold 30px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("COBA LAGI", restartButton.x + restartButton.w / 2, restartButton.y + 50);

    if (hoveredButton === menuButton) {
        canvasCtx.shadowColor = '#4299E1'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h); canvasCtx.shadowBlur = 0;
        const fillWidth = Math.min((dwellTimer / DWELL_TIME) * menuButton.w, menuButton.w);
        canvasCtx.fillStyle = '#4299E1'; canvasCtx.fillRect(menuButton.x, menuButton.y, fillWidth, menuButton.h);
        canvasCtx.fillStyle = '#FFFFFF';
    } else {
        canvasCtx.fillStyle = tc.textMuted;
    }
    canvasCtx.fillText("MENU UTAMA", menuButton.x + menuButton.w / 2, menuButton.y + 50);
    
    if (dwellTimer >= DWELL_TIME && hoveredButton) {
        if (hoveredButton === restartButton) {
            resetGame();
            gameState = playerCount === 2 ? GameState.WAITING_FOR_PLAYERS : GameState.COUNTDOWN;
            countdownValue = 3; countdownTimer = 0;
        } else if (hoveredButton === menuButton) {
            gameState = GameState.MENU;
        }
        dwellTimer = 0;
    }
}

// --- 7. Fungsi Update & Utilitas ---
function updatePlayer(deltaTime) {
    for (let i = 0; i < playerCount; i++) {
        // Jangan update jika mati atau sudah selesai
        if (players[i].isDead || players[i].hasFinished) continue; 

        if (!pointers[i].visible) {
            pointerWasVisible[i] = false; 
            continue;
        }

        if (!pointerWasVisible[i]) {
            pointerOffsets[i].x = players[i].x + players[i].size / 2 - pointers[i].x;
            pointerOffsets[i].y = players[i].y + players[i].size / 2 - pointers[i].y;
            pointerWasVisible[i] = true;
        }

        players[i].x = (pointers[i].x + pointerOffsets[i].x) - players[i].size / 2;
        players[i].y = (pointers[i].y + pointerOffsets[i].y) - players[i].size / 2;

        players[i].x = Math.max(offsetX, Math.min(players[i].x, offsetX + (GRID_SIZE * tileSize) - players[i].size));
        players[i].y = Math.max(offsetY, Math.min(players[i].y, offsetY + (GRID_SIZE * tileSize) - players[i].size));

        checkCollision(i);
    }
}

function respawnPlayer(index) {
    let spawnFound = false;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (maze[y][x] === 2) {
                let tileCenterX = offsetX + x * tileSize + tileSize / 2;
                let tileCenterY = offsetY + y * tileSize + tileSize / 2;

                if (playerCount === 1) {
                    players[index].x = tileCenterX - players[index].size / 2;
                    players[index].y = tileCenterY - players[index].size / 2;
                } else {
                    let offset = tileSize * 0.25; 
                    if (index === 0) players[index].x = tileCenterX - offset - players[index].size / 2; // Kiri
                    else players[index].x = tileCenterX + offset - players[index].size / 2; // Kanan
                    
                    players[index].y = tileCenterY - players[index].size / 2;
                }
                spawnFound = true;
                break;
            }
        }
        if(spawnFound) break;
    }
    if (!spawnFound) {
        players[index].x = gameCanvas.width / 2 - players[index].size / 2;
        players[index].y = gameCanvas.height / 2 - players[index].size / 2;
    }
}

function checkCollision(playerIndex) {
    const p = players[playerIndex];
    if (p.isDead || p.hasFinished) return;

    const playerCenterX = p.x + p.size / 2;
    const playerCenterY = p.y + p.size / 2;

    const gridX = Math.floor((playerCenterX - offsetX) / tileSize);
    const gridY = Math.floor((playerCenterY - offsetY) / tileSize);
    
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) return;

    const tile = maze[gridY][gridX];

    if (tile === 1) { // Tembok
        if (difficulty === 'TEAMWORK') {
            // Teamwork: 1 mati, semua mati
            players[0].isDead = true;
            players[1].isDead = true;
            createExplosion(players[0].x + players[0].size/2, players[0].y + players[0].size/2, players[0].color);
            createExplosion(players[1].x + players[1].size/2, players[1].y + players[1].size/2, players[1].color);
            gameState = GameState.GAME_OVER;
            if (startTime > 0) { elapsedTime = (performance.now() - startTime) / 1000; startTime = 0; }
        } else if (playerCount === 1) {
            gameState = GameState.GAME_OVER;
            if (startTime > 0) { elapsedTime = (performance.now() - startTime) / 1000; startTime = 0; }
        } else {
            // Normal 2P
            p.isDead = true;
            createExplosion(playerCenterX, playerCenterY, p.color);
            
            if (players[0].isDead && players[1].isDead) {
                gameState = GameState.GAME_OVER;
                if (startTime > 0) { elapsedTime = (performance.now() - startTime) / 1000; startTime = 0; }
            }
        }
    } else if (difficulty === 'TEAMWORK') {
        // Logika Finish Teamwork: L(0) harus ke 3, R(1) harus ke 5
        if ((playerIndex === 0 && tile === 3) || (playerIndex === 1 && tile === 5)) {
            p.hasFinished = true;
            if (players[0].hasFinished && players[1].hasFinished) {
                gameState = GameState.GAME_WIN;
                if (startTime > 0) { elapsedTime = (performance.now() - startTime) / 1000; startTime = 0; }
            }
        }
    } else if (tile === 3) { 
        // Normal Win 
        gameState = GameState.GAME_WIN;
        winnerLabel = p.label;
        if (startTime > 0) { 
           elapsedTime = (performance.now() - startTime) / 1000;
           startTime = 0;
        }
    } else if (tile === 4 && startTime === 0) { 
        startTime = performance.now();
    }
}

function resetGame() {
    startTime = 0;
    elapsedTime = 0;
    playerTrail = []; 
    explosionParticles = [];
    winnerLabel = "";

    for (let i = 0; i < playerCount; i++) {
        players[i].isDead = false; 
        players[i].hasFinished = false; // Reset status menang
        pointerWasVisible[i] = false; 
        respawnPlayer(i);
    }
}

function resizeCanvas() {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;

    const minDim = Math.min(gameCanvas.width, gameCanvas.height);
    tileSize = Math.floor((minDim * 0.9) / GRID_SIZE); 

    const mazeWidth = tileSize * GRID_SIZE;
    const mazeHeight = tileSize * GRID_SIZE;
    offsetX = (gameCanvas.width - mazeWidth) / 2;
    offsetY = (gameCanvas.height - mazeHeight) / 2;

    for (let p of players) p.size = tileSize * 0.4;
    resetGame();
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', () => {
    createParticles(); 
    resizeCanvas(); 

    if (window.IntroAnimation && typeof window.IntroAnimation.start === 'function') {
        window.IntroAnimation.start(() => {
            bgMusic.play().catch(e => console.log("Autoplay musik gagal."));
            requestAnimationFrame(gameLoop); 
        });
    } else {
        requestAnimationFrame(gameLoop);
    }
});