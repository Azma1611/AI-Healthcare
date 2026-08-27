# Module 2: Dataset Collection & Preprocessing Report

## Dataset Overview
- **Dataset Source:** UCI Breast Cancer Wisconsin (Diagnostic) Dataset (via `sklearn.datasets`).
- **Nature:** Safe, publicly available dataset suitable for educational/research disease prediction prototyping.
- **Disclaimer:** The data and models produced in this prototype are for experimental/educational use and do NOT constitute medical diagnosis or clinical safety claims.

## Dataset Statistics
- **Total Records:** 569
- **Total Features (Original):** 30
- **Total Features (Engineered):** 32
- **Missing Values:** 0
- **Class Distribution:**
  - `1` (Benign): 357
  - `0` (Malignant): 212

## Feature Engineering & Preprocessing Steps
1. **Cleaning:** Configured to handle missing values (imputed via median strategy) and remove exact row duplicates. No duplicates were found in this specific clean dataset.
2. **Invalid Values Check:** Validated that no unexpected negative measurements exist in physical characteristics.
3. **Feature Engineering:** Added two interaction terms to demonstrate domain-knowledge engineering:
   - `radius_texture_interaction`: Mean Radius * Mean Texture
   - `perimeter_area_interaction`: Mean Perimeter * Mean Area
4. **Data Splitting (Stratified):**
   - **Test Set:** 20% (114 records)
   - **Validation Set:** 10% of remaining (45 records)
   - **Train Set:** Remaining (410 records)
5. **Data Scaling & Leakage Prevention:** 
   - A `StandardScaler` was fit strictly on the **Training Set**.
   - The fitted scaler was subsequently used to transform the validation and test sets.
   - The transformation pipeline was saved to `models/preprocessor.joblib`.
