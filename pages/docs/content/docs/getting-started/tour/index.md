+++
title = "上车啦"
date = 2021-05-01T08:00:00+00:00
updated = 2021-05-01T08:00:00+00:00
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

<img src="https://static.proxyxai.com/openai/openai-logo-horizontal-flat-black.png" width="320"/>

### 𝑶𝒑𝒆𝒏𝑨𝑰

> **𝑋𝐴𝐼 𝐴𝑃𝐼 𝑃𝑟𝑜𝑥𝑦 (又名愚公代理) 与 𝑂𝑝𝑒𝑛𝐴𝐼 平台 𝐴𝑃𝐼 保持一致, 支持与 𝑂𝑝𝑒𝑛𝐴𝐼 兼容的各种生态项目, 为 𝐴𝐼 行业先行者提供坚实的基础服务支撑**

- [开发指南](https://proxyxai.com/docs/getting-started/guide/)
- [用户帮助](https://proxyxai.com/docs/getting-started/config/)
- [𝐴𝑃𝐼 文档](https://proxyxai.com/docs/api/api/)

### 实现原理

![proxyxai](https://static.proxyxai.com/proxyxai-td.svg ':size=200%')

<div class="infobox">
Key 池录入了若干个不同高级别账户创建的 OpenAI API Keys，有效解决在超大规模请求下官方单个账号组织的 <b>TOKEN LIMITS</b> 和 <b>REQUEST AND OTHER LIMITS</b> 不足的问题。通常情况下，我们至少保留10个以上独立的 OpenAI 账号组织，以便从容应对大规模业务请求
</div>

### 近期更新

- 2023-11-12 新增扩展支持 Audio models 系列模型 whisper-1 (音频转文本) 和 tts-1,tts-1-1106,tts-1-hd,tts-1-hd-1106 (文本转音频)
- 2023-11-07 新增扩展支持 GPT-4-Turbo 系列模型 gpt-4-1106-preview 和 gpt-4-vision-preview,以及 IMAGE 系列模型 dall-e-3

### 开发/测试 𝒌𝒆𝒚

| 接入点   | OPENAI_API_BASE_URL            | OPENAI_API_KEY                                                 |
| -------- | ------------------------------ | -------------------------------------------------------------- |
| OpenAI   | api.openai.com                 | [OpenAI API Key](https://platform.openai.com/account/api-keys) |
| 愚公(主) | api.proxyxai.com               | sk-XvsQOaJBbqNYi0Oli2iyAqSeiL2fet1mPxXa01pA5TeuQoma            |
| 愚公(备) | api.proxyxai.cn                | sk-XvsQOaJBbqNYi0Oli2iyAqSeiL2fet1mPxXa01pA5TeuQoma            |

<div class="infobox">

如果您是开发者,只需将SDK中的API端点 <b>api.openai.com</b> 更改为 <b>api.proxyxai.com</b>,然后将 key 设置愚公提供的 key 即可, 请注意上面开发/测试 key 有模型和速率以及访问控制限制, 仅允许调用 gpt-3.5-turbo, 只可以在 [chat.proxyxai.com](https://chat.proxyxai.com) 测试使用

特别提醒,随着 𝑨𝑰 技术日新月异的发展和普及,𝑶𝒑𝒆𝒏𝑨𝑰 服务访问量日益激增,官方服务不稳定是常态,遇到长时间调用失败的时候,请先看看官方的服务状态页了解情况 [status.openai.com](https://status.openai.com)
</div>

### 𝑨𝑰 服务

- [助理-中国](https://chat.proxyxai.com)
- [助理-全球](https://talk.proxyxai.com)
- [助理-海外](https://talk-open.vercel.app)
- [翻译](https://tr.proxyxai.com)

### 系统服务

- [余额查询1](https://usage.open-assistant.cn)
- [余额查询2](https://usage.proxyxai.com)
- [余额查询3](https://usage.proxyxai.cn)
- [子账号1](https://sub.proxyxai.com)
- [子账号2](https://sub.proxyxai.cn)
- [子账号3](https://sub.open-assistant.cn)

### 概述

在系统设计阶段,我们特别考虑了超大规模服务的需求.我们的关键服务逻辑完全在内存中执行,确保了极速的响应和卓越的效率.我们的系统拥有卓越的稳定性,并通过独家解决方案有效避免了大多数由 𝑶𝒑𝒆𝒏𝑨𝑰 官方服务不稳定引起的问题

我们期待您的使用和反馈,让我们共同打造更好的 𝑨𝑰 生态服务体验
