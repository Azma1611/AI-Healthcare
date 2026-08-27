import httpx
base_url = 'http://127.0.0.1:8000'

try:
    r = httpx.post(f'{base_url}/auth/token', data={'username': 'dr_smith', 'password': 'secure_password_123'})
    token = r.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    r = httpx.post(f'{base_url}/admin/ingest-dataset', headers=headers)
    print('dr_smith -> admin/ingest-dataset:', r.status_code)
except Exception as e:
    print('Error:', e)

try:
    r = httpx.post(f'{base_url}/auth/token', data={'username': 'admin', 'password': 'admin_password_123'})
    admin_token = r.json().get('access_token')
    headers = {'Authorization': f'Bearer {admin_token}'}
    r = httpx.post(f'{base_url}/admin/ingest-dataset', headers=headers)
    print('admin -> admin/ingest-dataset:', r.status_code)
except Exception as e:
    print('Error:', e)
