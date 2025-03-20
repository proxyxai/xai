+++
title = "All Aboard"
date = 2025-03-01T08:00:00+00:00
updated = 2025-03-01T08:00:00+00:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

<img style="width:100%; max-width:640px" src="tour.png"/>
<br/>
<br/>
<br/>

### XAI

> **𝑋𝐴𝐼 𝐴𝑃𝐼 𝑃𝑟𝑜𝑥𝑦<br>Providing a robust foundational support for pioneers in the AI industry**

- [User Help](https://proxyxai.com/docs/getting-started/config/)
- [API Documentation](https://proxyxai.com/docs/api/api/)

### Implementation Principle

![proxyxai](https://static.proxyxai.com/proxyxai-td-en.svg ':size=200%')

<div class="infobox">
The Key Pool incorporates several OpenAI API Keys created by different high-level accounts, effectively solving the problem of insufficient TOKEN LIMITS and REQUEST AND OTHER LIMITS for a single official account organization under large-scale requests. Typically, we maintain at least 10 independent OpenAI account organizations to comfortably handle large-scale business requests.
</div>

### Recent Updates

- 2023-11-12 Added extended support for Audio models series whisper-1 (audio-to-text) and tts-1, tts-1-1106, tts-1-hd, tts-1-hd-1106 (text-to-audio)
- 2023-11-07 Added extended support for GPT-4-Turbo series models gpt-4-1106-preview and gpt-4-vision-preview, as well as IMAGE series model dall-e-3

### Development/Test Key

| Endpoint   | BASE_URL            | API_KEY                                                 |
| -------- | ------------------------------ | -------------------------------------------------------------- |
| OpenAI   | api.openai.com                 | [OpenAI API Key](https://platform.openai.com/account/api-keys) |
| XAI      | api.proxyxai.com               | sk-XvsVUPgxOwi4pwrcsRgUxIde4kd1W8lHcaazpfbqP3Z8CPwI            |

<div class="infobox">

If you are a developer, simply change the API endpoint in the SDK from <b>api.openai.com</b> to <b>api.proxyxai.com</b>, and then set the key to the one provided by XAI. Please note that the above development/test key has model, rate, and access control restrictions, and is only allowed to call `gemini-2.0-flash`, and can only be tested on [chat.proxyxai.com](https://chat.proxyxai.com)

A special reminder, as AI technology is developing and becoming more widespread day by day, the demand for OpenAI services is increasing, and instability in official services is common. If you encounter long-term call failures, please first check the official service status page [status.openai.com](https://status.openai.com)
</div>

### AI Services

- [Assistant-Chat](https://chat.proxyxai.com)
- [Translation](https://tr.proxyxai.com)

### Overview

During system design, we specifically considered the needs of large-scale services. Our key service logic is entirely executed in memory, ensuring ultra-fast response and excellent efficiency. Our system boasts exceptional stability and effectively avoids most problems caused by instability in OpenAI's official services through our exclusive solutions.

We look forward to your use and feedback, let's work together to create a better AI ecosystem service experience.
