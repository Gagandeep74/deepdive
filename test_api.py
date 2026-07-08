import urllib.request, json, urllib.error
req = urllib.request.Request(
    'https://api.fireworks.ai/inference/v1/chat/completions',
    data=json.dumps({'model': 'accounts/fireworks/models/firefunction-v1', 'messages': [{'role': 'user', 'content': 'Say hello'}]}).encode('utf-8'),
    headers={'Authorization': 'Bearer fw_4EKBUhZVkzNjFg1njYCqCk', 'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.code, e.read().decode('utf-8'))
