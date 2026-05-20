// File: level-editor.js

// Kita bungkus semua logika editor dalam satu objek global
// agar tidak mengotori scope global.
window.LevelEditor = {
    // Properti
    grid: [],
    tileSize: 0,
    offsetX: 0,
    offsetY: 0,
    GRID_SIZE: 19,
    startButton: { x: 0, y: 0, w: 0, h: 0 },
    dwellTimer: 0, // Timer dwell khusus untuk editing tile
    onStartCallback: null, // Fungsi yang akan dipanggil saat 'Start' ditekan

    /**
     * Inisialisasi editor. Dipanggil sekali saat beralih ke mode editor.
     * @param {CanvasRenderingContext2D} ctx - Konteks canvas dari app.js.
     * @param {function} onStart - Callback untuk dieksekusi saat level selesai dibuat.
     */
    init: function(ctx, onStart) {
        this.onStartCallback = onStart;
        this.grid = this.createEmptyGrid();
        this.resize(ctx.canvas.width, ctx.canvas.height);
        console.log("Level Editor diinisialisasi.");
    },

    /**
     * Membuat grid kosong 19x19 dengan tembok di sekelilingnya.
     * 0 = Jalan, 1 = Tembok
     */
    createEmptyGrid: function() {
        const grid = [];
        for (let y = 0; y < this.GRID_SIZE; y++) {
            const row = [];
            for (let x = 0; x < this.GRID_SIZE; x++) {
                // Buat tembok di sekeliling (baris/kolom pertama & terakhir)
                if (y === 0 || y === this.GRID_SIZE - 1 || x === 0 || x === this.GRID_SIZE - 1) {
                    row.push(1); // Tembok
                } else {
                    row.push(0); // Jalan
                }
            }
            grid.push(row);
        }
        // Pastikan ada spawn point (2) dan finish (3)
        grid[2][2] = 2; // Spawn
        grid[this.GRID_SIZE - 3][this.GRID_SIZE - 3] = 3; // Finish
        return grid;
    },

    /**
     * Menghitung ulang ukuran grid editor saat canvas di-resize.
     */
    resize: function(canvasWidth, canvasHeight) {
        const minDim = Math.min(canvasWidth, canvasHeight);
        this.tileSize = Math.floor((minDim * 0.8) / this.GRID_SIZE);
        
        const gridWidth = this.tileSize * this.GRID_SIZE;
        this.offsetX = (canvasWidth - gridWidth) / 2;
        this.offsetY = (canvasHeight - gridWidth) / 2;
    },

    /**
     * Fungsi utama yang dipanggil di game loop untuk menggambar dan update.
     * @param {CanvasRenderingContext2D} ctx - Konteks canvas.
     * @param {object} pointer - Objek pointer tangan dari app.js.
     * @param {boolean} isClicked - Status klik (kedip atau tahan) dari app.js.
     * @param {number} deltaTime - Waktu antar frame.
     */
    updateAndDraw: function(ctx, pointer, isClicked, deltaTime) {
        // Gambar Judul
        ctx.fillStyle = '#E2E8F0';
        ctx.font = "bold 48px 'Inter'";
        ctx.textAlign = 'center';
        ctx.fillText("BUAT LEVEL CUSTOM", ctx.canvas.width / 2, this.offsetY - 50);

        let hoveredCell = null;

        // Gambar grid
        for (let y = 0; y < this.GRID_SIZE; y++) {
            for (let x = 0; x < this.GRID_SIZE; x++) {
                const tileX = this.offsetX + x * this.tileSize;
                const tileY = this.offsetY + y * this.tileSize;
                const tileType = this.grid[y][x];

                // Tentukan warna berdasarkan tipe tile
                if (tileType === 1) ctx.fillStyle = '#4A5568'; // Tembok
                else if (tileType === 2) ctx.fillStyle = 'rgba(0, 150, 0, 0.5)'; // Spawn
                else if (tileType === 3) ctx.fillStyle = '#38A169'; // Finish
                else ctx.fillStyle = '#1A202C'; // Jalan

                ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                ctx.strokeStyle = '#000022';
                ctx.strokeRect(tileX, tileY, this.tileSize, this.tileSize);

                // Cek apakah pointer berada di atas tile ini
                if (pointer.visible && pointer.x > tileX && pointer.x < tileX + this.tileSize &&
                    pointer.y > tileY && pointer.y < tileY + this.tileSize) {
                    hoveredCell = { x, y };
                }
            }
        }

        // MODIFIKASI: Logika dwell-to-toggle tile (hanya untuk mengedit)
        if (hoveredCell) {
            this.dwellTimer += deltaTime;
            const { x, y } = hoveredCell;
            
            // Gambar indikator hover
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.fillRect(this.offsetX + x * this.tileSize, this.offsetY + y * this.tileSize, this.tileSize, this.tileSize);

            if (this.dwellTimer > 0.5) { // Waktu dwell lebih cepat untuk editing
                // Hanya izinkan mengubah tile jalan (0) dan tembok (1)
                if (this.grid[y][x] === 0 || this.grid[y][x] === 1) {
                    this.grid[y][x] = 1 - this.grid[y][x]; // Toggle 0 -> 1 atau 1 -> 0
                }
                this.dwellTimer = 0; // Reset setelah toggle
            }
        } else {
            // Reset timer jika tidak ada cell yang di-hover
            this.dwellTimer = 0;
        }

        // Gambar tombol "Start Use Custom Mode"
        this.startButton.w = 400;
        this.startButton.h = 70;
        this.startButton.x = (ctx.canvas.width - this.startButton.w) / 2;
        this.startButton.y = this.offsetY + (this.GRID_SIZE * this.tileSize) + 20;

        // Gambar tombol (tanpa logika klik di sini)
        ctx.fillStyle = '#38A169'; // Hijau
        ctx.fillRect(this.startButton.x, this.startButton.y, this.startButton.w, this.startButton.h);
        ctx.fillStyle = '#E2E8F0';
        ctx.font = "bold 30px 'Inter'";
        ctx.fillText("START USE CUSTOM MODE", this.startButton.x + this.startButton.w / 2, this.startButton.y + 45);

        // MODIFIKASI: Cek jika tombol start diklik (logika dari app.js)
        const isHoveringStart = pointer.visible && pointer.x > this.startButton.x && pointer.x < this.startButton.x + this.startButton.w &&
                                pointer.y > this.startButton.y && pointer.y < this.startButton.y + this.startButton.h;

        if (isClicked && isHoveringStart) {
            // Jika callback ada, panggil dengan grid yang sudah dibuat
            if (this.onStartCallback) {
                this.onStartCallback(this.grid.map(row => [...row]));
            }
        }
    }
};