import httpx
base_url = 'http://127.0.0.1:8000'

try:
    r = httpx.post(f'{base_url}/auth/token', data={'username': 'dr_smith', 'password': 'secure_password_123'})
    token = r.json().get('access_token')

    headers = {'Authorization': f'Bearer {token}'}
    payload = {
        'features': {
            'age': 45, 'sex': 1, 'cp': 3, 'trestbps': 120, 'chol': 230,
            'fbs': 0, 'restecg': 1, 'thalach': 150, 'exang': 0,
            'oldpeak': 1.5, 'slope': 2, 'ca': 0, 'thal': 2,
            'mean_radius': 14.0, 'mean_texture': 19.0, 'mean_perimeter': 90.0,
            'mean_area': 600.0, 'mean_smoothness': 0.1
        }
    }
    r = httpx.post(f'{base_url}/predict', json=payload, headers=headers)
    print('/predict:', r.status_code, r.json())
except Exception as e:
    print('Error:', e)

try:
    r = httpx.get(f'{base_url}/metrics')
    print('/metrics lines:', len(r.text.splitlines()))
except Exception as e:
    print('Error:', e)
