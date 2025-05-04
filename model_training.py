import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier

def train_disease_model():
    df = pd.read_csv('static/dataset.csv').fillna("")
    
    # Combine symptoms
    df['Symptoms'] = ""
    for i in range(1, 18):
        df['Symptoms'] += " " + df[f"Symptom_{i}"].astype(str)
    df['Symptoms'] = df['Symptoms'].str.strip()
    
    # Train model
    model = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('clf', LinearSVC())
    ])
    model.fit(df['Symptoms'], df['Disease'])
    
    # Save model
    joblib.dump(model, 'static/models/disease_model.pkl')

def train_medication_model():
    data = pd.read_csv('static/medicaldata.csv')
    
    # Clean data
    data['DateOfBirth'] = pd.to_datetime(data['DateOfBirth'], errors='coerce')
    data['DateOfBirth'].fillna(data['DateOfBirth'].median(), inplace=True)
    
    categorical_columns = ['Gender', 'Symptoms', 'Causes', 'Disease', 'Medicine']
    for column in categorical_columns:
        data[column].fillna(data[column].mode()[0], inplace=True)
    data['Name'].fillna('Unknown', inplace=True)
    
    # Train model
    model = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    model.fit(data['Symptoms'], data['Medicine'])
    
    # Save model
    joblib.dump(model, 'static/models/medication_model.pkl')

if __name__ == '__main__':
    train_disease_model()
    train_medication_model()