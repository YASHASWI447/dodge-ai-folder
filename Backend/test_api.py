import urllib.request, urllib.error, json

BASE = 'http://127.0.0.1:8000'

try:
    with urllib.request.urlopen(BASE + '/') as r:
        print('GET / ->', r.read().decode()[:1000])
except Exception as e:
    print('GET / error:', e)

# POST /query
req = urllib.request.Request(BASE + '/query', data=json.dumps({'question':'trace billing flow'}).encode('utf-8'), headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req) as r:
        print('POST /query ->', r.read().decode()[:2000])
except urllib.error.HTTPError as he:
    print('POST /query HTTPError:', he.code, he.read().decode())
except Exception as e:
    print('POST /query error:', e)
