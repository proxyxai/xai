+++
title = "Frequently Asked Questions"
description = "Answers to frequently asked questions."
date = 2021-05-01T19:30:00+00:00
updated = 2025-03-16T19:30:00+00:00
draft = false
weight = 30
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

## General Questions

<details>
<summary>What is ProxyXAI?</summary>
ProxyXAI is an AI API proxy service that provides unified access to multiple AI providers (OpenAI, Anthropic, etc.) with enhanced features like load balancing, rate limiting, usage tracking, and subaccount management.
</details>
<br/>

<details>
<summary>How is ProxyXAI different from using OpenAI directly?</summary>
ProxyXAI offers several advantages:
- Automatic failover and load balancing across multiple API keys
- Detailed usage tracking and billing management
- Subaccount system for team collaboration
- Enhanced rate limiting and access controls
- Support for multiple AI providers through one API
- Real-time WebSocket connections
- Document parsing capabilities
</details>
<br/>

<details>
<summary>Which AI providers are supported?</summary>
We support:
- OpenAI (GPT-4, GPT-3.5, DALL-E, Whisper)
- Anthropic (Claude 3 family)
- Google (Gemini models)
- xAI (Grok models)
- Perplexity
- Cohere
- DeepSeek
- And many more...
</details>
<br/>

## Account & Billing

<details>
<summary>How do I create an account?</summary>
1. Visit [m.proxyxai.com](https://m.proxyxai.com)
2. Sign up with your email
3. Your account will be created with an initial API key
4. Add credits to start using the service
</details>
<br/>

<details>
<summary>How does billing work?</summary>
- Pay-as-you-go model aligned with official provider rates
- Credits are deducted based on actual usage
- No monthly fees or subscriptions
- Detailed usage reports available via API
- Support for subaccount billing
</details>
<br/>

<details>
<summary>What is the minimum balance required?</summary>
- Regular usage: $1 minimum to make API calls
- Creating subaccounts: $20 minimum in parent account
- Subaccount initial funding: $2 minimum
- API management features: $20 minimum
</details>
<br/>

<details>
<summary>Can I get a refund?</summary>
Yes, unused credits can be refunded by:
1. Deleting a subaccount (auto-refund to parent)
2. Using negative CreditGranted in update API
3. Contacting support for main account refunds

Note: A small transaction fee (0.2) applies to prevent abuse.
</details>
<br/>

## API Usage

<details>
<summary>Why do some API calls report a 404 error?</summary>
Your domain might be configured incorrectly. Please check:
- Correct base URL: `https://api.proxyxai.com`
- Some libraries need `/v1` suffix: `https://api.proxyxai.com/v1`
- Verify the endpoint path is correct
</details>
<br/>

<details>
<summary>Error 401: Incorrect API key provided</summary>
This happens when:
- Wrong API key is used
- API base URL is not set to ProxyXAI
- Account is suspended due to zero balance
- IP is not in whitelist (if configured)

Solution: Update your configuration:
```python
client = OpenAI(
    api_key="sk-Xvs...",  # Your ProxyXAI key
    base_url="https://api.proxyxai.com/v1"
)
```
</details>
<br/>

<details>
<summary>What if an open source project doesn't support custom API base?</summary>
You can:
1. Fork the project and modify the API endpoint
2. Use environment variables if supported
3. Modify the source code to replace `api.openai.com` with `api.proxyxai.com`
4. Contact us for proxy solutions
</details>
<br/>

<details>
<summary>How do rate limits work?</summary>
Rate limits can be set at multiple levels:
- Account level: RPM/RPH/RPD (requests) and TPM/TPH/TPD (tokens)
- Model level: Specific limits per model
- Inherited from parent account (cannot exceed parent limits)
- Default: Very high limits (essentially unlimited)
</details>
<br/>

## Subaccount Management

<details>
<summary>Why does calling the subaccount API return 401?</summary>
To use subaccount management APIs:
- Your account balance must be > $20
- You must have valid permissions
- The API key must be active
</details>
<br/>

<details>
<summary>What are the requirements for creating subaccounts?</summary>
1. Parent account balance > $20
2. Initial funding ≥ $2 for new subaccount
3. Valid unique name and email
4. Subaccount limits cannot exceed parent limits
</details>
<br/>

<details>
<summary>Can subaccounts create their own subaccounts?</summary>
Yes, if the subaccount:
- Has balance > $20
- Has ChildLimit > 0
- Meets other creation requirements

This creates a hierarchy: Parent → Child → Grandchild
</details>
<br/>

<details>
<summary>How do I manage subaccount permissions?</summary>
Use the update API to set:
- `AllowModels`: Whitelist specific models
- `AllowIPs`: Restrict to specific IPs/CIDRs
- `Resources`: Limit API endpoints
- `ModelLimits`: Set per-model rate limits
</details>
<br/>

## Technical Issues

<details>
<summary>Why does the response return "Insufficient balance"?</summary>
The system requires a minimum balance of $1 to prevent asset loss. This happens when:
- Account balance < $1
- All credits have expired
- Account is suspended
</details>
<br/>

<details>
<summary>WebSocket connection keeps dropping</summary>
Common causes:
- Network instability
- Idle timeout (implement heartbeat)
- Rate limits exceeded
- Invalid authentication

Solution: Implement reconnection logic with exponential backoff
</details>
<br/>

<details>
<summary>Document parsing fails with "file too large"</summary>
Limits for document parsing:
- PDF files: Maximum 4.5MB
- Maximum 5 files per request
- Supported formats: PDF, TXT, DOCX, XLSX, CSV, MD, HTML

Split large documents or compress PDFs before uploading.
</details>
<br/>

## Security & Privacy

<details>
<summary>How are API keys stored?</summary>
- All keys are encrypted using AES-256
- Zero-trust design: even database admins cannot access plaintext keys
- Keys are never logged or exposed in responses
- Automatic encryption/decryption in memory only
</details>
<br/>

<details>
<summary>Can I restrict access by IP?</summary>
Yes, use the AllowIPs field:
```bash
curl -X PUT https://api.proxyxai.com/x-users/42 \
  -H "Authorization: Bearer $KEY" \
  -d '{"AllowIPs": "192.168.1.0/24 10.0.0.5"}'
```
</details>
<br/>

<details>
<summary>Is my data logged or stored?</summary>
- Request/response bodies are not permanently stored
- Only usage metrics are tracked (tokens, costs)
- Optional chat history for user convenience
- All data transmission is encrypted
- We comply with data protection regulations
</details>
<br/>

## Advanced Features

<details>
<summary>What is Level-based routing?</summary>
Levels allow organizing API keys by tier:
- Level 0-10: Different key pools
- Automatic failover between levels
- Model-specific level mapping
- Load distribution across providers

Example: Route GPT-4 to Level 2 keys, GPT-3.5 to Level 1
</details>
<br/>

<details>
<summary>How does the commission system work?</summary>
When doing cross-generation funding:
- Direct parent-child: No commission
- Cross-generation: 5% commission to child's parent
- Helps incentivize account distribution
- Automatic calculation and distribution
</details>
<br/>

<details>
<summary>What are Model Mappers?</summary>
Model Mappers allow request transformation:
```
gpt-3.5-turbo → gpt-4  (upgrade model)
claude-2 → claude-3    (version migration)
```
Set via configuration API or user settings.
</details>
<br/>

<details>
<summary>How do I monitor system status?</summary>
- Status page: [status.proxyxai.com](https://status.proxyxai.com)
- Health check: `GET /healthz`
- Usage logs: Dashboard API
- Email notifications for limits
- Real-time WebSocket events
</details>
<br/>

## Troubleshooting

<details>
<summary>My request succeeded but no usage was recorded</summary>
This can happen when:
- Using an unrecognized model name
- Request failed after proxy but before completion
- Usage recording is delayed (wait 1-2 minutes)

Check your usage logs for details.
</details>
<br/>

<details>
<summary>Getting random 429 errors despite low usage</summary>
Possible causes:
- Model-specific limits reached
- Upstream provider rate limits
- Token limits (TPM/TPH) exceeded
- Parent account limits affecting subaccount

Check: `/dashboard/x-user-info` for current limits
</details>
<br/>

<details>
<summary>News/notifications not appearing</summary>
News items have expiration dates:
- System news: 7 days default
- User news: 32 days default
- Check if news has expired
- Verify correct API endpoint
- Maximum 8 news items shown
</details>
<br/>

<details>
<summary>Configuration changes not taking effect</summary>
- Configuration updates are immediate
- Some changes trigger key reload (3-minute delay)
- Verify syntax for mappers and lists
- Check response for error messages
- Confirm you have proper permissions
</details>
<br/>

## Support

<details>
<summary>How do I get help?</summary>
Multiple support channels:
1. Email: support@proxyxai.com
2. Telegram: [@proxyxai](https://t.me/proxyxai)
3. WeChat: See QR code in docs
4. Twitter/X: [@proxyxai](https://x.com/proxyxai)
5. Documentation: [docs.proxyxai.com](https://proxyxai.com/docs)
</details>
<br/>

<details>
<summary>Is there an SLA?</summary>
- 99.9% uptime target
- Automatic failover systems
- Multiple datacenter deployment
- 24/7 monitoring
- Status page for transparency

Enterprise SLAs available on request.
</details>
<br/>

<details>
<summary>Can I contribute or report bugs?</summary>
Yes! We welcome contributions:
- Report issues via GitHub
- Submit feature requests
- Contribute to documentation
- Share integration examples
- Join our developer community
</details>
<br/>
