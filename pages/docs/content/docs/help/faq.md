+++
title = "Frequently Asked Questions"
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
<summary>Why do some API calls report a 404 error?</summary>
Your domain might be configured incorrectly. Please check if the api_base configuration is correct. Many libraries (such as langchain) require the /v1 suffix to be added to the api_base when configuring it, rather than just a domain. For example, https://api.proxyxai.com/v1
</details>
<br/>

<details>
<summary>Error 401: Incorrect API key provided: sk-: You can find your API key at https://platform.openai.com/accour keys</summary>
This is because you haven't configured the request's API entry address to the one we provided. The platform works by proxying API requests, so you must configure the API Base and API Key we provide. Change the API to https://api.proxyxai.com + sk-Xvsxxxx
</details>
<br/>

<details>
<summary>What if an open source project does not support configuring the api base?</summary>
Find the project source code and change the API connection address from api.openai.com to api.proxyxai.com
</details>
<br/>

<details>
<summary>Is there a limit?</summary>
You can get RPM data at [usage.proxyxai.com](https://usage.proxyxai.com)
</details>
<br/>

<details>
<summary>Why does calling the sub-account API prompt a 401 error?</summary>
In order to successfully call the system's sub-account API, your account balance needs to be more than $20. You will only get the corresponding call permissions when your account balance meets this minimum requirement. Please ensure that your account funds are sufficient to avoid such authorization problems.
</details>
<br/>

<details>
<summary>What are the conditions for creating a sub-account?</summary>
Creating a sub-account requires meeting two main conditions. First, your parent account balance needs to be more than $20, and second, the newly created sub-account needs to make an initial deposit of at least $2. These rules are mainly to prevent the abuse of sub-accounts. It's worth noting that in the Yugong proxy system, each account exists independently. As long as the sub-account balance is more than $20, it can create its own sub-account.
</details>
<br/>

<details>
<summary>Why can't I view sub-account information?</summary>
Please confirm whether the balance of the parent account has fallen below $20. According to the system settings, to perform sub-account related API operations, there must be more than $20 in the parent account.
</details>
<br/>

<details>
<summary>Why does the response return "Insufficient balance" when the account still has a balance?</summary>
To prevent asset loss, the system is set to prohibit calls when the balance is less than $1.
</details>
<br/>
