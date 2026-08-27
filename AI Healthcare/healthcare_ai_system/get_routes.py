import httpx
try:
    r = httpx.get('http://127.0.0.1:8000/openapi.json')
    print([path for path in r.json().get('paths', {}).keys()])
except Exception as e:
    print('Error:', e)
