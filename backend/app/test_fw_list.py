import os
import requests

api_key = "fw_4EKBUhZVkzNjFg1njYCqCk"
url = "https://api.fireworks.ai/inference/v1/models"

headers = {
    "Authorization": f"Bearer {api_key}"
}

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        models = response.json().get("data", [])
        for model in models:
            if "llama" in model.get("id").lower() or "qwen" in model.get("id").lower() or "mixtral" in model.get("id").lower():
                print(model.get("id"))
    else:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
