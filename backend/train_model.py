# train_model.py

import pandas as pd
import numpy as np
import os
import zipfile
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import joblib # Used to save the model and scaler

print("--- Starting Model Training ---")

# --- Step 1: Load and Unzip Data ---
# Assumes 'archive.zip' is in a 'dataset' subfolder
zip_path = "datasets/archive.zip"
extract_path = "dataset/extracted"
os.makedirs(extract_path, exist_ok=True)

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_path)

csv_files = [f for f in os.listdir(extract_path) if f.endswith('.csv')]
data = pd.read_csv(os.path.join(extract_path, csv_files[0]))

# --- Step 2: Clean and Preprocess Data ---
data.replace([-99.9, -99.90], np.nan, inplace=True)
num_cols = ['Hs','Hmax','Tz','Tp','Peak Direction','SST']
data[num_cols] = data[num_cols].interpolate(method='linear')
data.dropna(inplace=True)

# --- Step 3: Create Target Variable ('wave_type') ---
tp_threshold = 17
data['wave_type'] = np.where(data['Tp'] >= tp_threshold, 1, 0)
print("\nOriginal class distribution:")
print(data['wave_type'].value_counts())

# --- Step 4: Feature Engineering ---
data['Date/Time'] = pd.to_datetime(data['Date/Time'], errors='coerce')
data = data.dropna(subset=['Date/Time']).reset_index(drop=True)
data['hour'] = data['Date/Time'].dt.hour
data['month'] = data['Date/Time'].dt.month
data['day_of_year'] = data['Date/Time'].dt.dayofyear
data['day_of_year_sin'] = np.sin(2 * np.pi * data['day_of_year'] / 365)
data['day_of_year_cos'] = np.cos(2 * np.pi * data['day_of_year'] / 365)
data['Hs_rolling_6h'] = data['Hs'].rolling(window=6, min_periods=1).mean()
data['Tp_rolling_6h'] = data['Tp'].rolling(window=6, min_periods=1).mean()

# --- Step 5: Define features and target ---
features = [
    'Hs','Hmax','Tz','Tp','Peak Direction','SST',
    'hour','month','day_of_year_sin','day_of_year_cos',
    'Hs_rolling_6h','Tp_rolling_6h'
]
X = data[features]
y = data['wave_type']

# --- Step 6: Scale features ---
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# --- Step 7: Split data ---
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# --- Step 8: Apply SMOTE to the training data ---
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
print("\nTraining data class distribution after SMOTE:")
print(pd.Series(y_train_resampled).value_counts())

# --- Step 9: Train the XGBoost Model ---
print("\nTraining XGBoost model...")
xgb = XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=42, use_label_encoder=False, eval_metric='logloss')
xgb.fit(X_train_resampled, y_train_resampled)
print("Model training complete.")

# --- Step 10: Save the Model and the Scaler ---
joblib.dump(xgb, 'xgb_model.joblib')
joblib.dump(scaler, 'scaler.joblib')
joblib.dump(features, 'feature_names.joblib') # Save feature names as well
print("\n✅ Model, scaler, and feature names have been saved to files: xgb_model.joblib, scaler.joblib, feature_names.joblib")