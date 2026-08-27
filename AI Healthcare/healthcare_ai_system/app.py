import streamlit as st
import pandas as pd
import json
import logging
import os
import requests
import plotly.express as px

# ---------------------------------------------------------
# UI Config & Layout
# ---------------------------------------------------------
st.set_page_config(
    page_title="AI Healthcare CDS Dashboard",
    page_icon="🏥",
    layout="wide"
)

API_URL = os.getenv("API_URL", "http://localhost:8000")

# ---------------------------------------------------------
# Authentication State
# ---------------------------------------------------------
if "access_token" not in st.session_state:
    st.session_state["access_token"] = None

def login(username, password):
    try:
        response = requests.post(
            f"{API_URL}/auth/token",
            data={"username": username, "password": password}
        )
        if response.status_code == 200:
            st.session_state["access_token"] = response.json()["access_token"]
            st.success("Login successful!")
            st.rerun()
        else:
            st.error("Invalid username or password.")
    except Exception as e:
        st.error(f"Failed to connect to API: {e}")

def register(name, email, password, age, gender, phone):
    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            json={
                "name": name,
                "email": email,
                "password": password,
                "role": "patient",
                "age": age,
                "gender": gender,
                "phone": phone
            }
        )
        if response.status_code == 200:
            st.success("Registration successful! Please log in.")
        else:
            st.error(f"Registration failed: {response.json().get('detail', 'Unknown error')}")
    except Exception as e:
        st.error(f"Failed to connect to API: {e}")

def logout():
    st.session_state["access_token"] = None
    st.rerun()

# ---------------------------------------------------------
# Login / Register Screen
# ---------------------------------------------------------
if st.session_state["access_token"] is None:
    st.markdown("""
<style>
/* App background */
.stApp {
    background: linear-gradient(135deg, #eef2f7 0%, #f7f9fc 100%);
}

/* Center main container */
.block-container {
    max-width: 480px !important;
    margin: 0 auto !important;
    padding: 10vh 20px 20px 20px !important;
    display: flex;
    flex-direction: column;
}

/* Hide header, footer, and deploy button */
header[data-testid="stHeader"], footer[data-testid="stFooter"], .stDeployButton {
    display: none !important;
}

/* Style the form to be the login card */
div[data-testid="stForm"] {
    background-color: #ffffff !important;
    border-radius: 20px !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08) !important;
    border: 1px solid rgba(0, 0, 0, 0.05) !important;
    padding: 40px 40px 30px 40px !important;
}

.branding-container {
    text-align: center;
    margin-bottom: 25px;
}

.branding-icon {
    width: 48px;
    height: 48px;
    color: #0b5394;
    margin-bottom: 12px;
}

.branding-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    font-family: 'Inter', sans-serif;
}

.branding-subtitle {
    font-size: 13px;
    color: #64748b;
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.welcome-section {
    text-align: center;
    margin-bottom: 30px;
}

.welcome-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 6px;
}

.welcome-subtitle {
    font-size: 14px;
    color: #64748b;
}

/* Inputs */
div[data-testid="stTextInput"] label {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #475569 !important;
    padding-bottom: 8px !important;
}

div[data-testid="stTextInput"] input {
    height: 50px !important;
    border-radius: 8px !important;
    border: 1px solid #cbd5e1 !important;
    padding: 0 16px !important;
    font-size: 15px !important;
    color: #1e293b !important;
    background-color: #f8fafc !important;
    transition: all 0.2s ease;
}

div[data-testid="stTextInput"] input:focus {
    border-color: #0b5394 !important;
    background-color: #ffffff !important;
    box-shadow: 0 0 0 2px rgba(11, 83, 148, 0.15) !important;
}

.options-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -5px;
    margin-bottom: 20px;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #475569;
    cursor: pointer;
}

.remember-me input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #0b5394;
}

.forgot-password {
    font-size: 14px;
    color: #0b5394;
    text-decoration: none;
    font-weight: 500;
}

.forgot-password:hover {
    text-decoration: underline;
}

/* Button */
div[data-testid="stFormSubmitButton"] button {
    width: 100% !important;
    height: 50px !important;
    background-color: #0b5394 !important;
    color: white !important;
    border-radius: 8px !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    border: none !important;
    margin-top: 10px !important;
    transition: all 0.2s ease;
}

div[data-testid="stFormSubmitButton"] button:hover {
    background-color: #094074 !important;
    box-shadow: 0 4px 12px rgba(11, 83, 148, 0.2) !important;
}

div[data-testid="stFormSubmitButton"] p {
    color: white !important;
}

.secure-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
}

.secure-badge svg {
    width: 16px;
    height: 16px;
}

.contact-admin {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: #64748b;
}

/* Ensure no markdown margins break the layout */
div[data-testid="stMarkdownContainer"] > p {
    margin: 0 !important;
}

/* Remove vertical gap from stVerticalBlock */
div[data-testid="stVerticalBlock"] > div {
    gap: 0.8rem !important;
}
</style>
""", unsafe_allow_html=True)

    mode = st.radio("Select Action", ["Sign In", "Register"], horizontal=True, label_visibility="collapsed")
    
    if mode == "Sign In":
        with st.form("login_form"):
            st.markdown("""
<div class="branding-container">
    <svg class="branding-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
    <div class="branding-title">Healthcare AI</div>
    <div class="branding-subtitle">Clinical Intelligence Platform</div>
</div>

<div class="welcome-section">
    <div class="welcome-title">Welcome back</div>
    <div class="welcome-subtitle">Sign in to access your dashboard</div>
</div>
""", unsafe_allow_html=True)

            username = st.text_input("Email Address", placeholder="Enter your email")
            password = st.text_input("Password", type="password", placeholder="Enter your password")

            st.markdown("""
<div class="options-row">
    <label class="remember-me">
        <input type="checkbox" name="remember">
        Remember me
    </label>
    <a href="#" class="forgot-password">Forgot password?</a>
</div>
""", unsafe_allow_html=True)

            submit = st.form_submit_button("Sign In")
            
            st.markdown("""
<div class="secure-badge">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    Secure clinical access
</div>
""", unsafe_allow_html=True)

            if submit:
                login(username, password)
                
    else:
        with st.form("register_form"):
            st.markdown("""
<div class="branding-container">
    <svg class="branding-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
    <div class="branding-title">Healthcare AI</div>
    <div class="branding-subtitle">Patient Registration</div>
</div>
""", unsafe_allow_html=True)

            name = st.text_input("Full Name", placeholder="Enter your full name")
            email = st.text_input("Email Address", placeholder="Enter your email")
            password = st.text_input("Password", type="password", placeholder="Create a password")
            
            c1, c2 = st.columns(2)
            with c1:
                age = st.number_input("Age", min_value=1, max_value=120, value=30)
            with c2:
                gender = st.selectbox("Gender", ["Male", "Female", "Other"])
                
            phone = st.text_input("Phone Number", placeholder="Enter your phone number")

            submit_reg = st.form_submit_button("Create Account")

            if submit_reg:
                register(name, email, password, int(age), gender, phone)

    st.markdown("""
<div class="contact-admin">
    Need help? Contact your administrator
</div>
""", unsafe_allow_html=True)
    st.stop()

# ---------------------------------------------------------
# Main Dashboard (Authenticated)
# ---------------------------------------------------------
st.sidebar.button("Logout", on_click=logout)

def get_current_role(token):
    import base64
    try:
        payload = token.split('.')[1]
        padded = payload + '=' * (-len(payload) % 4)
        decoded = base64.b64decode(padded)
        return json.loads(decoded).get('role')
    except:
        return 'patient'

current_role = get_current_role(st.session_state["access_token"])

@st.cache_data(ttl=60)
def load_evaluation_metrics(token):
    try:
        response = requests.get(
            f"{API_URL}/evaluation-metrics",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        logging.error(f"Error fetching metrics: {e}")
        return None

metrics_data = load_evaluation_metrics(st.session_state["access_token"])

# ---------------------------------------------------------
# Dummy Dataset Features (for background padding)
# ---------------------------------------------------------
ALL_FEATURES = [
    'mean radius', 'mean texture', 'mean perimeter', 'mean area',
    'mean smoothness', 'mean compactness', 'mean concavity',
    'mean concave points', 'mean symmetry', 'mean fractal dimension',
    'radius error', 'texture error', 'perimeter error', 'area error',
    'smoothness error', 'compactness error', 'concavity error',
    'concave points error', 'symmetry error', 'fractal dimension error',
    'worst radius', 'worst texture', 'worst perimeter', 'worst area',
    'worst smoothness', 'worst compactness', 'worst concavity',
    'worst concave points', 'worst symmetry', 'worst fractal dimension',
    'radius_texture_interaction', 'perimeter_area_interaction'
]

def generate_patient_features_dict(user_inputs: dict) -> dict:
    """Combines user inputs with default dummy values for remaining features."""
    row = {}
    for feat in ALL_FEATURES:
        row[feat] = user_inputs.get(feat, 1.0)
    return row

# ---------------------------------------------------------
# Header & Disclaimers
# ---------------------------------------------------------
st.title("🏥 AI-Powered Clinical Decision Support Prototype")

st.warning(
    "**EDUCATIONAL PROTOTYPE WARNING:** This system is an AI prototype intended "
    "for educational and research demonstration purposes only. It does not provide "
    "definitive medical diagnoses and must NEVER be used to replace a healthcare professional. "
    "No patient data is permanently logged by this application."
)

if current_role == "patient":
    # ---------------------------------------------------------
    # Patient Dashboard
    # ---------------------------------------------------------
    ptab1, ptab2, ptab3, ptab4 = st.tabs(["My Profile", "My Predictions", "My Medical Records", "Run Prediction"])
    
    with ptab1:
        st.header("My Profile")
        try:
            prof_resp = requests.get(f"{API_URL}/api/patient/profile", headers={"Authorization": f"Bearer {st.session_state['access_token']}"})
            if prof_resp.status_code == 200:
                profile = prof_resp.json()
                st.write(f"**Name:** {profile['name']}")
                st.write(f"**Email:** {profile['email']}")
                st.write(f"**Age:** {profile['age']}")
                st.write(f"**Gender:** {profile['gender']}")
                st.write(f"**Phone:** {profile['phone']}")
            else:
                st.error("Failed to load profile")
        except Exception as e:
            st.error(f"Error loading profile: {e}")

    with ptab2:
        st.header("My Prediction History")
        try:
            pred_resp = requests.get(f"{API_URL}/api/predictions", headers={"Authorization": f"Bearer {st.session_state['access_token']}"})
            if pred_resp.status_code == 200:
                preds = pred_resp.json()
                if preds:
                    for p in preds:
                        with st.expander(f"{p['created_at']} - {p['disease']}"):
                            st.write(f"**Prediction:** {p['prediction']}")
                            st.write(f"**Confidence:** {p['confidence']*100:.1f}%")
                else:
                    st.info("No predictions found.")
        except Exception as e:
            st.error(f"Error loading predictions: {e}")

    with ptab3:
        st.header("My Medical Records")
        try:
            med_resp = requests.get(f"{API_URL}/api/medical_records", headers={"Authorization": f"Bearer {st.session_state['access_token']}"})
            if med_resp.status_code == 200:
                records = med_resp.json()
                if records:
                    for r in records:
                        with st.expander(f"{r['created_at']} - {r['record_type']}"):
                            st.write(r['description'])
                else:
                    st.info("No medical records found.")
        except Exception as e:
            st.error(f"Error loading medical records: {e}")

    with ptab4:
        st.header("Run Health Prediction")
        st.write("Enter your basic biometrics for an AI risk assessment:")
        p_inputs = {}
        p_inputs['worst concave points'] = st.number_input("Biometric A (e.g. Concave Points)", value=0.1, min_value=0.0, max_value=1.0, step=0.01)
        p_inputs['worst texture'] = st.number_input("Biometric B (e.g. Texture)", value=20.0, min_value=0.0, max_value=100.0, step=0.1)
        p_inputs['radius error'] = st.number_input("Biometric C (e.g. Radius Error)", value=0.5, min_value=0.0, max_value=10.0, step=0.01)
        p_inputs['worst radius'] = st.number_input("Biometric D (e.g. Worst Radius)", value=15.0, min_value=0.0, max_value=50.0, step=0.1)
        p_inputs['worst area'] = st.number_input("Biometric E (e.g. Worst Area)", value=800.0, min_value=0.0, max_value=5000.0, step=10.0)
        
        if st.button("Run Prediction"):
            with st.spinner("Analyzing..."):
                patient_features = generate_patient_features_dict(p_inputs)
                try:
                    response = requests.post(
                        f"{API_URL}/predict",
                        headers={"Authorization": f"Bearer {st.session_state['access_token']}"},
                        json={"features": patient_features}
                    )
                    if response.status_code == 200:
                        res = response.json()
                        st.success(f"**Prediction:** {res['risk_category']} (Confidence: {res['confidence_score']*100:.1f}%)")
                        st.info("This prediction has been saved to your history.")
                    else:
                        st.error("Failed to run prediction.")
                except Exception as e:
                    st.error(f"Error: {e}")

else:
    # ---------------------------------------------------------
    # Clinician Dashboard (Existing)
    # ---------------------------------------------------------
    tab1, tab2 = st.tabs(["Patient Analysis", "Model Evaluation & Metrics"])

with tab1:
    col1, col2 = st.columns([1, 2])

    with col1:
        st.header("Patient Input")
        st.markdown("Enter the top 5 clinical metrics:")
        
        inputs = {}
        # Min/max bounds added for input validation
        inputs['worst concave points'] = st.number_input("Worst Concave Points", value=0.1, min_value=0.0, max_value=1.0, step=0.01)
        inputs['worst texture'] = st.number_input("Worst Texture", value=20.0, min_value=0.0, max_value=100.0, step=0.1)
        inputs['radius error'] = st.number_input("Radius Error", value=0.5, min_value=0.0, max_value=10.0, step=0.01)
        inputs['worst radius'] = st.number_input("Worst Radius", value=15.0, min_value=0.0, max_value=50.0, step=0.1)
        inputs['worst area'] = st.number_input("Worst Area", value=800.0, min_value=0.0, max_value=5000.0, step=10.0)
        
        st.markdown("---")
        st.header("Medical Report Upload")
        
        # Secure File Uploader
        uploaded_file = st.file_uploader("Upload Medical Report (TXT format only, Max 2MB)", type=["txt"])
        
        medical_note = "Patient presents with a palpable lump. Denies pain. Ultrasound showed an abnormal lesion."
        if uploaded_file is not None:
            # Size validation
            if uploaded_file.size > 2 * 1024 * 1024:
                st.error("File is too large. Please upload a file smaller than 2MB.")
                st.stop()
            try:
                medical_note = uploaded_file.read().decode("utf-8")
                st.success("File successfully parsed.")
            except Exception as e:
                st.error("Error reading file. Ensure it is valid text.")
                st.stop()
        else:
            medical_note = st.text_area(
                "Or paste Doctor's Note here (limited to 5000 chars):",
                value=medical_note,
                height=150,
                max_chars=5000
            )
        
        st.markdown("---")
        st.header("Medical Image Scan (Optional)")
        uploaded_image = st.file_uploader("Upload X-Ray / MRI Scan (JPEG/PNG, Max 5MB)", type=["png", "jpg", "jpeg"])
        
        image_bytes = None
        if uploaded_image is not None:
            if uploaded_image.size > 5 * 1024 * 1024:
                st.error("Image is too large. Please upload an image smaller than 5MB.")
                st.stop()
            image_bytes = uploaded_image.read()
            st.image(image_bytes, caption="Uploaded Scan", use_container_width=True)
            
        analyze_btn = st.button("Run Clinical Decision Support Engine", type="primary", use_container_width=True)

    with col2:
        st.header("Analysis Results")
        
        if analyze_btn:
            with st.spinner("Analyzing patient data & medical notes via API..."):
                patient_features = generate_patient_features_dict(inputs)
                token = st.session_state["access_token"]
                
                try:
                    if image_bytes:
                        # Use /analyze-scan (multipart form data)
                        response = requests.post(
                            f"{API_URL}/analyze-scan",
                            headers={"Authorization": f"Bearer {token}"},
                            data={
                                "patient_features_json": json.dumps({"features": patient_features}),
                                "medical_note": medical_note
                            },
                            files={"file": ("scan.jpg", image_bytes, "image/jpeg")}
                        )
                    else:
                        # Use /analyze-report (JSON payload)
                        payload = {
                            "patient_data": {"features": patient_features},
                            "medical_note": medical_note
                        }
                        response = requests.post(
                            f"{API_URL}/analyze-report",
                            headers={"Authorization": f"Bearer {token}"},
                            json=payload
                        )
                    
                    if response.status_code != 200:
                        st.error(f"API Error ({response.status_code}): {response.text}")
                        st.stop()
                        
                    report = response.json()
                    
                except Exception as e:
                    st.error(f"Error during analysis: {e}")
                    st.stop()
                    
                summary = report["clinical_decision_support_summary"]
                nlp = report["nlp_extracted_insights"]
                
                # Metrics Row
                m1, m2, m3 = st.columns(3)
                m1.metric("Predicted Condition", summary["predicted_condition"])
                m2.metric("AI Confidence", summary["confidence_score"])
                
                risk = summary["overall_risk_level"]
                risk_color = "red" if risk == "High Risk" else "orange" if risk == "Medium Risk" else "green"
                m3.markdown(f"### Risk Level: <span style='color:{risk_color}'>{risk}</span>", unsafe_allow_html=True)
                
                if summary.get("low_confidence_warning", False):
                    st.warning("⚠️ **Low AI Confidence:** The model's probability is near the decision boundary. Please rely heavily on clinical judgment and consider further testing.")
                
                # Image Analysis Result
                image_results = report.get("image_analysis")
                if image_results:
                    st.markdown("---")
                    st.subheader("Deep Learning Image Analysis")
                    img_pred = image_results.get("image_prediction", "Unknown")
                    img_conf = image_results.get("image_confidence", 0.0)
                    
                    img_color = "red" if "Abnormal" in img_pred else "green"
                    st.markdown(f"**CNN Prediction:** <span style='color:{img_color}'>{img_pred}</span> (Confidence: {img_conf*100:.2f}%)", unsafe_allow_html=True)
                    
                st.markdown("---")
                
                d1, d2 = st.columns(2)
                with d1:
                    st.subheader("NLP Insights")
                    st.success(f"**Positive Findings:** {', '.join(nlp['positive_findings']) if nlp['positive_findings'] else 'None'}")
                    st.error(f"**Negated Findings:** {', '.join(nlp['negated_findings']) if nlp['negated_findings'] else 'None'}")
                    st.info(f"**Cross-Analysis Note:** {report['cross_analysis']}")
                    
                with d2:
                    st.subheader("Top Influential ML Factors")
                    factors = report["ml_influential_factors"]
                    if factors:
                        factor_df = pd.DataFrame(list(factors.items()), columns=["Feature", "Influence Score"])
                        fig = px.bar(factor_df, x="Influence Score", y="Feature", orientation='h', title="Feature Importance")
                        fig.update_layout(yaxis={'categoryorder':'total ascending'})
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.info("No explainability metrics available.")
                    
                st.markdown("---")
                
                st.subheader("Next-Step Considerations")
                for consideration in report["next_step_considerations"]:
                    st.markdown(f"- {consideration}")
                    
                st.markdown("---")
                
                # JSON Export
                report_json = json.dumps(report, indent=4)
                st.download_button(
                    label="📥 Download JSON Report",
                    data=report_json,
                    file_name="cds_report.json",
                    mime="application/json"
                )

with tab2:
    st.header("Model Evaluation & Validation Metrics")
    
    if metrics_data:
        best_name = metrics_data["best_model"]
        best_metrics = metrics_data["metrics"][best_name]
        
        st.subheader(f"Best Performing Model: {best_name}")
        st.markdown(
            "The model was rigorously validated using both a standard Train-Validation split and "
            "**K-Fold Cross-Validation** to ensure generalizability and prevent overfitting."
        )
        
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Test Accuracy", f"{best_metrics['accuracy']:.4f}")
        k2.metric("Test F1-Score", f"{best_metrics['f1']:.4f}")
        k3.metric("ROC-AUC Score", f"{best_metrics['roc_auc']:.4f}")
        k4.metric("Cross-Val F1 (5-Fold)", f"{best_metrics['cv_f1_mean']:.4f} ± {best_metrics['cv_f1_std']:.4f}")
        
        st.markdown("---")
        c1, c2 = st.columns(2)
        
        with c1:
            st.write("**Confusion Matrix**")
            cm = best_metrics['confusion_matrix']
            # Simple heatmap using Plotly
            fig = px.imshow(
                cm, 
                text_auto=True, 
                labels=dict(x="Predicted Class", y="Actual Class", color="Count"),
                x=['Benign (0)', 'Malignant (1)'],
                y=['Benign (0)', 'Malignant (1)'],
                color_continuous_scale='Blues'
            )
            st.plotly_chart(fig, use_container_width=True)
            
        with c2:
            st.write("**Performance Comparison across all Models**")
            # Build DF from metrics
            comp_data = []
            for m_name, m_dict in metrics_data["metrics"].items():
                comp_data.append({
                    "Model": m_name,
                    "Accuracy": m_dict["accuracy"],
                    "F1 Score": m_dict["f1"],
                    "ROC-AUC": m_dict["roc_auc"]
                })
            comp_df = pd.DataFrame(comp_data)
            
            fig2 = px.bar(
                comp_df, x="Model", y=["Accuracy", "F1 Score", "ROC-AUC"], 
                barmode='group',
                title="Evaluation Metrics per Algorithm"
            )
            fig2.update_layout(yaxis_range=[0.8, 1.0])
            st.plotly_chart(fig2, use_container_width=True)

    else:
        st.info("Evaluation metrics file not found. Ensure the API is serving them.")

st.markdown("<br><br><br><hr>", unsafe_allow_html=True)
st.caption("AI-Powered Intelligent Healthcare Diagnosis and Clinical Decision Support System - Production Version 1.2")
