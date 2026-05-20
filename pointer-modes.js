// File: pointer-modes-fixed.js
window.PointerHandler = {
    updateFromHand: function(results, pointersArr, canvas) {
        pointersArr[0].visible = false;
        pointersArr[1].visible = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            let handsData = results.multiHandLandmarks.map(lm => lm[8]); // Ujung jari telunjuk
            
            if (handsData.length >= 2) {
                // Jika ada 2 tangan, urutkan Kiri ke Kanan
                handsData.sort((a, b) => (1.0 - a.x) - (1.0 - b.x));
                pointersArr[0].visible = true; pointersArr[0].x = (1.0 - handsData[0].x) * canvas.width; pointersArr[0].y = handsData[0].y * canvas.height;
                pointersArr[1].visible = true; pointersArr[1].x = (1.0 - handsData[1].x) * canvas.width; pointersArr[1].y = handsData[1].y * canvas.height;
            } else if (handsData.length === 1) {
                // Jika hanya 1 tangan, cari tahu milik siapa
                let pX = (1.0 - handsData[0].x) * canvas.width;
                let pY = handsData[0].y * canvas.height;
                
                let isP0Dead = (typeof players !== 'undefined' && players[0].isDead);
                let isP1Dead = (typeof players !== 'undefined' && players[1].isDead);

                if (isP0Dead && !isP1Dead) {
                    pointersArr[1].visible = true; pointersArr[1].x = pX; pointersArr[1].y = pY;
                } else if (!isP0Dead && isP1Dead) {
                    pointersArr[0].visible = true; pointersArr[0].x = pX; pointersArr[0].y = pY;
                } else {
                    // Berikan ke pointer yang posisinya paling dekat
                    let dist0 = Math.hypot(pX - pointersArr[0].x, pY - pointersArr[0].y);
                    let dist1 = Math.hypot(pX - pointersArr[1].x, pY - pointersArr[1].y);
                    if (dist0 < dist1) { pointersArr[0].visible = true; pointersArr[0].x = pX; pointersArr[0].y = pY; }
                    else { pointersArr[1].visible = true; pointersArr[1].x = pX; pointersArr[1].y = pY; }
                }
            }
        }
    },

    updateFromFace: function(results, pointersArr, canvas, currentMode) {
        pointersArr[0].visible = false;
        pointersArr[1].visible = false;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            let facesData = results.multiFaceLandmarks;
            let assignedFaces = [null, null];
            
            if (facesData.length >= 2) {
                // Urutkan Kiri ke Kanan
                facesData.sort((a, b) => (1.0 - a[1].x) - (1.0 - b[1].x));
                assignedFaces = [facesData[0], facesData[1]];
            } else if (facesData.length === 1) {
                let noseX = (1.0 - facesData[0][1].x) * canvas.width;
                let isP0Dead = (typeof players !== 'undefined' && players[0].isDead);
                let isP1Dead = (typeof players !== 'undefined' && players[1].isDead);

                if (isP0Dead && !isP1Dead) assignedFaces[1] = facesData[0];
                else if (!isP0Dead && isP1Dead) assignedFaces[0] = facesData[0];
                else {
                    let dist0 = Math.abs(noseX - pointersArr[0].x);
                    let dist1 = Math.abs(noseX - pointersArr[1].x);
                    if (dist0 < dist1) assignedFaces[0] = facesData[0];
                    else assignedFaces[1] = facesData[0];
                }
            }

            for (let i = 0; i < 2; i++) {
                if (!assignedFaces[i]) continue;
                const landmarks = assignedFaces[i];
                pointersArr[i].visible = true;

                if (currentMode === 'NOSE') {
                    const noseTip = landmarks[1];
                    pointersArr[i].x = (1.0 - noseTip.x) * canvas.width;
                    pointersArr[i].y = noseTip.y * canvas.height;
                }
            }
        }
    }
};