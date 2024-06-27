+++
title = "User Help"
updated = 2021-05-01T08:00:00+00:00
draft = false
weight = 3
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

## OpenAI API Service Features

1. Compatible with all clients or web applications that support "Custom OpenAI Domain".
2. The server is deployed in regions that support the call of OpenAI SDK, ensuring seamless access for all clients.
3. Provides account management features, allowing each account to be assigned a unique API Key, facilitating team collaboration.
4. Implements tracking and statistics of the number of API calls for each account.

## Usage Examples

### BotGem (All Endpoints)

Download link [botgem.com](https://botgem.com)

After downloading, open the settings page, select OpenAI, and enter the API Base and API Key provided by the platform.

### OpenCat Client (iOS & Mac)

Even though OpenCat provides a team version, this feature is still a paid service. The purpose of free use by the team can be achieved through the use of the custom OpenAI domain feature.

1. In the OpenCat client, set the API Key to the Key we assigned.
2. Set the custom OpenAI domain to your own server address, for example: `https://api.proxyxai.com`, and click "Verify" under "Custom API Domain" to complete the setting.

### ChatBox (Windows, Mac, Linux)

Visit [ChatBox GitHub repository](https://github.com/Bin-Huang/chatbox).

In the settings, select OpenAI API, enter the API address and API Key of this service.

### ChatBoost（Android）

In the settings, configure the custom API address as the API address and API Key of this service.

### ChatGPT Box（Browser Plugin）

Visit [ChatGPT Box Chrome Store page](https://chrome.google.com/webstore/detail/chatgptbox/eobbhoofkanlmddnplfhnmkfbnlhpbbo).

In "Advanced" settings, modify the "Custom ChatGPT Web API Address" to the API address of this service, and fill in the API Key in the input box after "API Mode".

### ChatGPT-Next-web（Web Version）

Visit [ChatGPT-Next-Web GitHub repository](https://github.com/Yidadaa/ChatGPT-Next-Web).

Deploy docker using the following command:

```markdown
docker run --name=chatgpt -d -p 3000:3000 -e OPENAI_API_KEY="" -e BASE_URL="api.proxyxai.com" -e PROTOCOL="https" yidadaa/chatgpt-next-web:latest
```

Set `BASE_URL` to the API address of this service, and keep `OPENAI_API_KEY` empty. In this way, when accessing the web version, users can directly use their own API Key.
