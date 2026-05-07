const samplingRules = {
    1: [1], 2: [1, 2], 3: [1, 2, 3], 4: [1, 2, 4], 5: [1, 3, 5],
    6: [1, 3, 6], 7: [1, 3, 6, 7], 8: [1, 3, 6, 8], 9: [1, 3, 6, 9],
    10: [1, 3, 6, 10], 11: [1, 5, 10, 11], 12: [1, 5, 10, 12],
    13: [1, 5, 10, 13], 14: [1, 5, 10, 14], 15: [1, 5, 10, 15],
    16: [1, 5, 10, 15, 16], 17: [1, 5, 10, 15, 17], 18: [1, 5, 10, 15, 18],
    19: [1, 5, 10, 15, 19], 20: [1, 5, 10, 15, 20], 21: [1, 5, 10, 15, 20, 21]
};

// State to keep track of checked samples
let checkedSamples = {};

function toggleSample(lotNum) {
    checkedSamples[lotNum] = !checkedSamples[lotNum];
    calculateSamples(); // Re-render to show changes
}

function calculateSamples() {
    const lotInput = document.getElementById('lotCount');
    const kgInput = document.getElementById('kgPerLot');
    const currentKgInput = document.getElementById('currentKg');
    const resultsDiv = document.getElementById('results');
    const summaryBox = document.getElementById('summaryBox');
    const summaryText = document.getElementById('summaryText');
    
    const totalLots = parseInt(lotInput.value);
    const kgPerLot = parseFloat(kgInput.value);
    const currentKg = parseFloat(currentKgInput.value) || 0;

    if (!lotInput.value || !kgInput.value || kgPerLot <= 0) {
        resultsDiv.innerHTML = "<em>Waiting for production data...</em>";
        summaryBox.style.display = "none";
        return;
    }

    const currentLotNumber = Math.ceil(currentKg / kgPerLot) || 1;

    if (samplingRules[totalLots]) {
        const samples = samplingRules[totalLots];
        
        // Update Summary Box
        summaryBox.style.display = "block";
        summaryText.innerText = `${totalLots} Lots @ ${kgPerLot}kg: Samples needed for Lots [${samples.join(', ')}]`;

        let htmlOutput = `<h3 style="margin-bottom: 20px;">QC Action Plan</h3>`;
        let markerPlaced = false;

        samples.forEach((lotNum) => {
            const startKg = (lotNum - 1) * kgPerLot;
            const endKg = lotNum * kgPerLot;
            const isActive = (currentLotNumber === lotNum);
            const isChecked = checkedSamples[lotNum];

            if (!markerPlaced && currentLotNumber < lotNum) {
                htmlOutput += `
                    <div style="margin: 10px 0; padding: 8px; border: 1px dashed #0056b3; background: #eef6ff; color: #0056b3; border-radius: 4px; text-align: center; font-size: 0.9rem; font-weight: bold;">
                        ⬇️ Currently at Lot #${currentLotNumber} (${currentKg.toLocaleString()}kg)
                    </div>
                `;
                markerPlaced = true;
            }

            // Styling adjustments
            const borderStyle = isChecked ? '8px solid #6c757d' : (isActive ? '8px solid #ffc107' : '8px solid #28a745');
            const backgroundStyle = isChecked ? '#f8f9fa' : (isActive ? '#fff9e6' : '#ffffff');
            const opacity = (currentLotNumber > lotNum || isChecked) ? '0.6' : '1';

            htmlOutput += `
                <div style="background: ${backgroundStyle}; border: 1px solid #ddd; border-left: ${borderStyle}; border-radius: 4px; padding: 15px; margin-bottom: 15px; opacity: ${opacity}; box-shadow: ${isActive && !isChecked ? '0px 0px 15px rgba(255, 193, 7, 0.5)' : 'none'}; transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 0.8rem; text-transform: uppercase; color: #666;">Requirement</span>
                            <div style="font-size: 1.5rem; font-weight: bold; color: ${isChecked ? '#6c757d' : '#333'}; text-decoration: ${isChecked ? 'line-through' : 'none'};">
                                Lot #${lotNum} ${isActive && !isChecked ? '<span style="background: #ffc107; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 10px;">COLLECT NOW</span>' : ''}
                            </div>
                            <button onclick="toggleSample(${lotNum})" style="margin-top: 10px; padding: 5px 10px; cursor: pointer; background: ${isChecked ? '#6c757d' : '#fff'}; color: ${isChecked ? '#fff' : '#333'}; border: 1px solid #ccc; border-radius: 4px;">
                                ${isChecked ? '✅ Sampled' : 'Mark as Sampled'}
                            </button>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.8rem; color: #666;">Collection Window:</span>
                            <div style="font-size: 1.3rem; color: ${isActive && !isChecked ? '#cc9900' : (isChecked ? '#6c757d' : '#28a745')}; font-weight: bold;">
                                ${startKg.toLocaleString()}kg - ${endKg.toLocaleString()}kg
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        resultsDiv.innerHTML = htmlOutput;
    }
}
