+++
title = "Developer Guide"
date = 2021-05-01T08:00:00+00:00
updated = 2021-05-01T08:00:00+00:00
draft = false
weight = 2
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

## Origin

This service is designed to provide a stable way for local developers to use OpenAI related APIs, facilitating AI practitioners and researchers in their work and enabling them to use AI to enhance their daily work and study efficiency.

## Key Features

With the rapid development and popularization of AI technology, the demand for OpenAI services is increasing, and instability in official services is common. Therefore, this service specifically provides developers with the ability to transparently retry without perception when OpenAI side load is too high, covering the vast majority of official service exceptions, ensuring the maximum success of interface requests, and is one of the optimization services provided by the platform.

1. Supports querying balance through OpenAI compatible interface
2. Prompt_token and Completion_tokens are billed separately, consistent with OpenAI official model pricing
3. Comprehensive cost analysis tools, with all consumption details from overall overview to itemized details
4. Supports sub-account capabilities for self-determined pricing rates/rates/limit/recharge etc.
5. Developer API calls and [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference) are consistent
6. [Balance Inquiry](https://usage.proxyxai.com)
7. [Sub Account](https://sub.proxyxai.com)
8. [API](https://api.proxyxai.com)

## Common Open Source SDK Usage

1. curl request

```bash
curl https://api.proxyxai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "Say this is a test!"}],
     "temperature": 0.7
   }'
```

2. OpenAI official Python library, OpenAI official Python package, encapsulates common model access methods, project source code: [OpenAI Python](https://github.com/openai/openai-python)

```
pip install --upgrade openai
```

Python call
```python
from openai import OpenAI

client = OpenAI(
    # Replace this with the key authorized by Yugong Proxy
    api_key="sk-Xvsxxx",
    # Replace the official API endpoint address here with the Yugong Proxy API endpoint address
    base_url="https://api.proxyxai.com/v1"
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="gpt-3.5-turbo",
)

print(chat_completion)
```

3. OpenAI official Node library, OpenAI Node package, provides convenient access to model interfaces, project source code: [OpenAI Node](https://github.com/openai/openai-node)

```
npm install openai
```

Node call
```Nodejs
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "sk-Xvsxxx",
  basePath: "https://api.proxyxai.com/v1",
});
const openai = new OpenAIApi(configuration);

async function chat(){
  return await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: "hi"}],
  });
}
const completion = chat()
console.log(completion);
```

## Common Open Source Project Usage

1. AutoGPT project [https://github.com/Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)

Please change the following parameters in this file `https://github.com/Significant-Gravitas/AutoGPT/blob/master/autogpts/autogpt/.env.template`, currently, it is recommended to use the gpt-4-1106-preview model, compared to gpt-4, it can handle up to 128k of context data, and it is faster and cheaper.

```
OPENAI_API_KEY=sk-Xvsxxx
OPENAI_API_BASE_URL=https://api.proxyxai.com/v1

SMART_LLM=gpt-4-1106-preview
```

2. XAgent project [https://github.com/OpenBMB/XAgent](https://github.com/OpenBMB/XAgent)

Please change the following parameters in this file `https://github.com/OpenBMB/XAgent/blob/main/assets/config.yml`

```
api_key=sk-Xvsxxx
api_base=https://api.proxyxai.com
```

3. MetaGPT project [https://github.com/geekan/MetaGPT](https://github.com/geekan/MetaGPT)

Please change the following parameters in this file `https://github.com/geekan/MetaGPT/blob/main/config/config.yaml`

```
OPENAI_API_BASE=https://api.proxyxai.com/v1
OPENAI_API_KEY=sk-Xvsxxx
```
