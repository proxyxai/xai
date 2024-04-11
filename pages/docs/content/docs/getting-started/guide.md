+++
title = "开发指南"
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

## 源起

本服务为解决本地开发者稳定调用 𝑶𝒑𝒆𝒏𝑨𝑰 相关 𝑨𝑷𝑰,方便开发者,科研工作者进行 𝑨𝑰 领域工作实践以及使用 𝑨𝑰 提高日常工作学习效率

## 主要特点

随着 𝑨𝑰 技术日新月异的发展和普及,𝑶𝒑𝒆𝒏𝑨𝑰 服务访问量日益激增,官方服务不稳定是常态,因此本服务特意为开发者提供了 𝑶𝒑𝒆𝒏𝑨𝑰 侧负载过高报错时,无感知透明重试的能力,可覆盖绝大多数官方服务异常,最大程度保证接口请求成功,属于平台提供的优化服务之一

1. 支持通过 𝑶𝒑𝒆𝒏𝑨𝑰 兼容接口查询余额
2. Prompt_token 和 Completion_tokens 独立计费,与 𝑶𝒑𝒆𝒏𝑨𝑰 官网模型定价一致
3. 完善的成本分析工具,拥有从整体概览到逐笔明细账的所有消费详情
4. 支持自主定价费率/速率/额度限制/充值等的子账号能力
5. 开发者 𝐴𝑃𝐼 调用和 [𝑶𝒑𝒆𝒏𝑨𝑰 官方文档](https://platform.openai.com/docs/api-reference) 保持一致
6. [余额查询](https://usage.proxyxai.com)
7. [子账号](https://sub.proxyxai.com)
8. [文档更新](https://docs.proxyxai.com)
9. [𝐴𝑃𝐼 地址](https://api.proxyxai.com)

## 常见开源SDK使用方式

1. curl 请求

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

2. 𝑶𝒑𝒆𝒏𝑨𝑰 官方 Python 库,OpenAI官方Python包,封装了常见模型访问方式,项目源码: [OpenAI Python](https://github.com/openai/openai-python)

```
pip install --upgrade openai
```

python 调用
```python
from openai import OpenAI

client = OpenAI(
    # 将这里换成愚公代理授权分发的密钥
    api_key="sk-Xvsxxx",
    # 这里将官方API端点地址替换成愚公代理API端点地址
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

3. 𝑶𝒑𝒆𝒏𝑨𝑰 官方 Node 库, OpenAI Node包,提供了对模型接口的便捷访问,项目源码: [OpenAI Node](https://github.com/openai/openai-node)

```
npm install openai
```

Node 调用
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

## 常见开源项目使用方式

1. AutoGPT 项目 [https://github.com/Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)

请在这个文件里面 `https://github.com/Significant-Gravitas/AutoGPT/blob/master/autogpts/autogpt/.env.template` 更改下面几个参数, 目前推荐使用 gpt-4-1106-preview 这个模型, 对比 gpt-4 来说, 可以处理高达 128k 的上下文数据,而且速度更快,价格更便宜

```
OPENAI_API_KEY=sk-Xvsxxxx
OPENAI_API_BASE_URL=https://api.proxyxai.com/v1

SMART_LLM=gpt-4-1106-preview
```

2. XAgent 项目 [https://github.com/OpenBMB/XAgent](https://github.com/OpenBMB/XAgent)

请在这个文件里面 `https://github.com/OpenBMB/XAgent/blob/main/assets/config.yml` 更改下面几个参数

```
api_key=sk-Xvsxxxx
api_base=https://api.proxyxai.com
```

3. MetaGPT 项目 [https://github.com/geekan/MetaGPT](https://github.com/geekan/MetaGPT)

请在这个文件里面 `https://github.com/geekan/MetaGPT/blob/main/config/config.yaml` 更改下面几个参数

```
OPENAI_API_BASE=https://api.proxyxai.com/v1
OPENAI_API_KEY=sk-Xvsxxx
```
