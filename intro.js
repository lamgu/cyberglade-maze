// File: intro.js
// Objek untuk mengelola seluruh animasi pembuka
window.IntroAnimation = {
    // Properti
    text1: "PROJECT PRESENTED BY DTP AI SPECIALIST",
    text2: "- CYBERGLADE MAZE -", // Disingkat agar lebih pas
    charIndex1: 0,
    charIndex2: 0,
    isFinished: false,
    onCompleteCallback: null,
    
    // BARU: Properti untuk logo dan efek
    logoImg: new Image(),
    logoLoaded: false,
    logoAlpha: 0,
    logoScale: 0.5,
    glitchCounter: 0,
    
    // Properti untuk kursor berkedip
    cursorBlinkCounter: 0,
    showCursor: true,
    
    // Properti untuk delay
    delayCounter: 0,
    typingSpeed: 2, // Sedikit lebih cepat

    // BARU: State machine untuk mengelola alur animasi
    state: 'TYPING_TEXT1', // TYPING_TEXT1 -> GLITCHING -> LOGO_REVEAL -> TYPING_TEXT2 -> FINAL_PAUSE -> FADING_OUT
    stateCounter: 0,

    /**
     * Inisialisasi dan memulai animasi.
     * @param {function} onComplete - Fungsi yang akan dipanggil saat animasi selesai.
     */
    start: function(onComplete) {
        // Muat gambar logo di awal
        this.logoImg.src = 'telkom.png';
        this.logoImg.onload = () => {
            this.logoLoaded = true;
            console.log("Logo SMK Telkom Sidoarjo berhasil dimuat.");
        };
        this.logoImg.onerror = () => {
            console.error("Gagal memuat logo telkom.png. Pastikan file ada di direktori yang sama.");
        };

        this.onCompleteCallback = onComplete;
        this.animate(); // Mulai loop animasi
    },

    /**
     * Loop animasi utama untuk layar pembuka.
     */
    animate: function() {
        if (this.isFinished) return;

        // Dapatkan konteks canvas dari app.js
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');

        // Hapus layar
        ctx.fillStyle = '#000022';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Gambar partikel latar belakang (meminjam fungsi dari app.js)
        if (window.updateAndDrawParticles) {
            window.updateAndDrawParticles();
        }

        // --- Gambar Teks & Kursor (fungsi pembantu) ---
        const drawTypingText = (text, yPos, charIndex) => {
            const currentText = text.substring(0, charIndex);
            ctx.fillText(currentText, canvas.width / 2, yPos);
            // Gambar kursor
            if (this.showCursor) {
                const cursorX = ctx.measureText(currentText).width / 2 + canvas.width / 2;
                ctx.fillText("_", cursorX + 10, yPos);
            }
        };

        // --- Atur Style Teks ---
        ctx.font = "bold 30px 'Orbitron'";
        ctx.fillStyle = '#00FF00'; // Warna hijau "hacker"
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 10;

        // --- State Machine Animasi ---
        this.stateCounter++;
        switch (this.state) {
            case 'TYPING_TEXT1':
                if (this.stateCounter % this.typingSpeed === 0 && this.charIndex1 < this.text1.length) this.charIndex1++;
                drawTypingText(this.text1, canvas.height / 2 - 100, this.charIndex1);
                if (this.charIndex1 >= this.text1.length) {
                    this.state = 'GLITCHING';
                    this.stateCounter = 0;
                }
                break;

            case 'GLITCHING':
                ctx.fillText(this.text1, canvas.width / 2, canvas.height / 2 - 100); // Tampilkan teks penuh
                // Efek glitch selama 30 frame
                if (this.stateCounter < 30 && this.logoLoaded) {
                    const logoX = canvas.width / 2 - this.logoImg.width / 2;
                    const logoY = canvas.height / 2 - this.logoImg.height / 2 - 20;
                    for (let i = 0; i < 10; i++) {
                        const x = logoX + Math.random() * this.logoImg.width;
                        const y = logoY + Math.random() * this.logoImg.height;
                        const w = Math.random() * 20;
                        const h = Math.random() * 20;
                        ctx.fillStyle = `rgba(${Math.random()*255}, 255, ${Math.random()*255}, ${Math.random()})`;
                        ctx.fillRect(x, y, w, h);
                    }
                } else {
                    this.state = 'LOGO_REVEAL';
                    this.stateCounter = 0;
                }
                break;

            case 'LOGO_REVEAL':
                ctx.fillText(this.text1, canvas.width / 2, canvas.height / 2 - 100);
                // Animasi kemunculan logo
                if (this.logoAlpha < 1) this.logoAlpha += 0.05;
                if (this.logoScale < 1) this.logoScale += 0.02;
                
                if (this.logoLoaded) {
                    ctx.globalAlpha = this.logoAlpha;
                    const w = this.logoImg.width * this.logoScale;
                    const h = this.logoImg.height * this.logoScale;
                    ctx.drawImage(this.logoImg, canvas.width / 2 - w / 2, canvas.height / 2 - h / 2 - 20, w, h);
                    ctx.globalAlpha = 1.0;
                }

                if (this.logoAlpha >= 1) {
                    this.state = 'TYPING_TEXT2';
                    this.stateCounter = 0;
                }
                break;

            case 'TYPING_TEXT2':
                ctx.fillText(this.text1, canvas.width / 2, canvas.height / 2 - 100);
                if (this.logoLoaded) ctx.drawImage(this.logoImg, canvas.width / 2 - this.logoImg.width / 2, canvas.height / 2 - this.logoImg.height / 2 - 20);
                
                if (this.stateCounter % this.typingSpeed === 0 && this.charIndex2 < this.text2.length) this.charIndex2++;
                drawTypingText(this.text2, canvas.height / 2 + 80, this.charIndex2);

                if (this.charIndex2 >= this.text2.length) {
                    this.state = 'FINAL_PAUSE';
                    this.stateCounter = 0;
                }
                break;

            case 'FINAL_PAUSE':
                ctx.fillText(this.text1, canvas.width / 2, canvas.height / 2 - 100);
                if (this.logoLoaded) ctx.drawImage(this.logoImg, canvas.width / 2 - this.logoImg.width / 2, canvas.height / 2 - this.logoImg.height / 2 - 20);
                ctx.fillText(this.text2, canvas.width / 2, canvas.height / 2 + 80);
                
                if (this.stateCounter > 120) { // Jeda 2 detik
                    this.state = 'FADING_OUT';
                    this.stateCounter = 0;
                    this.logoAlpha = 1; // Gunakan alpha untuk fade out
                }
                break;

            case 'FADING_OUT':
                // Gambar semua elemen dengan alpha yang menurun
                ctx.globalAlpha = this.logoAlpha;
                ctx.fillText(this.text1, canvas.width / 2, canvas.height / 2 - 100);
                if (this.logoLoaded) ctx.drawImage(this.logoImg, canvas.width / 2 - this.logoImg.width / 2, canvas.height / 2 - this.logoImg.height / 2 - 20);
                ctx.fillText(this.text2, canvas.width / 2, canvas.height / 2 + 80);
                ctx.globalAlpha = 1.0;

                this.logoAlpha -= 0.02;
                if (this.logoAlpha <= 0) {
                    this.isFinished = true;
                    this.onCompleteCallback(); // Panggil callback untuk memulai game utama
                }
                break;
        }

        // Minta frame berikutnya
        requestAnimationFrame(() => this.animate());
    }
};