import httpx
import json

base_url = 'http://127.0.0.1:8000'

print('--- /health ---')
try:
    r = httpx.get(f'{base_url}/health')
    print(r.status_code, r.json())
except Exception as e:
    print('Error:', e)

print('--- Authentication (Valid) ---')
token = None
try:
    r = httpx.post(f'{base_url}/auth/token', data={'username': 'dr_smith', 'password': 'secure_password_123'})
    print(r.status_code)
    if r.status_code == 200:
        token = r.json().get('access_token')
except Exception as e:
    print('Error:', e)

print('--- Authentication (Invalid) ---')
try:
    r = httpx.post(f'{base_url}/auth/token', data={'username': 'dr_smith', 'password': 'wrong'})
    print(r.status_code, r.text)
except Exception as e:
    print('Error:', e)

print('--- /metrics ---')
try:
    r = httpx.get(f'{base_url}/metrics')
    print(r.status_code, 'Metrics found' if 'healthcare_api' in r.text else 'No metrics')
except Exception as e:
    print('Error:', e)

print('--- /predict (Valid) ---')
try:
    if token:
        headers = {'Authorization': f'Bearer {token}'}
        payload = {
            'age': 45, 'sex': 1, 'cp': 3, 'trestbps': 120, 'chol': 230,
            'fbs': 0, 'restecg': 1, 'thalach': 150, 'exang': 0,
            'oldpeak': 1.5, 'slope': 2, 'ca': 0, 'thal': 2,
            'mean_radius': 14.0, 'mean_texture': 19.0, 'mean_perimeter': 90.0,
            'mean_area': 600.0, 'mean_smoothness': 0.1
        }
        r = httpx.post(f'{base_url}/predict', json=payload, headers=headers)
        print(r.status_code, r.json())
except Exception as e:
    print('Error:', e)

print('--- /predict (Invalid Input - Missing Field) ---')
try:
    if token:
        headers = {'Authorization': f'Bearer {token}'}
        payload = {'age': 45} # missing everything else
        r = httpx.post(f'{base_url}/predict', json=payload, headers=headers)
        print(r.status_code)
except Exception as e:
    print('Error:', e)

print('--- /evaluation-metrics ---')
try:
    if token:
        headers = {'Authorization': f'Bearer {token}'}
        r = httpx.get(f'{base_url}/evaluation-metrics', headers=headers)
        print(r.status_code, r.json())
except Exception as e:
    print('Error:', e)

