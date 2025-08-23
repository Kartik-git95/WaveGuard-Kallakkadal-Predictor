# predictor.py

import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# --- Step 1: Load the saved model, scaler, and feature names ---
# This part runs only once when the Flask app starts and imports this file.
try:
    print("Loading model artifacts...")
    model = joblib.load('xgb_model.joblib')
    scaler = joblib.load('scaler.joblib')
    feature_names = joblib.load('feature_names.joblib')
    print("✅ Model and artifacts loaded successfully.")
except FileNotFoundError:
    print("❌ Error: Model files not found. Please run train_model.py first.")
    model = None # Set to None to handle the error gracefully in the app

# --- Step 2: Define the Prediction Function ---
def predict_wave_type(input_data):
    """
    Predicts the wave type from a single dictionary of raw input data.
    This function is STATELESS and performs all necessary feature engineering.
    """
    if model is None:
        raise RuntimeError("Model is not loaded. Cannot make predictions.")

    # --- Feature Engineering ---
    # Create a DataFrame from the single input point
    df = pd.DataFrame([input_data])
    
    # Calculate time-based features
    now = datetime.now()
    df['hour'] = now.hour
    df['month'] = now.month
    
    day_of_year = now.timetuple().tm_yday
    df['day_of_year_sin'] = np.sin(2 * np.pi * day_of_year / 365)
    df['day_of_year_cos'] = np.cos(2 * np.pi * day_of_year / 365)
    
    # For a single prediction, the rolling average is just the current value
    df['Hs_rolling_6h'] = df['Hs']
    df['Tp_rolling_6h'] = df['Tp']
    
    # --- Scaling and Prediction ---
    # Ensure columns are in the correct order as defined during training
    X = df[feature_names]
    
    # Apply the loaded scaler
    X_scaled = scaler.transform(X)

    # Make the prediction
    prediction = model.predict(X_scaled)
    probability = model.predict_proba(X_scaled)

    # --- Format and Return the Result ---
    if prediction[0] == 1:
        confidence = probability[0][1] * 100
        return {"prediction": "Kallakkadal", "value": 1, "confidence": f"{confidence:.2f}%"}
    else:
        confidence = probability[0][0] * 100
        return {"prediction": "Normal", "value": 0, "confidence": f"{confidence:.2f}%"}