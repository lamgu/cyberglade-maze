// --- 1. Inisialisasi Global ---
// Baris ini sangat penting, kita memberi tahu JS di mana elemen-elemen
// dari index.html berada.
const videoElement = document.getElementById('webcam-stream');
const gameCanvas = document.getElementById('game-canvas');
const canvasCtx = gameCanvas.getContext('2d');

// --- 2. Variabel & Konstanta Game ---

// State Machine: Mengatur status game saat ini
const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    SETTINGS: 'SETTINGS',
    MODE_SELECTION: 'MODE_SELECTION', // BARU: State untuk pilih mode
    CUSTOM_EDITOR: 'CUSTOM_EDITOR',   // BARU: State untuk editor level
    GAME_OVER: 'GAME_OVER', 
    GAME_WIN: 'GAME_WIN'
};
let gameState = GameState.MENU;

// BARU: Variabel untuk mode deteksi
let detectionMode = 'HAND'; // Pilihan: 'HAND', 'NOSE', atau 'EYE'
// BARU: Variabel untuk tingkat kesulitan
let difficulty = 'EASY'; // Pilihan: 'EASY', 'HARD', 'CUSTOM'
let customMaze = null; // Untuk menyimpan maze buatan user

// Logika Tahan-untuk-Klik (Dwell-to-Click)
const DWELL_TIME = 1.5; // PERBAIKAN: Memberikan nilai 4.0 detik
let dwellTimer = 0;
// BARU: Pengaturan Audio
const bgMusic = new Audio('https://files.catbox.moe/uswvy3.mp3');
bgMusic.loop = true; // Agar musik berputar terus




// Objek Tombol (untuk menu)
// MODIFIKASI: Diperbarui untuk semua tombol di berbagai menu
const restartButton = { x: 0, y: 0, w: 0, h: 0 };
const menuButton = { x: 0, y: 0, w: 0, h: 0 };

// BARU: Tombol untuk menu utama
const startButton1P = { x: 0, y: 0, w: 0, h: 0 };
const startButton2P = { x: 0, y: 0, w: 0, h: 0 };
const settingsButton = { x: 0, y: 0, w: 0, h: 0 };
const modeButton = { x: 0, y: 0, w: 0, h: 0 }; // MODIFIKASI: template -> mode

// BARU: Tombol untuk menu pengaturan
const closeSettingsButton = { x: 0, y: 0, w: 0, h: 0 };
const settingOption1Button = { x: 0, y: 0, w: 0, h: 0 };
const settingOption2Button = { x: 0, y: 0, w: 0, h: 0 };
const settingOption3Button = { x: 0, y: 0, w: 0, h: 0 };
const settingOption4Button = { x: 0, y: 0, w: 0, h: 0 }; // BARU: Untuk mode mata

// BARU: Tombol untuk menu pemilihan mode
const easyModeButton = { x: 0, y: 0, w: 0, h: 0 };
const hardModeButton = { x: 0, y: 0, w: 0, h: 0 };
const customModeButton = { x: 0, y: 0, w: 0, h: 0 };
const backToMenuButton = { x: 0, y: 0, w: 0, h: 0 };

// Karakter Player
const player = {
    x: 0,
    y: 0,
    size: 0,
    speed: 200 // pixels per second
};

// Pointer (dikontrol oleh MediaPipe)
const handPointer = { x: 0, y: 0, visible: false };

// --- 3. Logika Maze & Level ---
const GRID_SIZE = 19; // Ukuran grid (DIPERBESAR dari 15 ke 19)
let tileSize = 0;     // Ukuran satu tile (dihitung dinamis)
let offsetX = 0;      // Offset X untuk memusatkan maze
let offsetY = 0;      // Offset Y untuk memusatkan maze

// MODIFIKASI: Ini akan menjadi maze default (EASY)
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


// BARU: Maze untuk mode HARD
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
    [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1], // Spawn tengah, area sempit
    [1,1,1,1,0,1,1,1,0,0,0,1,1,1,0,1,1,1,1],
    [1,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,1],
    [1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1], // Finish di pojok
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];   
let maze = easyMaze; // Maze yang sedang aktif

// --- 4. Fungsi Deteksi Tangan (MediaPipe) ---

// BARU: Fungsi untuk memainkan sound effect
function playSound(sound) {
    sound.currentTime = 0; // Putar dari awal
    sound.play().catch(e => {}); // Mainkan, abaikan error jika ada
}

// BARU: Fungsi untuk mengelola efek jejak player
function updateAndDrawPlayerTrail() {
    // Tambahkan partikel baru di posisi player
    if (gameState === GameState.PLAYING) {
        playerTrail.push({
            x: player.x + player.size / 2,
            y: player.y + player.size / 2,
            size: player.size * 0.8,
            alpha: 1.0
        });
    }

    // Update dan gambar semua partikel jejak
    for (let i = playerTrail.length - 1; i >= 0; i--) {
        let p = playerTrail[i];
        p.alpha -= 0.05; // Kurangi transparansi (memudar)
        p.size *= 0.95; // Kecilkan ukuran
        if (p.alpha <= 0) {
            playerTrail.splice(i, 1); // Hapus jika sudah tidak terlihat
        } else {
            canvasCtx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`; // Warna Cyan
            canvasCtx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
    }
}

// BARU: Fungsi untuk membuat ledakan partikel
function createExplosion(x, y) {
    for (let i = 0; i < 50; i++) {
        explosionParticles.push({
            x: x, y: y,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            size: Math.random() * 4 + 2,
            alpha: 1.0,
            color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)` // Variasi Cyan & Biru
        });
    }
}

// BARU: Sistem Partikel untuk Latar Belakang Dinamis
let particles = [];
function createParticles() {
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * gameCanvas.width,
            y: Math.random() * gameCanvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            color: `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.2})` // Warna Cyan
        });
    }
}

function updateAndDrawParticles() {
    // MODIFIKASI: Jadikan fungsi ini global agar bisa diakses intro.js
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

/**
 * Dipanggil setiap kali MediaPipe mendeteksi tangan.
 * @param {object} results - Hasil dari deteksi.
 */
function onHandResults(results) {
    // MODIFIKASI: Delegasikan ke PointerHandler
    PointerHandler.updateFromHand(results, handPointer, gameCanvas);
}

/**
 * Dipanggil setiap kali MediaPipe mendeteksi wajah.
 * @param {object} results - Hasil dari deteksi.
 */
function onFaceResults(results) {
    // MODIFIKASI: Delegasikan ke PointerHandler
    PointerHandler.updateFromFace(results, handPointer, gameCanvas, detectionMode);
}

// --- Inisialisasi MediaPipe ---

// Inisialisasi MediaPipe Hands
// Kita mengakses 'Hands' dari 'window' karena ia dimuat via <script>
const hands = new window.Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onHandResults);

// Inisialisasi MediaPipe FaceMesh
const faceMesh = new window.FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true, // Penting untuk akurasi landmark mata
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
faceMesh.onResults(onFaceResults);

// Inisialisasi Kamera (dari @mediapipe/camera_utils)
// Kita mengakses 'Camera' dari 'window'
const camera = new window.Camera(videoElement, {
    onFrame: async () => {
        // MODIFIKASI: Kirim frame ke model yang aktif
        if (detectionMode === 'HAND') { // Hanya butuh 'hands'
            await hands.send({ image: videoElement });
        } else { // Mode 'NOSE' dan 'EYE' butuh 'faceMesh'
            await faceMesh.send({ image: videoElement });
        }
    },
    width: 640,
    height: 480
});

// Mulai kamera
camera.start().catch(err => {
    console.error("Failed to acquire camera feed:", err);
    alert("Gagal memulai kamera. Pastikan izin telah diberikan dan kamera tidak dipakai aplikasi lain.");
});

// --- 5. Logika Utama Game ---

/**
 * Loop game utama. Dipanggil 60x per detik.
 * @param {number} timestamp - Waktu saat ini.
 */
let lastTime = 0;
function gameLoop(timestamp) {
    // Hitung deltaTime (waktu antar frame)
    const deltaTime = (timestamp - lastTime) / 1000 || 0;
    lastTime = timestamp;

    // 1. Hapus layar (clear)
    canvasCtx.fillStyle = '#000022'; // Biru sangat gelap
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // BARU: Gambar latar belakang partikel
    updateAndDrawParticles();

    // 2. Update & Gambar berdasarkan Game State
    switch (gameState) {
        case GameState.MENU:
            drawMenu(deltaTime);
            break;
        // BARU: Panggil fungsi gambar untuk menu pengaturan
        case GameState.SETTINGS:
            drawSettings(deltaTime);
            break;
        // BARU: Panggil fungsi untuk menu pemilihan mode
        case GameState.MODE_SELECTION:
            drawModeSelection(deltaTime);
            break;
        // BARU: Panggil fungsi dari level-editor.js
        case GameState.CUSTOM_EDITOR:
            // Tentukan apakah ada aksi klik di frame ini
            const isEditorClicked = (detectionMode === 'EYE' && PointerHandler.blinkTriggered) ||
                                    (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME);
            // Pastikan LevelEditor sudah ada
            if (window.LevelEditor) {
                window.LevelEditor.updateAndDraw(canvasCtx, handPointer, isEditorClicked, deltaTime);
            }
            break;
        case GameState.PLAYING:
            updatePlayer(deltaTime);
            drawPlaying(deltaTime);
            break;
        case GameState.GAME_OVER:
            drawGameOver(deltaTime);
            break;
        case GameState.GAME_WIN:
            drawGameWin(deltaTime);
            break;
    }

    drawModeInfoBox(); // MODIFIKASI: Panggil fungsi Info Box yang baru
    // 3. Gambar pointer tangan (selalu di atas)
    if (handPointer.visible) {
        canvasCtx.fillStyle = "rgba(29, 127, 239, 0.43)"; // Kuning transparan
        canvasCtx.beginPath();
        canvasCtx.arc(handPointer.x, handPointer.y, 15, 0, 2 * Math.PI);
        canvasCtx.fill();
    }
    
    // 4. Minta frame berikutnya
    requestAnimationFrame(gameLoop);
}

// --- 6. Fungsi Gambar (Render) ---

// MODIFIKASI: Fungsi baru untuk Info Box mode di pojok kanan atas
function drawModeInfoBox() {
    const boxWidth = 300;
    const boxHeight = 80;
    const margin = 20;
    const boxX = gameCanvas.width - boxWidth - margin;
    const boxY = margin;

    // --- Gambar Kontainer ---
    canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)';
    canvasCtx.strokeStyle = '#00FFFF'; // Cyan
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // --- Definisikan Konten (Ikon & Teks) ---
    const iconSize = 40;
    const iconX = boxX + 20;
    const iconY = boxY + (boxHeight - iconSize) / 2;
    const textX = iconX + iconSize + 15;
    const textY = boxY + 30;

    let modeText = "";
    let drawIcon;

    // --- Siapkan konten berdasarkan mode ---
    switch (detectionMode) {
        case 'HAND':
            modeText = "TANGAN";
            drawIcon = () => {
                canvasCtx.strokeRect(iconX, iconY, iconSize * 0.7, iconSize); // Telapak
                canvasCtx.strokeRect(iconX + iconSize * 0.7, iconY, iconSize * 0.2, iconSize * 0.6); // Jari
                canvasCtx.strokeRect(iconX - iconSize * 0.3, iconY + iconSize * 0.2, iconSize * 0.3, iconSize * 0.4); // Jempol
            };
            break;
        case 'NOSE':
            modeText = "HIDUNG";
            drawIcon = () => {
                canvasCtx.beginPath();
                canvasCtx.moveTo(iconX + iconSize / 2, iconY);
                canvasCtx.lineTo(iconX, iconY + iconSize);
                canvasCtx.lineTo(iconX + iconSize, iconY + iconSize);
                canvasCtx.closePath();
                canvasCtx.stroke();
            };
            break;
        case 'EYE':
            modeText = "MATA (Kedip)";
            drawIcon = () => {
                canvasCtx.beginPath();
                canvasCtx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, 2 * Math.PI);
                canvasCtx.stroke();
                canvasCtx.beginPath();
                canvasCtx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 4, 0, 2 * Math.PI);
                canvasCtx.fill();
            };
            break;
    }

    // --- Gambar Ikon dengan Efek Glow ---
    canvasCtx.strokeStyle = '#00FFFF';
    canvasCtx.fillStyle = '#00FFFF';
    canvasCtx.lineWidth = 3;
    canvasCtx.shadowColor = '#00FFFF';
    canvasCtx.shadowBlur = 10;
    drawIcon();
    canvasCtx.shadowBlur = 0; // Reset shadow

    // --- Gambar Teks ---
    canvasCtx.fillStyle = '#FFFFFF';
    canvasCtx.textAlign = 'left';
    canvasCtx.font = "18px 'Orbitron'";
    canvasCtx.fillText("Mode Aktif:", textX, textY);
    canvasCtx.font = "bold 24px 'Orbitron'";
    canvasCtx.fillText(modeText, textX, textY + 28);
}

/**
 * Menggambar state Menu Utama.
 * @param {number} deltaTime - Waktu antar frame.
 */
function drawMenu(deltaTime) {
    // --- Gambar Judul ---
    // MODIFIKASI: Judul dengan efek Neon Glow
    canvasCtx.font = "bold 72px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    // Efek glow
    canvasCtx.shadowColor = '#00FFFF'; // Cyan glow
    canvasCtx.shadowBlur = 20;
    canvasCtx.fillStyle = '#FFFFFF';
    canvasCtx.fillText("CYBERGLADE MAZE", gameCanvas.width / 2, gameCanvas.height / 2 - 100);
    canvasCtx.shadowBlur = 0; // Reset shadow

    // --- Definisikan Geometri Tombol ---
    const btnWidth = 300;
    const btnHeight = 70;
    const btnMargin = 20;
    const startX = (gameCanvas.width / 2) - (btnWidth / 2);
    const startY = gameCanvas.height / 2 - 50;

    // Tombol 1: Mulai
    startButton1P.x = startX;
    startButton1P.y = startY;
    startButton1P.w = btnWidth;
    startButton1P.h = btnHeight;

    startButton2P.x = startX;
    startButton2P.y = startY + btnHeight + btnMargin;
    startButton2P.w = btnWidth;
    startButton2P.h = btnHeight;

    // Tombol 2: Pengaturan
    settingsButton.x = startX;
    settingsButton.y = startY + (btnHeight + btnMargin) * 2;
    settingsButton.w = btnWidth;
    settingsButton.h = btnHeight;

    // Tombol 3: Mode
    modeButton.x = startX;
    modeButton.y = startY + (btnHeight + btnMargin) * 3;
    modeButton.w = btnWidth;
    modeButton.h = btnHeight;

    // --- Logika Dwell-to-Click & Gambar Tombol ---
    let hoveredButton = null;
    if (handPointer.visible) {
        if (isPointerInButton(startButton1P)) hoveredButton = startButton1P;
        else if (isPointerInButton(startButton2P)) hoveredButton = startButton2P;
        else if (isPointerInButton(settingsButton)) hoveredButton = settingsButton;
        else if (isPointerInButton(modeButton)) hoveredButton = modeButton;
    }

    // Logika interaksi: Hanya gunakan dwell jika bukan mode mata
    if (detectionMode !== 'EYE') {
        dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    } 

    // Fungsi kecil untuk menggambar tombol
    const drawButton = (button, text, color) => {
        // PERBAIKAN: Reset dwell timer jika tidak ada tombol menu utama yang di-hover
        // Ini mencegah tombol mute mengganggu timer tombol menu
        if (!hoveredButton) {
            dwellTimer = 0;
        }

        // Gambar latar
        canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)'; // Latar tombol semi-transparan
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);

        // Umpan balik visual berdasarkan mode
        if (hoveredButton === button) {
            // Efek glow pada tombol yang di-hover
            canvasCtx.shadowColor = color;
            canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
            canvasCtx.shadowBlur = 0;

            if (detectionMode !== 'EYE') { // Gambar progress bar untuk Tangan & Hidung
                const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
                canvasCtx.fillStyle = color;
                canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            }
        }

        // Gambar teks
        canvasCtx.fillStyle = '#FFFFFF';
        canvasCtx.font = "bold 30px 'Orbitron'";
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(text, button.x + button.w / 2, button.y + 45);
    };

    drawButton(startButton1P, "MULAI (1P)", '#4299E1');
    drawButton(startButton2P, "MULAI (2P)", '#4299E1');
    drawButton(settingsButton, "MODE", '#38A169'); // MODIFIKASI: Pengaturan -> Mode
    drawButton(modeButton, "GANTI TIPE MAP", '#DD6B20'); // MODIFIKASI: Mode -> Ganti Tipe Map

    // Logika aksi klik
    const isClicked = (detectionMode === 'EYE' && PointerHandler.blinkTriggered && hoveredButton) || // Mode Mata (kedip)
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME); // Mode Tangan & Hidung (tahan)

    if (isClicked) {
        if (hoveredButton === startButton1P) {
            // Saat mulai, gunakan maze berdasarkan difficulty terakhir
            if (difficulty === 'EASY') maze = easyMaze;
            else if (difficulty === 'HARD') maze = hardMaze;
            else if (difficulty === 'CUSTOM' && customMaze) maze = customMaze;
            else maze = easyMaze; // Fallback

            resetGame();
            gameState = GameState.PLAYING;
        } else if (hoveredButton === settingsButton) {
            gameState = GameState.SETTINGS; // Pindah ke menu pengaturan
        } else if (hoveredButton === modeButton) {
            gameState = GameState.MODE_SELECTION; // Pindah ke pemilihan mode
        }
        dwellTimer = 0; // Reset timer setelah aksi
    }
}

// BARU: Fungsi untuk menggambar menu Pemilihan Mode
function drawModeSelection(deltaTime) {
    canvasCtx.fillStyle = 'rgba(0, 0, 34, 0.9)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 48px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("PILIH TIPE MAP", gameCanvas.width / 2, 150); // MODIFIKASI: Judul halaman

    const btnWidth = 350;
    const btnHeight = 70;
    const btnMargin = 20;
    const startX = (gameCanvas.width - btnWidth) / 2;
    const startY = 250;

    easyModeButton.x = startX;
    easyModeButton.y = startY;
    easyModeButton.w = btnWidth;
    easyModeButton.h = btnHeight;

    hardModeButton.x = startX;
    hardModeButton.y = startY + btnHeight + btnMargin;
    hardModeButton.w = btnWidth;
    hardModeButton.h = btnHeight;

    customModeButton.x = startX;
    customModeButton.y = startY + (btnHeight + btnMargin) * 2;
    customModeButton.w = btnWidth;
    customModeButton.h = btnHeight;

    backToMenuButton.x = 50;
    backToMenuButton.y = 50;
    backToMenuButton.w = 150;
    backToMenuButton.h = 50;

    let hoveredButton = null;
    if (handPointer.visible) {
        if (isPointerInButton(easyModeButton)) hoveredButton = easyModeButton;
        else if (isPointerInButton(hardModeButton)) hoveredButton = hardModeButton;
        else if (isPointerInButton(customModeButton)) hoveredButton = customModeButton;
        else if (isPointerInButton(backToMenuButton)) hoveredButton = backToMenuButton;
    }

    if (detectionMode !== 'EYE') {
        dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    }

    const drawButton = (button, text, color) => {
        const isSmall = button === backToMenuButton;
        canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)';
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
        
        if (hoveredButton === button) {
            canvasCtx.shadowColor = color;
            canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
            canvasCtx.shadowBlur = 0;

            if (detectionMode !== 'EYE') {
                const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
                canvasCtx.fillStyle = color;
                canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            }
        }
        canvasCtx.fillStyle = '#E2E8F0';
        canvasCtx.font = `bold ${isSmall ? '24px' : '30px'} 'Orbitron'`;
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(text, button.x + button.w / 2, button.y + (isSmall ? 32 : 45));
    };

    drawButton(easyModeButton, "EASY", '#38A169');
    drawButton(hardModeButton, "HARD", '#DD6B20');
    drawButton(customModeButton, "CUSTOM", '#4299E1');
    drawButton(backToMenuButton, "< MENU", '#E53E3E');

    const isClicked = (detectionMode === 'EYE' && PointerHandler.blinkTriggered && hoveredButton) ||
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME);

    if (isClicked) {
        if (hoveredButton === easyModeButton) { difficulty = 'EASY'; gameState = GameState.MENU; }
        else if (hoveredButton === hardModeButton) { difficulty = 'HARD'; gameState = GameState.MENU; }
        else if (hoveredButton === customModeButton) {
            difficulty = 'CUSTOM';
            // Inisialisasi editor level
            window.LevelEditor.init(canvasCtx, (newMaze) => {
                customMaze = newMaze; // Simpan maze custom
                gameState = GameState.MENU;
            });
            gameState = GameState.CUSTOM_EDITOR;
        }
        else if (hoveredButton === backToMenuButton) { gameState = GameState.MENU; }
        dwellTimer = 0;
    }
}

// BARU: Fungsi untuk menggambar menu Pengaturan
function drawSettings(deltaTime) {
    // Gambar latar belakang semi-transparan
    canvasCtx.fillStyle = 'rgba(0, 0, 34, 0.9)'; // Biru gelap transparan
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Gambar Judul
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 48px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("PILIH MODE KONTROL", gameCanvas.width / 2, 150); // MODIFIKASI: Judul halaman

    // --- Definisikan Tombol Opsi ---
    const btnWidth = 400; // Diperlebar
    const btnHeight = 60;
    const btnMargin = 20;
    const startX = (gameCanvas.width - btnWidth) / 2;
    const startY = 250;

    // --- MODIFIKASI: Definisikan Tombol Close (X) dekat Judul ---
    const titleWidth = canvasCtx.measureText("PILIH MODE KONTROL").width;
    closeSettingsButton.w = 50;
    closeSettingsButton.h = 50;
    closeSettingsButton.x = (gameCanvas.width / 2) + (titleWidth / 2) + 20; // 20px di kanan judul
    closeSettingsButton.y = 150 - (closeSettingsButton.h / 2); // Sejajar vertikal dengan judul

    settingOption1Button.x = startX;
    settingOption1Button.y = startY;
    settingOption1Button.w = btnWidth;
    settingOption1Button.h = btnHeight;

    settingOption2Button.x = startX;
    settingOption2Button.y = startY + btnHeight + btnMargin;
    settingOption2Button.w = btnWidth;
    settingOption2Button.h = btnHeight;

    settingOption3Button.x = startX;
    settingOption3Button.y = startY + (btnHeight + btnMargin) * 2;
    settingOption3Button.w = btnWidth;
    settingOption3Button.h = btnHeight;
    
    settingOption4Button.x = startX;
    settingOption4Button.y = startY + (btnHeight + btnMargin) * 3;
    settingOption4Button.w = btnWidth;
    settingOption4Button.h = btnHeight;

    // --- Logika Dwell & Gambar ---
    let hoveredButton = null;
    if (handPointer.visible) {
        if (isPointerInButton(settingOption1Button)) hoveredButton = settingOption1Button;
        else if (isPointerInButton(settingOption2Button)) hoveredButton = settingOption2Button;
        // MODIFIKASI: Urutan hover disesuaikan
        else if (isPointerInButton(settingOption3Button)) hoveredButton = settingOption3Button; // Tombol ke-3
        else if (isPointerInButton(settingOption4Button)) hoveredButton = settingOption4Button; // PERBAIKAN: Tambahkan pengecekan untuk tombol ke-4
        else if (isPointerInButton(closeSettingsButton)) hoveredButton = closeSettingsButton;
    }

    if (detectionMode !== 'EYE') {
        dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    }

    const drawOptionButton = (button, text) => {
        canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)';
        canvasCtx.strokeStyle = '#4299E1'; // Biru
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(button.x, button.y, button.w, button.h);

        if (hoveredButton === button) {
            canvasCtx.shadowColor = '#4299E1';
            canvasCtx.shadowBlur = 15;
            canvasCtx.strokeRect(button.x, button.y, button.w, button.h);
            canvasCtx.shadowBlur = 0;

            if (detectionMode !== 'EYE') {
                const fillWidth = Math.min((dwellTimer / DWELL_TIME) * button.w, button.w);
                canvasCtx.fillStyle = '#4299E1';
                canvasCtx.fillRect(button.x, button.y, fillWidth, button.h);
            }
        }
        canvasCtx.fillStyle = '#E2E8F0';
        canvasCtx.font = "24px 'Orbitron'";
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(text, button.x + button.w / 2, button.y + 38);
    };

    // MODIFIKASI: Urutan penggambaran tombol diubah
    drawOptionButton(settingOption1Button, "Ganti Mode: Tangan");
    drawOptionButton(settingOption2Button, "Ganti Mode: Hidung");
    drawOptionButton(settingOption3Button, "Ganti Mode: Mata (Kedip)"); // Tombol ke-3
    drawOptionButton(settingOption4Button, `Mode Aktif: ${detectionMode}`); // PERBAIKAN: Gunakan settingOption4Button untuk tombol ke-4

    // MODIFIKASI: Gambar Tombol Close (X) dengan warna dasar merah
    canvasCtx.fillStyle = 'rgba(80, 20, 20, 0.7)';
    canvasCtx.strokeStyle = '#E53E3E'; // Merah
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(closeSettingsButton.x, closeSettingsButton.y, closeSettingsButton.w, closeSettingsButton.h);
    
    if (hoveredButton === closeSettingsButton) {
        canvasCtx.shadowColor = '#E53E3E';
        canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(closeSettingsButton.x, closeSettingsButton.y, closeSettingsButton.w, closeSettingsButton.h);
        canvasCtx.shadowBlur = 0;

        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * closeSettingsButton.w, closeSettingsButton.w);
            canvasCtx.fillStyle = '#FEB2B2'; // Merah lebih terang
            canvasCtx.fillRect(closeSettingsButton.x, closeSettingsButton.y, fillWidth, closeSettingsButton.h);
        }
    }
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 36px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("X", closeSettingsButton.x + closeSettingsButton.w / 2, closeSettingsButton.y + 38);

    // --- Logika Aksi ---
    const isClicked = (detectionMode === 'EYE' && PointerHandler.blinkTriggered && hoveredButton) || // Mode Mata (kedip)
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME); // Mode Tangan & Hidung (tahan)

    if (isClicked) {
        if (hoveredButton === closeSettingsButton) {
            gameState = GameState.MENU; // Kembali ke menu utama
        } else if (hoveredButton === settingOption1Button) {
            detectionMode = 'HAND';
            console.log("Mode deteksi diubah ke TANGAN");
        } else if (hoveredButton === settingOption2Button) {
            detectionMode = 'NOSE';
            console.log("Mode deteksi diubah ke HIDUNG");
        } else if (hoveredButton === settingOption3Button) {
            detectionMode = 'EYE';
            console.log("Mode deteksi diubah ke MATA");
        } else if (hoveredButton === settingOption4Button) {
            // Tombol status (Mode Aktif) tidak melakukan apa-apa
        }
        dwellTimer = 0;
    }
}

/**
 * Menggambar state Saat Bermain (Maze, Player, Timer).
 * @param {number} deltaTime - Waktu antar frame.
 */
function drawPlaying(deltaTime) {
    // Gambar Maze
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tile = maze[y][x];
            const tileX = offsetX + x * tileSize;
            const tileY = offsetY + y * tileSize;

            if (tile === 1) { // Tembok
                canvasCtx.fillStyle = '#4A5568'; // Abu-abu
            } else if (tile === 2) { // Spawn
                canvasCtx.fillStyle = 'rgba(0, 150, 0, 0.5)'; // Hijau (Spawn)
            } else if (tile === 3) { // Finish
                canvasCtx.fillStyle = '#38A169'; // Hijau (Finish)
            } else if (tile === 4) { // Garis Start (BARU)
                canvasCtx.fillStyle = '#E53E3E'; // Merah (Garis Start)
            } else { // Jalan
                canvasCtx.fillStyle = '#1A202C'; // Latar abu-abu gelap
            }
            
            canvasCtx.fillRect(tileX, tileY, tileSize, tileSize);
            // Menambahkan outline agar lebih jelas
            canvasCtx.strokeStyle = '#000022';
            canvasCtx.strokeRect(tileX, tileY, tileSize, tileSize);
        }
    }

    // Gambar Player
    canvasCtx.fillStyle = '#E2E8F0'; // Putih
    canvasCtx.fillRect(player.x, player.y, player.size, player.size);

    // Gambar Timer
    let timerText = "Waktu: 0.00s";
    if (startTime > 0) { // Timer hanya berjalan jika sudah start
        elapsedTime = (performance.now() - startTime) / 1000;
        timerText = `Waktu: ${elapsedTime.toFixed(2)}s`;
    }
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 24px 'Orbitron'";
    canvasCtx.textAlign = 'left';
    canvasCtx.fillText(timerText, 20, 40);
}

/**
 * Menggambar state Game Over (Kalah).
 * @param {number} deltaTime - Waktu antar frame.
 */
function drawGameOver(deltaTime) {
    // Gambar latar transparan
    canvasCtx.fillStyle = 'rgba(150, 0, 0, 0.7)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Teks Game Over
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 60px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("K A L A H", gameCanvas.width / 2, gameCanvas.height / 2 - 100);

    // Teks Statistik
    const statsText = `Waktu: ${elapsedTime > 0 ? elapsedTime.toFixed(2) : '0.00'}s`;
    canvasCtx.font = "30px 'Orbitron'";
    canvasCtx.fillText(statsText, gameCanvas.width / 2, gameCanvas.height / 2 - 50);

    // --- Tombol Baru (Logika 2 Tombol) ---
    const btnWidth = 300; // Sedikit lebih lebar agar pas di tengah
    const btnHeight = 80;
    const btnMargin = 20; // Sekarang jadi margin vertikal
    const btnX = (gameCanvas.width / 2) - (btnWidth / 2); // X sama untuk kedua tombol

    // Tombol 1: Coba Lagi
    const restartBtnY = gameCanvas.height / 2; // Y tombol pertama
    restartButton.x = btnX;
    restartButton.y = restartBtnY;
    restartButton.w = btnWidth;
    restartButton.h = btnHeight;

    // Tombol 2: Menu Utama
    const menuBtnY = restartBtnY + btnHeight + btnMargin; // Y tombol kedua (di bawah tombol pertama)
    menuButton.x = btnX;
    menuButton.y = menuBtnY;
    menuButton.w = btnWidth;
    menuButton.h = btnHeight;

    let hoveredButton = null;
    if (handPointer.visible) {
        if (isPointerInButton(restartButton)) hoveredButton = restartButton;
        else if (isPointerInButton(menuButton)) hoveredButton = menuButton;
    }

    if (detectionMode !== 'EYE') {
        dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    }

    // Gambar tombol
    canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)';
    canvasCtx.strokeStyle = '#E53E3E';
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    canvasCtx.strokeStyle = '#4299E1';
    canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);

    // Umpan balik visual
    if (hoveredButton === restartButton) {
        canvasCtx.shadowColor = '#E53E3E';
        canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
        canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * restartButton.w, restartButton.w);
            canvasCtx.fillStyle = '#E53E3E'; // Merah
            canvasCtx.fillRect(restartButton.x, restartButton.y, fillWidth, restartButton.h);
        }
    } else if (hoveredButton === menuButton) {
        canvasCtx.shadowColor = '#4299E1';
        canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);
        canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * menuButton.w, menuButton.w);
            canvasCtx.fillStyle = '#4299E1'; // Biru
            canvasCtx.fillRect(menuButton.x, menuButton.y, fillWidth, menuButton.h);
        }
    }

    // Teks Tombol 1
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 30px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("COBA LAGI", restartButton.x + restartButton.w / 2, restartButton.y + 50);

    const isClicked = (detectionMode === 'EYE' && PointerHandler.blinkTriggered && hoveredButton) || // Mode Mata (kedip)
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME); // Mode Tangan & Hidung (tahan)

    if (isClicked) {
        if (hoveredButton === restartButton) {
            resetGame();
            gameState = GameState.PLAYING;
        } else if (hoveredButton === menuButton) {
            gameState = GameState.MENU;
        }
        dwellTimer = 0;
    }

    // Teks Tombol 2
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 30px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("MENU UTAMA", menuButton.x + menuButton.w / 2, menuButton.y + 50);
}

/**
 * Menggambar state Game Win (Menang).
 * @param {number} deltaTime - Waktu antar frame.
 */
function drawGameWin(deltaTime) {
    // Latar hijau
    canvasCtx.fillStyle = 'rgba(0, 100, 0, 0.7)';
    canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Teks Menang
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 60px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("M E N A N G !", gameCanvas.width / 2, gameCanvas.height / 2 - 100);

    // Teks Statistik
    const statsText = `Waktu: ${elapsedTime.toFixed(2)}s`;
    canvasCtx.font = "30px 'Orbitron'";
    canvasCtx.fillText(statsText, gameCanvas.width / 2, gameCanvas.height / 2 - 50);

    // --- Tombol Baru (Logika 2 Tombol) ---
    const btnWidth = 300; // Sedikit lebih lebar agar pas di tengah
    const btnHeight = 80;
    const btnMargin = 20; // Sekarang jadi margin vertikal
    const btnX = (gameCanvas.width / 2) - (btnWidth / 2); // X sama untuk kedua tombol

    // Tombol 1: Coba Lagi
    const restartBtnY = gameCanvas.height / 2; // Y tombol pertama
    restartButton.x = btnX;
    restartButton.y = restartBtnY;
    restartButton.w = btnWidth;
    restartButton.h = btnHeight;

    // Tombol 2: Menu Utama
    const menuBtnY = restartBtnY + btnHeight + btnMargin; // Y tombol kedua (di bawah tombol pertama)
    menuButton.x = btnX;
    menuButton.y = menuBtnY;
    menuButton.w = btnWidth;
    menuButton.h = btnHeight;

    let hoveredButton = null;
    if (handPointer.visible) {
        if (isPointerInButton(restartButton)) hoveredButton = restartButton;
        else if (isPointerInButton(menuButton)) hoveredButton = menuButton;
    }

    if (detectionMode !== 'EYE') {
        dwellTimer = hoveredButton ? dwellTimer + deltaTime : 0;
    }

    // Gambar tombol
    canvasCtx.fillStyle = 'rgba(20, 80, 20, 0.7)';
    canvasCtx.strokeStyle = '#38a169'; // Hijau
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
    canvasCtx.fillStyle = 'rgba(20, 20, 50, 0.7)';
    canvasCtx.strokeStyle = '#4299E1'; // Biru
    canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);

    // Umpan balik visual
    if (hoveredButton === restartButton) {
        canvasCtx.shadowColor = '#38a169';
        canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
        canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * restartButton.w, restartButton.w);
            canvasCtx.fillStyle = '#38a169'; // Hijau
            canvasCtx.fillRect(restartButton.x, restartButton.y, fillWidth, restartButton.h);
        }
    } else if (hoveredButton === menuButton) {
        canvasCtx.shadowColor = '#4299E1';
        canvasCtx.shadowBlur = 15;
        canvasCtx.strokeRect(menuButton.x, menuButton.y, menuButton.w, menuButton.h);
        canvasCtx.shadowBlur = 0;
        if (detectionMode !== 'EYE') {
            const fillWidth = Math.min((dwellTimer / DWELL_TIME) * menuButton.w, menuButton.w);
            canvasCtx.fillStyle = '#4299E1'; // Biru
            canvasCtx.fillRect(menuButton.x, menuButton.y, fillWidth, menuButton.h);
        }
    }

    // Teks Tombol 1
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 30px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("COBA LAGI", restartButton.x + restartButton.w / 2, restartButton.y + 50);
    
    const isClicked = (detectionMode === 'EYE' && PointerHandler.blinkTriggered && hoveredButton) || // Mode Mata (kedip)
                      (detectionMode !== 'EYE' && dwellTimer >= DWELL_TIME); // Mode Tangan & Hidung (tahan)

    if (isClicked) {
        if (hoveredButton === restartButton) {
            resetGame();
            gameState = GameState.PLAYING;
        } else if (hoveredButton === menuButton) {
            gameState = GameState.MENU;
        }
        dwellTimer = 0;
    }

    // Teks Tombol 2
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.font = "bold 30px 'Orbitron'";
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText("MENU UTAMA", menuButton.x + menuButton.w / 2, menuButton.y + 50);
}

// --- 7. Fungsi Update & Utilitas ---

/**
 * Meng-update posisi player berdasarkan pointer tangan.
 */
function updatePlayer(deltaTime) {
    if (!handPointer.visible) return; // Jika tangan tidak terlihat, jangan update

    // Pindahkan player ke posisi pointer (dengan batasan maze)
    // Ini adalah kontrol langsung
    player.x = handPointer.x - player.size / 2;
    player.y = handPointer.y - player.size / 2;

    // Batasi gerakan player agar tidak keluar dari area maze
    player.x = Math.max(offsetX, Math.min(player.x, offsetX + (GRID_SIZE * tileSize) - player.size));
    player.y = Math.max(offsetY, Math.min(player.y, offsetY + (GRID_SIZE * tileSize) - player.size));

    // Periksa Kolisi
    checkCollision();
}

/**
 * Memeriksa kolisi player dengan maze.
 */
function checkCollision() {
    // Tentukan tile di mana player berada
    // Kita cek titik tengah player
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    // Konversi posisi pixel ke indeks grid
    const gridX = Math.floor((playerCenterX - offsetX) / tileSize);
    const gridY = Math.floor((playerCenterY - offsetY) / tileSize);
    
    // Pastikan kita berada dalam batas grid
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
        return;
    }

    const tile = maze[gridY][gridX];

    if (tile === 1) { // Tembok
        gameState = GameState.GAME_OVER;
        if (startTime > 0) { // Hentikan timer jika sedang berjalan
           elapsedTime = (performance.now() - startTime) / 1000;
           startTime = 0; // Reset startTime
        }
    } else if (tile === 3) { // Finish
        gameState = GameState.GAME_WIN;
        if (startTime > 0) { // Hentikan timer
           elapsedTime = (performance.now() - startTime) / 1000;
           startTime = 0;
        }
    } else if (tile === 4 && startTime === 0) { // BARU: Menyentuh Garis Start (4)
        // Memulai timer saat player menginjak garis start
        startTime = performance.now();
    }
}

/**
 * Menemukan posisi spawn (tile 2) dan menempatkan player di sana.
 */
function resetGame() {
    // Reset timer
    startTime = 0;
    elapsedTime = 0;
    playerTrail = []; // Bersihkan jejak player

    // Temukan spawn point (tile 2)
    // Karena kita tahu spawn di tengah, kita bisa optimalkan
    // Tapi kita cari saja untuk keamanan
    let spawnFound = false;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (maze[y][x] === 2) {
                // Set posisi awal player di tengah tile spawn
                player.x = offsetX + x * tileSize + (tileSize - player.size) / 2;
                player.y = offsetY + y * tileSize + (tileSize - player.size) / 2;
                spawnFound = true;
                break;
            }
        }
        if(spawnFound) break;
    }
    // Jika tidak ada tile 2, default ke tengah
    if (!spawnFound) {
        player.x = gameCanvas.width / 2 - player.size / 2;
        player.y = gameCanvas.height / 2 - player.size / 2;
    }
}

/**
 * Menghitung ulang ukuran game saat jendela di-resize.
 */
function resizeCanvas() {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;

    // Tentukan ukuran tile berdasarkan sisi terpendek layar
    const minDim = Math.min(gameCanvas.width, gameCanvas.height);
    // Beri margin 10%
    tileSize = Math.floor((minDim * 0.9) / GRID_SIZE); 

    // Hitung offset untuk memusatkan maze
    const mazeWidth = tileSize * GRID_SIZE;
    const mazeHeight = tileSize * GRID_SIZE;
    offsetX = (gameCanvas.width - mazeWidth) / 2;
    offsetY = (gameCanvas.height - mazeHeight) / 2;

    // Sesuaikan ukuran player
    player.size = tileSize * 0.4;


    // Reset posisi player
    // Panggil resetGame() untuk menempatkan player di spawn point
    resetGame();
}

/**
 * Memeriksa apakah pointer (tangan) berada di dalam tombol.
 * @param {object} button - Objek tombol.
 * @returns {boolean} - True jika pointer di dalam tombol.
 */
function isPointerInButton(button) {
    return (
        handPointer.x >= button.x &&
        handPointer.x <= button.x + button.w &&
        handPointer.y >= button.y &&
        handPointer.y <= button.y + button.h
    );
}

// --- 8. Inisialisasi Event Listener ---

// Panggil resizeCanvas saat pertama kali load dan saat di-resize
window.addEventListener('resize', resizeCanvas);
// Panggil saat DOM (HTML) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    createParticles(); // BARU: Buat partikel saat game pertama kali dimuat
    resizeCanvas(); // Set ukuran awal

    // MODIFIKASI: Jangan langsung mulai gameLoop. Mulai animasi intro dulu.
    IntroAnimation.start(() => {
        // Callback ini akan dijalankan saat animasi intro selesai
        console.log("Animasi intro selesai. Memulai game utama.");
        // Coba putar musik di sini, setelah interaksi (meskipun tidak langsung)
        bgMusic.play().catch(e => console.log("Autoplay musik gagal. Musik akan dimulai setelah interaksi pengguna."));
        
        requestAnimationFrame(gameLoop); // Baru mulai loop game utama
    });
});