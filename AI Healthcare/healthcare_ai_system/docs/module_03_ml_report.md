# Module 3: EDA & Machine Learning Model Development Report

## Overview
This report summarizes the Exploratory Data Analysis (EDA) and the training of Machine Learning models for disease classification based on the preprocessed healthcare dataset.

> [!WARNING]
> This system is an **educational AI prototype**. The predictions, confidence scores, and risk categories are for research demonstration purposes and MUST NOT be used for real medical diagnosis.

## Exploratory Data Analysis (EDA)
EDA was conducted on the merged training and validation sets to understand data characteristics. The visualizations are saved in the `reports/figures/` directory.

- **Target Distribution (`target_distribution.png`)**: Shows a slight class imbalance with more benign instances than malignant, which our models can safely handle.
- **Feature Distributions (`feature_distributions.png`)**: Boxplots reveal variations and outliers in key measurements across the two target classes, highlighting strong separating features.
- **Correlation Matrix (`correlation_matrix.png`)**: A heatmap of the top 15 features highly correlated with the target. It reveals multi-collinearity among specific radius/perimeter metrics.
- **Feature Relationships (`feature_relationships.png`)**: Pairplots demonstrate non-linear interactions among the top 3 features and how they cluster regarding the disease class.

## Methodology
1. **Algorithms**: Three baseline models were evaluated:
   - Logistic Regression
   - Random Forest Classifier
   - Gradient Boosting Classifier
2. **Training & Validation**: Models were trained on `X_train` and evaluated against `X_val`. The primary metric for selection was the **F1-Score** to penalize false negatives/positives, combined with **ROC-AUC** to measure discriminative power.
3. **Data Leakage Prevention**: Features were scaled using the pre-fitted `StandardScaler` from Module 2.

## Model Comparison Metrics

| Model | Accuracy | F1-Score | ROC-AUC |
|---|---|---|---|
| **Logistic Regression** | 0.9565 | **0.9655** | **0.9959** |
| Random Forest | 0.9348 | 0.9492 | 0.9686 |
| Gradient Boosting | 0.9565 | 0.9655 | 0.9878 |

## Selected Model
- **Best Model:** Logistic Regression
- **Rationale:** While both Logistic Regression and Gradient Boosting achieved a matching F1-score of `0.9655`, Logistic Regression produced a slightly higher AUC (`0.9959` vs `0.9878`). Furthermore, Logistic Regression is computationally efficient and intrinsically highly interpretable via its coefficients, which aligns with clinical explainability goals.
- **Serialization Path:** The model has been successfully serialized and saved to `models/best_model.joblib`.

## Prediction Service & Explainability
A reusable prediction pipeline (`PredictorService`) was implemented that encapsulates:
- Model and Preprocessor loading.
- Single-instance risk inference mapping probabilities to categorized severity (`Low`, `Medium`, `High Risk`).
- Top influential features extraction (e.g. `worst concave points`, `worst texture`) by leveraging the absolute coefficients of the Logistic Regression model for interpretability.
