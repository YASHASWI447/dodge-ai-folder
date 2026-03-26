import json, urllib.request, sys
url = 'http://127.0.0.1:8000/query'
data = json.dumps({'question':'trace billing flow'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print(resp.read().decode())
except Exception as e:
    print('ERROR', e, file=sys.stderr)
