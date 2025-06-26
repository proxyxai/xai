+++
title = "Quick Start Guide"
date = 2025-03-01T08:00:00+00:00
updated = 2025-03-01T08:00:00+00:00
draft = false
weight = 2
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

# Quick Start Guide

Get started with XAI in minutes. This guide covers account setup, API integration, and best practices.

## Prerequisites

- An XAI account with API access
- Basic knowledge of REST APIs
- A programming environment (Python, Node.js, etc.)

## Step 1: Get Your API Key

1. Sign up at [m.proxyxai.com](https://m.proxyxai.com)
2. Navigate to your dashboard
3. Copy your API key (starts with `sk-Xvs`)

<div class="infobox">
Keep your API key secure. Never commit it to version control or expose it in client-side code.
</div>

## Step 2: Test Your Connection

### Using cURL

```bash
# Set your API key
export XAI_API_KEY="sk-Xvs..."

# Test the connection
curl https://api.proxyxai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }'
```

### Using Python

```python
import os
import requests

# Set your API key
api_key = os.environ.get("XAI_API_KEY")

# Make a test request
response = requests.post(
    "https://api.proxyxai.com/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": "Hello!"}],
        "max_tokens": 50
    }
)

print(response.json())
```

### Using Node.js

```javascript
const axios = require('axios');

// Set your API key
const apiKey = process.env.XAI_API_KEY;

// Make a test request
async function testConnection() {
    try {
        const response = await axios.post(
            'https://api.proxyxai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello!' }],
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testConnection();
```

## Step 3: SDK Integration

### OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-Xvs...",
    base_url="https://api.proxyxai.com/v1"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Write a haiku about programming."}
    ]
)

print(response.choices[0].message.content)
```

### Anthropic SDK

```python
from anthropic import Anthropic

client = Anthropic(
    api_key="sk-Xvs...",
    base_url="https://api.proxyxai.com"
)

response = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=100,
    messages=[
        {"role": "user", "content": "What is the meaning of life?"}
    ]
)

print(response.content[0].text)
```

### Streaming Responses

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-Xvs...",
    base_url="https://api.proxyxai.com/v1"
)

stream = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Count to 10"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

## Step 4: Create Subaccounts

For team collaboration or client management:

```bash
# Create a subaccount
curl -X POST https://api.proxyxai.com/x-users \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "dev-team",
    "Email": "dev@company.com",
    "CreditGranted": 100,
    "RPM": 60,
    "AllowModels": "gpt-3.5-turbo gpt-4"
  }'
```

Response:
```json
{
  "Action": "add",
  "User": {
    "ID": 42,
    "SecretKey": "sk-Xvs...",  // Subaccount's API key
    "Updates": {
      "Name": "dev-team",
      "Balance": 100
    }
  }
}
```

## Step 5: Monitor Usage

### Check Balance

```bash
curl https://api.proxyxai.com/dashboard/x-user-status \
  -H "Authorization: Bearer $XAI_API_KEY"
```

### Get Usage Report

```bash
# Last 30 days usage
curl "https://api.proxyxai.com/x-bill?days=30" \
  -H "Authorization: Bearer $XAI_API_KEY"
```

### View Logs

```bash
curl "https://api.proxyxai.com/dashboard/x-user-logs?size=10" \
  -H "Authorization: Bearer $XAI_API_KEY"
```

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```python
import time
from openai import OpenAI

client = OpenAI(
    api_key="sk-Xvs...",
    base_url="https://api.proxyxai.com/v1"
)

def make_request_with_retry(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages
            )
            return response
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = (2 ** attempt) + 1
            print(f"Error: {e}. Retrying in {wait_time} seconds...")
            time.sleep(wait_time)
```

### 2. Rate Limiting

Respect rate limits to avoid errors:

```python
import time
from collections import deque

class RateLimiter:
    def __init__(self, rpm=60):
        self.rpm = rpm
        self.requests = deque()

    def wait_if_needed(self):
        now = time.time()
        # Remove requests older than 1 minute
        while self.requests and self.requests[0] < now - 60:
            self.requests.popleft()

        # If at limit, wait
        if len(self.requests) >= self.rpm:
            sleep_time = 60 - (now - self.requests[0])
            if sleep_time > 0:
                time.sleep(sleep_time)

        self.requests.append(now)

# Usage
limiter = RateLimiter(rpm=60)

def make_request(messages):
    limiter.wait_if_needed()
    return client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
```

### 3. Cost Optimization

Use appropriate models for different tasks:

```python
def select_model(task_complexity):
    """Select model based on task complexity"""
    if task_complexity == "simple":
        return "gpt-3.5-turbo"  # Fast and cost-effective
    elif task_complexity == "moderate":
        return "gpt-4"  # Better reasoning
    else:
        return "gpt-4-turbo"  # Best performance
```

### 4. Security

Never expose API keys in client-side code:

```javascript
// BAD - Never do this
const apiKey = "sk-Xvs...";  // Exposed in browser

// GOOD - Use server-side proxy
async function callAPI(messages) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    });
    return response.json();
}
```

## Common Use Cases

### 1. Chatbot

```python
def chatbot():
    messages = []

    while True:
        user_input = input("You: ")
        if user_input.lower() == 'quit':
            break

        messages.append({"role": "user", "content": user_input})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )

        assistant_message = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_message})

        print(f"Assistant: {assistant_message}")
```

### 2. Document Analysis

```python
def analyze_document(document_url):
    response = client.chat.completions.create(
        model="claude-3-sonnet-20240229",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "url",
                            "url": document_url
                        }
                    },
                    {
                        "type": "text",
                        "text": "Summarize this document in 3 bullet points"
                    }
                ]
            }
        ]
    )
    return response.choices[0].message.content
```

### 3. Image Generation

```python
def generate_image(prompt):
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1
    )
    return response.data[0].url
```

## Troubleshooting

### Authentication Issues

```
Error: Unauthorized
```
- Verify your API key is correct
- Ensure the key starts with `sk-Xvs`
- Check if the account is active

### Rate Limit Errors

```
Error: Too many requests
```
- Implement exponential backoff
- Check your rate limits in dashboard
- Consider upgrading your plan

### Model Not Found

```
Error: Model 'xyz' not found
```
- Check available models: `GET /v1/models`
- Verify model name spelling
- Ensure you have access to the model

## Next Steps

1. **Explore Advanced Features:**
   - [Subaccount Management](/docs/api/api/#1-user-management-apis)
   - [WebSocket API](/docs/api/websocket/)
   - [Document Parsing](/blog/document/)

2. **Optimize Your Usage:**
   - Set up rate limits per model
   - Configure IP whitelisting
   - Monitor usage patterns

3. **Join the Community:**
   - Follow [@proxyxai](https://x.com/proxyxai)
   - Join our [Telegram group](https://t.me/proxyxai)
   - Contact support@proxyxai.com

<div class="infobox">
Ready to scale? Check our [pricing plans](https://m.proxyxai.com) for higher limits and additional features.
</div>
