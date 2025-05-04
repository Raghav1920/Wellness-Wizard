document.addEventListener('DOMContentLoaded', function() {
    const symptomInput = document.getElementById('symptomInput');
    const symptomSuggestions = document.getElementById('symptomSuggestions');
    const addSymptomBtn = document.getElementById('addSymptomBtn');
    const symptomTags = document.getElementById('symptomTags');
    const predictBtn = document.getElementById('predictBtn');
    const resultsSection = document.getElementById('resultsSection');
    const predictedDisease = document.getElementById('predictedDisease');
    const recommendedMedicine = document.getElementById('recommendedMedicine');
    const medicationOptions = document.getElementById('medicationOptions');
    const preventionTips = document.getElementById('preventionTips');
    
    let selectedSymptoms = [];
    const commonSymptoms = ['fever', 'headache', 'cough', 'fatigue', 'nausea'];
    
    // Add symptom from input
    function addSymptom(symptom) {
        if (symptom && !selectedSymptoms.includes(symptom)) {
            selectedSymptoms.push(symptom);
            updateSymptomTags();
        }
    }
    
    // Update symptom tags display
    function updateSymptomTags() {
        symptomTags.innerHTML = selectedSymptoms.map(symptom => `
            <span class="badge bg-primary me-2 mb-2 symptom-tag">
                ${symptom}
                <span class="remove-btn" data-symptom="${symptom}">×</span>
            </span>
        `).join('');
        
        // Add remove handlers
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const symptomToRemove = this.getAttribute('data-symptom');
                selectedSymptoms = selectedSymptoms.filter(s => s !== symptomToRemove);
                updateSymptomTags();
            });
        });
    }
    
    // Predict disease
    async function predictDisease() {
        if (selectedSymptoms.length === 0) {
            alert('Please add at least one symptom');
            return;
        }
        
        predictBtn.disabled = true;
        predictBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Predicting...';
        
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symptoms: selectedSymptoms
                })
            });
            
            const data = await response.json();
            
            // Display results
            predictedDisease.textContent = data.disease;
            recommendedMedicine.textContent = data.medicine;
            
            medicationOptions.innerHTML = data.medications
                .map(med => `<li class="list-group-item">${med}</li>`)
                .join('');
            
            preventionTips.innerHTML = data.prevention
                .map(tip => `<li class="list-group-item">${tip}</li>`)
                .join('');
            
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Prediction error:', error);
            alert('Error making prediction. Please try again.');
        } finally {
            predictBtn.disabled = false;
            predictBtn.innerHTML = '<i class="fas fa-diagnoses me-2"></i> Predict Disease';
        }
    }
    
    // Event listeners
    addSymptomBtn.addEventListener('click', () => {
        addSymptom(symptomInput.value.trim().toLowerCase());
        symptomInput.value = '';
    });
    
    symptomInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSymptom(symptomInput.value.trim().toLowerCase());
            symptomInput.value = '';
        }
    });
    
    symptomInput.addEventListener('input', () => {
        const input = symptomInput.value.toLowerCase();
        if (input.length > 1) {
            const matches = commonSymptoms.filter(symptom => 
                symptom.includes(input) && !selectedSymptoms.includes(symptom)
            );
            
            if (matches.length > 0) {
                symptomSuggestions.innerHTML = matches.map(symptom => 
                    `<div class="suggestion-item p-2">${symptom}</div>`
                ).join('');
                symptomSuggestions.classList.add('show');
            } else {
                symptomSuggestions.classList.remove('show');
            }
        } else {
            symptomSuggestions.classList.remove('show');
        }
    });
    
    symptomSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            addSymptom(e.target.textContent.trim());
            symptomInput.value = '';
            symptomSuggestions.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.common-symptom').forEach(item => {
        item.addEventListener('click', () => {
            addSymptom(item.textContent.trim());
        });
    });
    
    predictBtn.addEventListener('click', predictDisease);
});