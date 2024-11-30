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
6. [API](https://api.proxyxai.com)
