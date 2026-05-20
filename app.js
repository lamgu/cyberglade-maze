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
    CUSTOM_EDITOR: 'CUSTOM_EDITOR',
    WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS', 
    COUNTDOWN: 'COUNTDOWN', 
    GAME_OVER: 'GAME_OVER', 
    GAME_WIN: 'GAME_WIN'
};
let gameState = GameState.MENU;

let detectionMode = 'HAND'; 
let difficulty = 'EASY'; 
let customMaze = null;

const DWELL_TIME = 1.5; 
let dwellTimer = 0;
const bgMusic = new Audio('https://files.catbox.moe/uswvy3.mp3');
bgMusic.loop = true;

// Waktu permainan
let startTime = 0;
let elapsedTime = 0;

// Tombol Menu Utama
const startButton1P = { x: 0, y: 0, w: 0, h: 0 };
const startButton2P = { x: 0, y: 0, w: 0, h: 0 };
const settingsButton = { x: 0, y: 0, w: 0, h: 0 };
const modeButton = { x: 0, y: 0, w: 0, h: 0 };

// Tombol Settings
const closeSettingsButton = { x: 0, y: 0, w: 0, h: 0 };
const settingOption1Button = { x: 0, y: 0, w: 0, h: 0 };
const settingOption2Button = { x: 0, y: 0, w: 0, h: 0 };
const settingOption3Button = { x: 0, y: 0, w: 0, h: 0 };
const settingOption4Button = { x: 0, y: 0, w: 0, h: 0 };

// Tombol Pemilihan Mode
const easyModeButton = { x: 0, y: 0, w: 0, h: 0 };
const hardModeButton = { x: 0, y: 0, w: 0, h: 0 };
const customModeButton = { x: 0, y: 0, w: 0, h: 0 };
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
let pointerWasVisible = [false, false]; // BARU: Lacak transisi terlihat/tidak

// Players (MODIFIKASI: Tambah isDead untuk status mati)
const players = [
    { x: 0, y: 0, size: 0, color: '#FF3333', label: 'L', isDead: false },
    { x: 0, y: 0, size: 0, color: '#33FF33', label: 'R', isDead: false }
];

let playerTrail = [];
let explosionParticles = [];
let particles = [];

// --- 3. Logika Maze & Level ---
const GRID_SIZE = 19;
let tileSize = 0;    
let offsetX = 0;     
let offsetY = 0;      

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
let maze = easyMaze;

// --- 4. Fungsi Deteksi & Visual ---
function playSound(sound) {
    sound.currentTime = 0; 
    sound.play().catch(e => {}); 
}

function updateAndDrawPlayerTrail() {
    if (gameState === GameState.PLAYING) {
        for (let i = 0; i < playerCount; i++) {
            // MODIFIKASI: Jangan gambar jejak jika pemain mati
            if (pointers[i].visible && !players[i].isDead) {
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

// BARU: Fungsi update & gambar ledakan
function updateAndDrawExplosions() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        let p = explosionParticles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.02; // memudar perlahan
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
hands.setOptions({
    maxNumHands: 2, 
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onHandResults);

const faceMesh = new window.FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
    maxNumFaces: 2, 
    refineLandmarks: true, 
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
faceMesh.onResults(onFaceResults);

const camera = new window.Camera(videoElement, {
    onFrame: async () => {
        if (detectionMode === 'HAND') { 
            await hands.send({ image: videoElement });
        } else { 
            await faceMesh.send({ image: videoElement });
        }
    },
    width: 640,
    height: 480
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
            if (isPointerInButton(pointers[i], btn)) {
                return { button: btn, pointerIdx: i };
            }
        }
    }
    return { button: null, pointerIdx: -1 };
}

// --- 5. Logika Utama Game ---
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000 || 0;
    lastTime = timestamp;

    canvasCtx.fillStyle = '#000022';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    updateAndDrawParticles();

    switch (gameState) {
        case GameState.MENU: drawMenu(deltaTime); break;
        case GameState.SETTINGS: drawSettings(deltaTime); break;
        case GameState.MODE_SELECTION: drawModeSelection(deltaTime); break;
        case GameState.CUSTOM_EDITOR:
            let interaction = getHoverInteraction([window.LevelEditor.startButton]);
            let isEditorClicked = false;
            if (interaction.pointerIdx !== -1) {
                 if (detectionMode === 'EYE') isEditorClicked = PointerHandler.blinkTriggered[interaction.pointerIdx];
                 else isEditorClicked = (dwellTimer >= DWELL_TIME);
            }
            if (window.LevelEditor) {
                let activePtr = pointers.find(p => p.visible) || pointers[0];
                window.LevelEditor.updateAndDraw(canvasCtx, activePtr, isEditorClicked, deltaTime);
            }
            break;
        case GameState.WAITING_FOR_PLAYERS:
            drawWaitingOverlay(deltaTime);
            break;
        case GameState.COUNTDOWN:
            drawCountdown(deltaTime);
            break;
        case GameState.PLAYING:
            updatePlayer(deltaTime);
            drawPlaying(deltaTime, true);
            break;
        case GameState.GAME_OVER: drawGameOver(deltaTime); break;
        case GameState.GAME_WIN: drawGameWin(deltaTime); break;
    }

    drawModeInfoBox(); 
    
    // Gambar pointer hanya jika status bukan bermain ATAU (jika bermain, pemain tersebut belum mati)
    for (let i = 0; i < pointers.length; i++) {
        let ptr = pointers[i];
        let p = players[i];

        if (ptr.visible && (gameState !== GameState.PLAYING || !p.isDead)) {
            // MODIFIKASI: Kunci posisi saat COUNTDOWN, gunakan offset saat PLAYING
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
            
            canvasCtx.fillStyle = '#FFFFFF';
            canvasCtx.font = "bold 14px 'Orbitron'";
            canvasCtx.textAlign = 'center';
            canvasCtx.fillText(ptr.label, drawX, drawY + 5);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// --- 6. Fungsi Gambar (Render) ---
function drawModeInfoBox() {
    const boxWidth = 300;
    const boxHeight = 80;
    const margin = 20;
    const boxX = gameCanvas.width - boxWidth - margin;
    const boxY = margin;

    canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)';
    canvasCtx.strokeStyle = '#00FFFF'; 
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    const iconSize = 40;
    const iconX = boxX + 20;
    const iconY = boxY + (boxHeight - iconSize) / 2;
    const textX = iconX + iconSize + 15;
    const textY = boxY + 30;

    let modeText = detectionMode === 'HAND' ? "TANGAN" : (detectionMode === 'NOSE' ? "HIDUNG" : "MATA (Kedip)");
    
    canvasCtx.fillStyle = '#FFFFFF';
    canvasCtx.textAlign = 'left';
    canvasCtx.font = "18px 'Orbitron'";
    canvasCtx.fillText("Mode Aktif:", textX, textY);
    canvasCtx.font = "bold 24px 'Orbitron'";
    canvasCtx.fillText(modeText, textX, textY + 28);
}

function drawMenu(deltaTime) {
    canvasCtx.font = "bold 72px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.shadowColor = '#00FFFF'; 
    canvasCtx.shadowBlur = 20;
    canvasCtx.fillStyle = '#FFFFFF';
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

    if (detectionMode !== 'EYE') dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    if (!hoveredButton) dwellTimer = 0;

    const drawButton = (button, text, color) => {
        canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)'; 
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);

        if (hoveredButton === button) {
            canvasCtx.shadowColor = color; canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
            canvasCtx.shadowBlur = 0;
            if (detectionMode !== 'EYE') { 
                const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
                canvasCtx.fillStyle = color;
                canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            }
        }
        canvasCtx.fillStyle = '#FFFFFF';
        canvasCtx.font = "bold 30px 'Orbitron'";
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(text, button.x + button.w / 2, button.y + 45);
    };

    drawButton(startButton1P, "MULAI (1P)", '#4299E1');
    drawButton(startButton2P, "MULAI (2P)", '#E53E3E');
    drawButton(settingsButton, "MODE", '#38A169'); 
    drawButton(modeButton, "GANTI TIPE MAP", '#DD6B20'); 

    const isClicked = (detectionMode === 'EYE' && interaction.pointerIdx !== -1 && PointerHandler.blinkTriggered[interaction.pointerIdx]) || 
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME);

    if (isClicked && hoveredButton) {
        if (difficulty === 'EASY') maze = easyMaze;
        else if (difficulty === 'HARD') maze = hardMaze;
        else if (difficulty === 'CUSTOM' && customMaze) maze = customMaze;
        else maze = easyMaze;

        if (hoveredButton === startButton1P) {
            playerCount = 1;
            resetGame();
            gameState = GameState.COUNTDOWN;
            countdownValue = 3; countdownTimer = 0;
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
    canvasCtx.fillStyle = 'rgba(0, 0, 34, 0.9)'; canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 48px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("PILIH TIPE MAP", gameCanvas.width / 2, 150);

    const btnWidth = 350; const btnHeight = 70; const btnMargin = 20;
    const startX = (gameCanvas.width - btnWidth) / 2; const startY = 250;

    easyModeButton.x = startX; easyModeButton.y = startY; easyModeButton.w = btnWidth; easyModeButton.h = btnHeight;
    hardModeButton.x = startX; hardModeButton.y = startY + btnHeight + btnMargin; hardModeButton.w = btnWidth; hardModeButton.h = btnHeight;
    customModeButton.x = startX; customModeButton.y = startY + (btnHeight + btnMargin) * 2; customModeButton.w = btnWidth; customModeButton.h = btnHeight;
    backToMenuButton.x = 50; backToMenuButton.y = 50; backToMenuButton.w = 150; backToMenuButton.h = 50;

    let interaction = getHoverInteraction([easyModeButton, hardModeButton, customModeButton, backToMenuButton]);
    let hoveredButton = interaction.button;

    if (detectionMode !== 'EYE') dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    if (!hoveredButton) dwellTimer = 0;

    const drawButton = (button, text, color) => {
        const isSmall = button === backToMenuButton;
        canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)'; canvasCtx.strokeStyle = color; canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
        
        if (hoveredButton === button) {
            canvasCtx.shadowColor = color; canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h); canvasCtx.shadowBlur = 0;
            if (detectionMode !== 'EYE') {
                const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
                canvasCtx.fillStyle = color; canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            }
        }
        canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = `bold ${isSmall ? '24px' : '30px'} 'Orbitron'`;
        canvasCtx.textAlign = 'center'; canvasCtx.fillText(text, button.x + button.w / 2, button.y + (isSmall ? 32 : 45));
    };

    drawButton(easyModeButton, "EASY", '#38A169'); drawButton(hardModeButton, "HARD", '#DD6B20');
    drawButton(customModeButton, "CUSTOM", '#4299E1'); drawButton(backToMenuButton, "< MENU", '#E53E3E');

    const isClicked = (detectionMode === 'EYE' && interaction.pointerIdx !== -1 && PointerHandler.blinkTriggered[interaction.pointerIdx]) ||
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME);

    if (isClicked && hoveredButton) {
        if (hoveredButton === easyModeButton) { difficulty = 'EASY'; gameState = GameState.MENU; }
        else if (hoveredButton === hardModeButton) { difficulty = 'HARD'; gameState = GameState.MENU; }
        else if (hoveredButton === customModeButton) {
            difficulty = 'CUSTOM';
            window.LevelEditor.init(canvasCtx, (newMaze) => {
                customMaze = newMaze; gameState = GameState.MENU;
            });
            gameState = GameState.CUSTOM_EDITOR;
        }
        else if (hoveredButton === backToMenuButton) { gameState = GameState.MENU; }
        dwellTimer = 0;
    }
}

function drawSettings(deltaTime) {
    canvasCtx.fillStyle = 'rgba(0, 0, 34, 0.9)'; canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 48px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("PILIH MODE KONTROL", gameCanvas.width / 2, 150); 

    const btnWidth = 400; const btnHeight = 60; const btnMargin = 20;
    const startX = (gameCanvas.width - btnWidth) / 2; const startY = 250;

    const titleWidth = canvasCtx.measureText("PILIH MODE KONTROL").width;
    closeSettingsButton.w = 50; closeSettingsButton.h = 50;
    closeSettingsButton.x = (gameCanvas.width / 2) + (titleWidth / 2) + 20; 
    closeSettingsButton.y = 150 - (closeSettingsButton.h / 2); 

    settingOption1Button.x = startX; settingOption1Button.y = startY; settingOption1Button.w = btnWidth; settingOption1Button.h = btnHeight;
    settingOption2Button.x = startX; settingOption2Button.y = startY + btnHeight + btnMargin; settingOption2Button.w = btnWidth; settingOption2Button.h = btnHeight;
    settingOption3Button.x = startX; settingOption3Button.y = startY + (btnHeight + btnMargin) * 2; settingOption3Button.w = btnWidth; settingOption3Button.h = btnHeight;
    settingOption4Button.x = startX; settingOption4Button.y = startY + (btnHeight + btnMargin) * 3; settingOption4Button.w = btnWidth; settingOption4Button.h = btnHeight;

    let interaction = getHoverInteraction([settingOption1Button, settingOption2Button, settingOption3Button, settingOption4Button, closeSettingsButton]);
    let hoveredButton = interaction.button;

    if (detectionMode !== 'EYE') dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    if (!hoveredButton) dwellTimer = 0;

    const drawOptionButton = (button, text) => {
        canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)'; canvasCtx.strokeStyle = '#4299E1'; canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);

        if (hoveredButton === button) {
            canvasCtx.shadowColor = '#4299E1'; canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h); canvasCtx.shadowBlur = 0;
            if (detectionMode !== 'EYE') {
                const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
                canvasCtx.fillStyle = '#4299E1'; canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            }
        }
        canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "24px 'Orbitron'"; canvasCtx.textAlign = 'center';
        canvasCtx.fillText(text, button.x + button.w / 2, button.y + 38);
    };

    drawOptionButton(settingOption1Button, "Ganti Mode: Tangan");
    drawOptionButton(settingOption2Button, "Ganti Mode: Hidung");
    drawOptionButton(settingOption3Button, "Ganti Mode: Mata (Kedip)"); 
    drawOptionButton(settingOption4Button, `Mode Aktif: ${detectionMode}`); 

    canvasCtx.fillStyle = 'rgba(80, 20, 20, 0.7)'; canvasCtx.strokeStyle = '#E53E3E'; canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(closeSettingsButton.x, closeSettingsButton.y, closeSettingsButton.w, closeSettingsButton.h);
    
    if (hoveredButton === closeSettingsButton) {
        canvasCtx.shadowColor = '#E53E3E'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(closeSettingsButton.x, closeSettingsButton.y, closeSettingsButton.w, closeSettingsButton.h);
        canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * closeSettingsButton.w, closeSettingsButton.w);
            canvasCtx.fillStyle = '#FEB2B2'; canvasCtx.fillRect(closeSettingsButton.x, closeSettingsButton.y, fillWidth, closeSettingsButton.h);
        }
    }
    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 36px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("X", closeSettingsButton.x + closeSettingsButton.w / 2, closeSettingsButton.y + 38);

    const isClicked = (detectionMode === 'EYE' && interaction.pointerIdx !== -1 && PointerHandler.blinkTriggered[interaction.pointerIdx]) ||
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME);

    if (isClicked && hoveredButton) {
        if (hoveredButton === closeSettingsButton) gameState = GameState.MENU;
        else if (hoveredButton === settingOption1Button) detectionMode = 'HAND';
        else if (hoveredButton === settingOption2Button) detectionMode = 'NOSE';
        else if (hoveredButton === settingOption3Button) detectionMode = 'EYE';
        dwellTimer = 0;
    }
}

function drawWaitingOverlay(deltaTime) {
    drawPlaying(deltaTime, false); 
    
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    canvasCtx.fillStyle = '#E2E8F0';
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
    canvasCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
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
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tile = maze[y][x];
            const tileX = offsetX + x * tileSize;
            const tileY = offsetY + y * tileSize;

            if (tile === 1) canvasCtx.fillStyle = '#4A5568'; 
            else if (tile === 2) canvasCtx.fillStyle = 'rgba(0, 150, 0, 0.5)'; 
            else if (tile === 3) canvasCtx.fillStyle = '#38A169'; 
            else if (tile === 4) canvasCtx.fillStyle = '#E53E3E'; 
            else canvasCtx.fillStyle = '#1A202C'; 
            
            canvasCtx.fillRect(tileX, tileY, tileSize, tileSize);
            canvasCtx.strokeStyle = '#000022';
            canvasCtx.strokeRect(tileX, tileY, tileSize, tileSize);
        }
    }

    if (isActive) {
        updateAndDrawPlayerTrail();
        updateAndDrawExplosions(); // Update ledakan jika ada
    }

    // Gambar Pemain (hanya yang belum mati)
    for (let i = 0; i < playerCount; i++) {
        if (players[i].isDead) continue; // Jangan gambar jika mati

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
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 24px 'Orbitron'";
    canvasCtx.textAlign = 'left';
    canvasCtx.fillText(timerText, 20, 40);
}

function drawGameOver(deltaTime) {
    canvasCtx.fillStyle = 'rgba(150, 0, 0, 0.7)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 60px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("K A L A H", gameCanvas.width / 2, gameCanvas.height / 2 - 100);

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

    if (detectionMode !== 'EYE') dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    if (!hoveredButton) dwellTimer = 0;

    canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)'; canvasCtx.strokeStyle = '#E53E3E'; canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    canvasCtx.strokeStyle = '#4299E1';
    canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);

    if (hoveredButton === restartButton) {
        canvasCtx.shadowColor = '#E53E3E'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h); canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * restartButton.w, restartButton.w);
            canvasCtx.fillStyle = '#E53E3E'; canvasCtx.fillRect(restartButton.x, restartButton.y, fillWidth, restartButton.h);
        }
    } else if (hoveredButton === menuButton) {
        canvasCtx.shadowColor = '#4299E1'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h); canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * menuButton.w, menuButton.w);
            canvasCtx.fillStyle = '#4299E1'; canvasCtx.fillRect(menuButton.x, menuButton.y, fillWidth, menuButton.h);
        }
    }

    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 30px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("COBA LAGI", restartButton.x + restartButton.w / 2, restartButton.y + 50);
    canvasCtx.fillText("MENU UTAMA", menuButton.x + menuButton.w / 2, menuButton.y + 50);

    const isClicked = (detectionMode === 'EYE' && interaction.pointerIdx !== -1 && PointerHandler.blinkTriggered[interaction.pointerIdx]) ||
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME);

    if (isClicked && hoveredButton) {
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
    canvasCtx.fillStyle = 'rgba(0, 100, 0, 0.7)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 50px 'Orbitron'"; canvasCtx.textAlign = 'center';
    
    let winMsg = playerCount === 2 ? `PEMAIN '${winnerLabel}' MENANG!` : "M E N A N G !";
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

    if (detectionMode !== 'EYE') dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    if (!hoveredButton) dwellTimer = 0;

    canvasCtx.fillStyle = 'rgba(20, 80, 20, 0.7)'; canvasCtx.strokeStyle = '#38a169'; canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)'; canvasCtx.strokeStyle = '#4299E1';
    canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);

    if (hoveredButton === restartButton) {
        canvasCtx.shadowColor = '#38a169'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h); canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * restartButton.w, restartButton.w);
            canvasCtx.fillStyle = '#38a169'; canvasCtx.fillRect(restartButton.x, restartButton.y, fillWidth, restartButton.h);
        }
    } else if (hoveredButton === menuButton) {
        canvasCtx.shadowColor = '#4299E1'; canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h); canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * menuButton.w, menuButton.w);
            canvasCtx.fillStyle = '#4299E1'; canvasCtx.fillRect(menuButton.x, menuButton.y, fillWidth, menuButton.h);
        }
    }

    canvasCtx.fillStyle = '#E2E8F0'; canvasCtx.font = "bold 30px 'Orbitron'"; canvasCtx.textAlign = 'center';
    canvasCtx.fillText("COBA LAGI", restartButton.x + restartButton.w / 2, restartButton.y + 50);
    canvasCtx.fillText("MENU UTAMA", menuButton.x + menuButton.w / 2, menuButton.y + 50);
    
    const isClicked = (detectionMode === 'EYE' && interaction.pointerIdx !== -1 && PointerHandler.blinkTriggered[interaction.pointerIdx]) ||
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME);

    if (isClicked && hoveredButton) {
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
        if (players[i].isDead) continue; // Jangan update jika mati

        // Jika tangan tidak terlihat (kamera tidak mendeteksi), pause pergerakan
        if (!pointers[i].visible) {
            pointerWasVisible[i] = false; 
            continue;
        }

        // Jika baru terlihat lagi (atau frame pertama setelah start), set offset baru
        if (!pointerWasVisible[i]) {
            pointerOffsets[i].x = players[i].x + players[i].size / 2 - pointers[i].x;
            pointerOffsets[i].y = players[i].y + players[i].size / 2 - pointers[i].y;
            pointerWasVisible[i] = true;
        }

        // Gunakan offset agar pergerakan selalu relatif dan mulus (tanpa teleport)
        players[i].x = (pointers[i].x + pointerOffsets[i].x) - players[i].size / 2;
        players[i].y = (pointers[i].y + pointerOffsets[i].y) - players[i].size / 2;

        players[i].x = Math.max(offsetX, Math.min(players[i].x, offsetX + (GRID_SIZE * tileSize) - players[i].size));
        players[i].y = Math.max(offsetY, Math.min(players[i].y, offsetY + (GRID_SIZE * tileSize) - players[i].size));

        checkCollision(i);
    }
}

// MODIFIKASI: Respawn berdampingan sebelum mulai
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
                    // Jika 2P, letakkan berdampingan (L di kiri, R di kanan)
                    let offset = tileSize * 0.25; 
                    if (index === 0) { // Player 1
                        players[index].x = tileCenterX - offset - players[index].size / 2;
                    } else { // Player 2
                        players[index].x = tileCenterX + offset - players[index].size / 2;
                    }
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

// MODIFIKASI: Logika Eliminasi ketika menabrak tembok
function checkCollision(playerIndex) {
    const p = players[playerIndex];
    if (p.isDead) return;

    const playerCenterX = p.x + p.size / 2;
    const playerCenterY = p.y + p.size / 2;

    const gridX = Math.floor((playerCenterX - offsetX) / tileSize);
    const gridY = Math.floor((playerCenterY - offsetY) / tileSize);
    
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) return;

    const tile = maze[gridY][gridX];

    if (tile === 1) { 
        if (playerCount === 1) {
            // Jika 1P, langsung Game Over
            gameState = GameState.GAME_OVER;
            if (startTime > 0) {
               elapsedTime = (performance.now() - startTime) / 1000;
               startTime = 0;
            }
        } else {
            // Jika 2P, pemain mati dan meledak
            p.isDead = true;
            createExplosion(playerCenterX, playerCenterY, p.color);
            
            // Cek jika kedua pemain mati
            if (players[0].isDead && players[1].isDead) {
                gameState = GameState.GAME_OVER;
                if (startTime > 0) {
                   elapsedTime = (performance.now() - startTime) / 1000;
                   startTime = 0;
                }
            }
        }
    } else if (tile === 3) { 
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
        pointerWasVisible[i] = false; // BARU: Reset jangkar saat respawn
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