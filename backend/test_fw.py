import os
from openai import OpenAI

client = OpenAI(
    api_key="fw_4EKBUhZVkzNjFg1njYCqCk",
    base_url="https://api.fireworks.ai/inference/v1",
)

try:
    response = client.chat.completions.create(
        model="accounts/fireworks/models/qwen2p5-72b-instruct",
        messages=[{"role": "user", "content": "Hello!"}],
    )
    print("Qwen Response:", response.choices[0].message.content)
except Exception as e:
    print("Qwen Error:", e)

try:
    response = client.chat.completions.create(
        model="accounts/fireworks/models/llama-v3p1-70b-instruct",
        messages=[{"role": "user", "content": "Hello!"}],
    )
    print("Llama Response:", response.choices[0].message.content)
except Exception as e:
    print("Llama Error:", e)
