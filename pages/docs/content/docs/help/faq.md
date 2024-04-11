+++
title = "常见问题"
description = "Answers to frequently asked questions."
date = 2021-05-01T19:30:00+00:00
updated = 2021-05-01T19:30:00+00:00
draft = false
weight = 30
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

<details>
<summary>为什么某些接口调用报错404?</summary>
你域名可能配错了，请检查api_base配置是否正确，很多库（比如langchain）在配置api_base时，需要加上/v1的接口后缀，而不是直接一个域名，示例https://api.proxyxai.com/v1
</details>
<br/>

<details>
<summary>报错：Error 401: Incorrect APl key provided: sk-： You can find your APl key at https://platform.openai.com/accour keys</summary>
这是因为你没有配置请求的API接入地址为我们提供的地址，平台工作的原理就是代理API请求，因此你必须配置我们平台提供的API Base和API Key，将API改为https://api.proxyxai.com + sk-Xvsxxxx 即可
</details>
<br/>

<details>
<summary>如果某个开源项目不支持配置api base怎么办？</summary>
找到项目源码,将里面的API连接地址从 api.openai.com 改成 api.proxyxai.com 即可
</details>
<br/>

<details>
<summary>有限量吗?</summary>
可在余额查询 [usage.proxyxai.com](https://usage.proxyxai.com) 获得 RPM 数据
</details>
<br/>

<details>
<summary>为什么调用子账号API提示 401 报错?</summary>
为了成功调用系统子账号API，您的账号余额需要保持大于$20。只有当账号余额满足这一最低要求时，您才能获得相应的调用权限。请确保您的账号资金充足，以避免此类授权问题。
</details>
<br/>

<details>
<summary>创建子账号需要满足哪些条件?</summary>
创建子账号需要满足两个主要条件.首先,您的父账号余额需要保持大于$20,其次,新创建的子账号需要进行至少$2的初始充值.这些规定主要是为了防止子账号的滥用.值得注意的是,在愚公代理系统中,每个账号都是独立存在的.只要子账号的余额超过$20,它就可以创建自己的子账号.
</details>
<br/>

<details>
<summary>为什么无法查看子账号信息?</summary>
请确认父账号的余额是否已降至不足$20.根据系统设定,要进行子账号相关的API操作,父账号中必须保持大于$20的余额.
</details>
<br/>

<details>
<summary>为什么账号还有余额,请求响应却返回 "Insufficient balance" ?</summary>
为防止资损,系统设定余额小于$1额度的时候,禁止调用
</details>
<br/>
