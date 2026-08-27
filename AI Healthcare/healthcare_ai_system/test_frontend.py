import httpx
try:
    r = httpx.get('http://127.0.0.1:8501')
    print('Streamlit frontend status:', r.status_code)
except Exception as e:
    print('Error:', e)
