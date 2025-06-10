# ProxyXAI

ProxyXAI is designed as a reliable, efficient, and secure XAI API Keys management system, providing users with better XAI API access services. It is a system that consumes XAI API Keys and outputs stable and reliable AI API access services.

## Implementation Principle

```mermaid
graph TD
    A(Client)
    A -- Use virtual Key provided by Proxy to make requests --> B(Proxy)
    B -- Poll an XAI API Key from the Key pool --> C(XAI API Key)
    C -- Request --> D(XAI API)
    D -- Return 5xx error --> E[Proxy discards error and retries]
    E -- Retry --> B
    D -- Normal response --> F[Return to client]
    style A fill:#58C1B2
    style B fill:#F7DC6F
    style C fill:#F1948A
    style D fill:#85C1E9
    style E fill:#F0E68C
    style F fill:#ABEBC6
```

## License Agreement

The system is open for deployment. Users need to retain the signature `Powered by ProxyXAI` at the bottom of the official service page, and link to [ProxyXAI](https://proxyxai.com). If you do not want to keep the signature, you need to obtain our authorization.

## Resource Dependencies

Recommended AWS t3.small, t3.micro, or other 2-core 2G overseas hosts, with a minimum configuration requirement of 1-core 1G.

## Environment Installation

Depends on the docker environment and docker-compose container management tool.

```
1. yum -y install docker
2. curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
3. chmod +x /usr/local/bin/docker-compose
4. curl -L https://raw.githubusercontent.com/proxyxai/xai/main/docker-compose.yml -o docker-compose.yml
5. docker-compose -f docker-compose.yml up -d
```

## Deployment Instructions

1. API: Use `docker-compose -f docker-compose.yml up -d` to start the service with one click. The default startup port is 3443.

## Deployment Example

We will use [proxyxai.com](https://proxyxai.com) as an example to illustrate the deployment and domain resource allocation structure.

- Deploy api.proxyxai.com, configure an nginx service to associate api.proxyxai.com 80/443 with the API service's 3443 port.
- Deploy sub.proxyxai.com, configure an nginx service to associate sub.proxyxai.com requests with the pages/sub static file directory.

## Initial Setup

1. Enter XAI API Keys by making a request: `curl -X POST -H "Authorization: $key" -d '{"SecretKey": "sk-xxx", "Provider": "https://api.openai.com"}' https://api.proxyxai.com/x-keys`. After successful entry, the HTTP status code 200 is returned.
2. After entering, restart the system to load the Keys into memory immediately: `docker-compose down;docker-compose -f docker-compose.yml up -d`.
3. Allocate sub-account quotas in the sub-account system, and then issue them to users.

The `$key` here refers to the root key in the deployed docker-compose.yml for managing the API. If the entered XAI API Keys become invalid, the system will automatically clean them up without any manual intervention.

For more API management details, please read [proxyxai.com](https://proxyxai.com/#/api)

## Special Note

By default, the docker-compose.yml file sets XAI_BASE to api.openai.com. Therefore, you need to input the API Keys obtained from the official OpenAI platform. If you need to use API Keys from other proxy providers, you should change XAI_BASE to the corresponding service node address, such as api.xxx.xxx. We call this usage method "multi-level cascading deployment," while the default method of proxying to the official node api.openai.com is called "single-level cascading deployment."

## Donation

[Buy Me a Coffee](https://www.buymeacoffee.com/proxyxai)

## Special Thanks

[openai.com](https://openai.com)

[anthropic.com](https://www.anthropic.com)

---

# ProxyXAI

ProxyXAI 是一个可靠、高效且安全的 XAI API Keys 管理系统，为用户提供更好的 XAI API 接入服务。它是一个消耗 XAI API Keys 的系统，输出稳定可靠的 AI API 接入服务, 并且拥有强大的多租户能力, 管理员可以方便的控制子账号的使用额度, 调用速率, 调用模型权限, 调用来源IP白名单等。

## 实现原理

```mermaid
graph TD
    A(客户端)
    A -- 使用愚公代理分发的虚拟Key进行请求 --> B(愚公代理)
    B -- 从Key池中轮询获取一个 XAI API Key --> C(XAI API Key)
    C -- 请求 --> D(XAI API)
    D -- 返回5xx错误 --> E[愚公代理丢弃错误并重试]
    E -- 重试 --> B
    D -- 正常响应 --> F[返回给客户端]
    style A fill:#58C1B2
    style B fill:#F7DC6F
    style C fill:#F1948A
    style D fill:#85C1E9
    style E fill:#F0E68C
    style F fill:#ABEBC6
```

## 授权协议

系统开放部署,使用者需要在官方服务页面底部保留署名 `Powered by ProxyXAI` 同时指向链接 [ProxyXAI](https://proxyxai.com)。

## 资源依赖

推荐 AWS t3.small, t3.micro 等机型，或者一般 2核2G 配置的海外主机(可以调用官方 API 的地区)，最低配置要求 1核1G。

## 环境安装

依赖 docker 环境以及 docker-compose 容器管理工具。

```
1. yum -y install docker
2. curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
3. chmod +x /usr/local/bin/docker-compose
4. curl -L https://raw.githubusercontent.com/proxyxai/xai/main/docker-compose.yml -o docker-compose.yml
5. docker-compose -f docker-compose.yml up -d
```

## 部署说明

1. API：使用 `docker-compose -f docker-compose.yml up -d` 一键拉起，默认启动端口是 3443。

## 部署案例

我们以 [proxyxai.com](https://proxyxai.com) 为例说明部署和域名资源分配结构。

- 部署 api.proxyxai.com，nginx 配置一个服务将 api.proxyxai.com 80/443 关联到 API 服务的 3443 端口。
- 部署 sub.proxyxai.com，nginx 配置一个服务将 sub.proxyxai.com 请求关联到 pages/sub 静态文件目录。

## 初始设置

1. 录入 XAI API Keys，操作请求：`curl -X POST -H "Authorization: $key" -d '{"SecretKey": "sk-xxx", "Provider": "https://api.openai.com"}' https://api.proxyxai.com/x-keys`。录入成功后返回 HTTP 状态码 200。
2. 录入后，因为系统将最多2小时内触发一次自动加载 Keys 到内存，如需立即生效，可以以 root key 操作管理 API 即刻加载：`curl -X POST -H "Content-Type: application/json" -H "Authorization: $key" -d '{"LoadKeys": true}' https://api.proxyxai.com/x-conf`。

这里的 `$key` 是指部署的 docker-compose.yml 里的 root key，用于请求管理 API。录入的 XAI API Keys 如失效，系统将全自动清理，不再需要人工干预。

更多 API 管理细节，请阅读 [proxyxai.com](https://proxyxai.com/#/api)

## 特别说明

默认情况下，docker-compose.yml 文件里将 XAI_BASE 设置为 https://api.openai.com, 因此，您需要输入从 OpenAI 官方平台获取的 API Key,如果您需要使用来自其他代理提供商的 API Key，您应将 XAI_BASE 更改为相应的服务节点地址，例如 https://api.xxx.xxx, 我们将这种使用方法称为“多级串联部署”，而代理到官方节点 https://api.openai.com 的方法称为“一级串联部署”。

## 鸣谢

[openai.com](https://openai.com)

[anthropic.com](https://www.anthropic.com)
