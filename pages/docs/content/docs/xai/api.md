+++
title = "XAI Reference"
date = 2024-11-16T08:00:00+00:00
updated = 2024-11-16T08:00:00+00:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

# Overview

This page provides an overview of the XAI API, including authentication and example requests.

## Introduction

Once you have generated an API key following the instructions in our quickstart page, you are now ready to start making requests.

Interact with xAI's API using HTTP requests from any language or via Python SDKs as the API is designed for compatibility with both OpenAI's and Anthropic's SDK frameworks for a seamless transition.

## Authentication

To interact with xAI's API, you'll need to authenticate your requests. There are steps to follow:

First, you will need to visit the xAI Console to create an API key. Later, you will need to include the API key in the Authorization header of your requests. For more information, you can refer to our Quickstart guide.

```bash
Authorization: Bearer YOUR_XAI_API_KEY
```

## Making requests

```bash
curl https://api.x.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -d '{
      "messages": [
        {
          "role": "system",
          "content": "You are Grok, a chatbot inspired by the Hitchhikers Guide to the Galaxy."
        },
        {
          "role": "user",
          "content": "What is the answer to life and universe?"
        }
      ],
      "model": "grok-beta",
      "stream": false,
      "temperature": 0
    }'
```

This request queries the grok-beta model and returns a response, which will resemble the following:

```json
{
  "id": "304e12ef-81f4-4e93-a41c-f5f57f6a2b56",
  "object": "chat.completion",
  "created": 1728511727,
  "model": "grok-beta",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The answer to the ultimate question of life, the universe, and everything is **42**, according to Douglas Adams science fiction series \"The Hitchhiker's Guide to the Galaxy.\" This number is often humorously referenced in discussions about the meaning of life. However, in the context of the story, the actual question to which 42 is the answer remains unknown, symbolizing the ongoing search for understanding the purpose or meaning of existence."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 91,
    "total_tokens": 115
  },
  "system_fingerprint": "fp_3813298403"
}
```

In the response above, there are a few fields that are worth noting. As you can see from the finish_reason , the model has finished generating the response without running into any limits. The usage field provides information about the number of tokens used in the request and response, which can be useful for monitoring your usage after each request. Finally, the system_fingerprint represent the unique configuration of the model and the backend. This fingerprint changes when any modifications are made in one of those two.

You can view the full response schema for chat completions endpoint here.

## Streaming

The xAI APIs support streaming responses. This means that the response is sent to the client in chunks, rather than all at once. This is useful for applications that need to process the response as it is received, such as chatbots or text editors.

To achieve this, Server-Sent Events (SSE) standards are used. Streaming is available for chat completion endpoint here and message endpoint here (following Anthropic standards in this case). For example a streaming request looks like:

```bash
curl https://api.x.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You are Grok, a chatbot inspired by the Hitchhikers Guide to the Galaxy."
      },
      {
        "role": "user",
        "content": "What is the answer to life and universe?"
      }
    ],
    "model": "grok-beta",
    "stream": true,
    "temperature": 0
  }'
```

A list of event would then be returned with data looking like:

```json
{
  "id": "304e12ef-81f4-4e93-a41c-f5f57f6a2b56",
  "object": "chat.completion",
  "created": 1728511727,
  "model": "grok-beta",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The "
      },
      "finish_reason": ""
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 1,
    "total_tokens": 25
  },
  "system_fingerprint": "fp_3813298403"
}
```

Following the last message, the backend will send a [DONE] message to close the stream.

Our API's streaming capabilities are natively compatible with OpenAI and Anthropic SDKs.

# Integrations

This page contains information about how to integrate the xAI APIs into your application using REST, gRPC or our Python SDK.

Our API is also fully compatible with OpenAI and Anthropic SDKs for easy migration.

##  OpenAI SDK

The xAI API offers compatibility with the OpenAI SDKs to support developers and their apps with minimal changes. Once you update the base URL, you can start using the SDKs to make calls to your favorite Grok models with your xAI API key.

<b>JavaScript</b>

You can import the OpenAI client from openai into your Javascript application and change the base URL and API key.

```javascript
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: "<api key>",
  baseURL: "https://api.x.ai/v1",
});

const completion = await openai.chat.completions.create({
  model: "grok-beta",
  messages: [
    { role: "system", content: "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy." },
    {
      role: "user",
      content: "What is the meaning of life, the universe, and everything?",
    },
  ],
});

console.log(completion.choices[0].message);
```

<b>Python</b>

You can use the openai library to interact with the Grok API in your python program.

```python
import os
from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(
    api_key=XAI_API_KEY,
    base_url="https://api.x.ai/v1",
)

completion = client.chat.completions.create(
    model="grok-beta",
    messages=[
        {"role": "system", "content": "You are Grok, a chatbot inspired by the Hitchhikers Guide to the Galaxy."},
        {"role": "user", "content": "What is the meaning of life, the universe, and everything?"},
    ],
)

print(completion.choices[0].message)
```

## Anthropic SDK

xAI SDKs are also fully compatible with the Anthropic SDKs. This allows developers to easily integrate xAI's models into their existing applications. You just need to update the base URL, API key and model name. Below, you can find examples of how to use your xAI API Keys with the Anthropic SDKs.

<b>JavaScript</b>

You can import the Anthropic SDK from @anthropic-ai/sdk and use it to create a client instance with your xAI API Key.

```javascript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: "<api key>",
  baseURL: "https://api.x.ai/",
});

const msg = await anthropic.messages.create({
  model: "grok-beta",
  max_tokens: 128,
  system:
    "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
  messages: [
    {
      role: "user",
      content: "What is the meaning of life, the universe, and everything?",
    },
  ],
});

console.log(msg);
```

<b>Python</b>

Likewise, in Python, you can use the Anthropic class to create a client and send a message to the Grok model:

```python
import os
from anthropic import Anthropic

XAI_API_KEY = os.getenv("XAI_API_KEY")
client = Anthropic(
    api_key=XAI_API_KEY,
    base_url="https://api.x.ai",
)
message = client.messages.create(
    model="grok-beta",
    max_tokens=128,
    system="You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
    messages=[
        {
            "role": "user",
            "content": "What is the meaning of life, the universe, and everything?",
        },
    ],
)
print(message.content)
```
