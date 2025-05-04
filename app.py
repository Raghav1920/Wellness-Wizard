from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib
import os
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)

# Load models
def load_models():
    os.makedirs('static/models', exist_ok=True)
    
    # Disease model
    disease_path = 'static/models/disease_model.pkl'
    if not os.path.exists(disease_path):
        from model_training import train_disease_model
        train_disease_model()
    disease_model = joblib.load(disease_path)
    
    # Medication model
    med_path = 'static/models/medication_model.pkl'
    if not os.path.exists(med_path):
        from model_training import train_medication_model
        train_medication_model()
    medication_model = joblib.load(med_path)
    
    return disease_model, medication_model

disease_model, medication_model = load_models()

MEDICATION_DB = {
    "Influenza (Flu)": {
        "medications": ["Oseltamivir (Tamiflu)", "Acetaminophen", "Ibuprofen"],
        "prevention": ["Flu vaccine", "Wash hands", "Avoid sick people"]
    },
    "Common Cold": {
        "medications": ["Decongestants", "Antihistamines", "Throat lozenges"],
        "prevention": ["Wash hands", "Avoid touching face", "Stay hydrated"]
    }
}

@app.route('/')
def index():
    return render_template('index.html', active_page='dashboard')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        symptoms = request.json.get('symptoms', [])
        symptoms_text = ' '.join(symptoms)
        
        # Predict disease
        disease = disease_model.predict([symptoms_text])[0]
        
        # Predict medication
        medicine = medication_model.predict([symptoms_text])[0]
        
        # Get additional info
        disease_info = MEDICATION_DB.get(disease, {
            "medications": ["Consult doctor"],
            "prevention": ["Good hygiene", "Rest", "Hydration"]
        })
        
        return jsonify({
            'disease': disease,
            'medicine': medicine,
            'medications': disease_info['medications'],
            'prevention': disease_info['prevention']
        })
    
    return render_template('predict.html', active_page='predict')

@app.route('/history')
def history():
    return render_template('history.html', active_page='history')

if __name__ == '__main__':
    app.run(debug=True)