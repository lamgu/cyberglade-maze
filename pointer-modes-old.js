// File: pointer-modes.js

// Objek global untuk menangani semua logika pointer
window.PointerHandler = {
    // --- Properti untuk Deteksi Kedipan ---
    EAR_THRESHOLD: 0.25,
    BLINK_CONSEC_FRAMES: 2,
    blinkCounter: 0,
    blinkTriggered: false,

    // Indeks landmark untuk mata
    LEFT_EYE_INDICES: [33, 160, 158, 133, 153, 144],
    RIGHT_EYE_INDICES: [362, 385, 387, 263, 373, 380],

    /**
     * Menghitung jarak Euclidean antara 2 titik 3D.
     */
    euclideanDist: function(p1, p2) {
        return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2);
    },

    /**
     * Menghitung Eye Aspect Ratio (EAR) untuk satu mata.
     */
    getEAR: function(landmarks, eyeIndices) {
        const v1 = this.euclideanDist(landmarks[eyeIndices[1]], landmarks[eyeIndices[5]]);
        const v2 = this.euclideanDist(landmarks[eyeIndices[2]], landmarks[eyeIndices[4]]);
        const h = this.euclideanDist(landmarks[eyeIndices[0]], landmarks[eyeIndices[3]]);
        return (v1 + v2) / (2.0 * h);
    },

    /**
     * Memperbarui pointer berdasarkan deteksi tangan.
     * @param {object} results - Hasil dari MediaPipe Hands.
     * @param {object} pointerObject - Objek pointer yang akan diupdate.
     * @param {HTMLCanvasElement} canvas - Elemen canvas untuk konversi koordinat.
     */
    updateFromHand: function(results, pointerObject, canvas) {
        pointerObject.visible = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
            const landmarks = results.multiHandLandmarks[0];
            const pointerLandmark = landmarks[8]; // Ujung jari telunjuk untuk pointer

            if (pointerLandmark) {
                pointerObject.visible = true;
                pointerObject.x = (1.0 - pointerLandmark.x) * canvas.width;
                pointerObject.y = pointerLandmark.y * canvas.height;
            }
        }
    },

    /**
     * Memperbarui pointer berdasarkan deteksi wajah (hidung atau mata).
     * Juga menangani deteksi kedipan.
     * @param {object} results - Hasil dari MediaPipe FaceMesh.
     * @param {object} pointerObject - Objek pointer yang akan diupdate.
     * @param {HTMLCanvasElement} canvas - Elemen canvas.
     * @param {string} currentMode - Mode deteksi saat ini ('NOSE' atau 'EYE').
     */
    updateFromFace: function(results, pointerObject, canvas, currentMode) {
        // Selalu reset status kedipan di setiap frame
        this.blinkTriggered = false;
        pointerObject.visible = false;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            const landmarks = results.multiFaceLandmarks[0];
            pointerObject.visible = true;

            // --- Logika Posisi Pointer ---
            if (currentMode === 'NOSE') {
                // Pointer mengikuti ujung hidung
                const noseTip = landmarks[1];
                if (noseTip) {
                    pointerObject.x = (1.0 - noseTip.x) * canvas.width;
                    pointerObject.y = noseTip.y * canvas.height;
                } 
            } else if (currentMode === 'EYE') {
                // Pointer mengikuti titik tengah antara kedua mata
                const leftEyeCenter = landmarks[133]; // Titik dalam mata kiri
                const rightEyeCenter = landmarks[362]; // Titik dalam mata kanan
                if (leftEyeCenter && rightEyeCenter) {
                    const midX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
                    const midY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
                    pointerObject.x = (1.0 - midX) * canvas.width;
                    pointerObject.y = midY * canvas.height;
                }
            }

            // --- Logika Deteksi Kedipan (hanya untuk mode 'EYE') ---
            if (currentMode === 'EYE') {
                const leftEAR = this.getEAR(landmarks, this.LEFT_EYE_INDICES);
                const rightEAR = this.getEAR(landmarks, this.RIGHT_EYE_INDICES);
                const avgEAR = (leftEAR + rightEAR) / 2.0;

                if (avgEAR < this.EAR_THRESHOLD) {
                    this.blinkCounter++;
                } else {
                    if (this.blinkCounter >= this.BLINK_CONSEC_FRAMES) {
                        this.blinkTriggered = true; // Picu "klik"
                        console.log("Kedipan terdeteksi!");
                    }
                    this.blinkCounter = 0; // Reset counter
                }
            }
        }
    }
};