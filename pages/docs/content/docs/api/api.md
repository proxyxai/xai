+++
title = "API 文档"
date = 2023-08-01T08:00:00+00:00
updated = 2023-12-26T08:00:00+00:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

# 愚公系统子账号 API 使用说明

欢迎使用本系统的子账号 API,我们为开发者提供了一套完整的 API，以便您能够在自己的应用程序中方便地管理和操作子账号。本文档将为您详细介绍如何使用这些 API，包括接口的功能、调用方式、参数说明以及示例代码等,通过我们的 API 系统，您可以轻松创建和管理子账号，将功能和资源自由分配给您的团队成员或分享给您的好友。无论是为了业务合作、项目管理还是简单的分享，我们的子账号管理功能都能为您提供最大的灵活性和便捷性。立即使用我们的 API，开启智能分配的旅程，同时享受由此带来的潜在收益和增值服务！

## 1. 创建子账号

### 请求

```bash
curl -X POST -H "Authorization: Bearer $key" -d '{"Name": "child-1", "Email": "child-1@proxyxai.com", "CreditGranted": 100}' https://api.proxyxai.com/x-users
curl -X POST -H "Authorization: Bearer $key" -d '{"Name": "child-1", "Email": "child-1@proxyxai.com", "CreditGranted": 100, "Alias": "昵称"}' https://api.proxyxai.com/x-users
```

### 响应

响应数据包含了父账号的数据

```json
{
  "Action": "add",
  "Parent": {
    "Child": 1,
    "ChildLimit": 88888888,
    "CreditBalance": [
      {
        "amount": 10000,
        "balance": 9900,
        "granted_at": "2023-10-24T18:38:59.238721706+08:00",
        "expires_at": "2024-10-24T18:38:59.238721091+08:00"
      }
    ],
    "HardLimit": 1200000,
    "ID": 4,
    "Level": 0,
    "Name": "beta",
    "RateLimit": 6666666,
    "Rates": 1,
    "SoftLimit": 1000000
  },
  "User": {
    "ID": 7,
	"Alias": "昵称",
    "Name": "child-1",
    "SecretKey": "sk-Xvszkap0gCd0mA8QlqgARLzutOHq0Pi7OZZnbfhTmxJ3zJsa",
    "Updates": {
      "Child": 0,
      "CreditBalance": [
        {
          "amount": 100,
          "balance": 100,
          "granted_at": "2023-10-24T18:46:12.304121985+08:00",
          "expires_at": "2024-10-24T18:46:12.304122072+08:00"
        }
      ],
      "CreditGranted": 100,
      "Email": "child-1@proxyxai.com",
      "HardLimit": 100,
      "Level": 0,
      "Name": "child-1",
      "RateLimit": 6666666,
      "Rates": 1,
      "SoftLimit": 80
    }
  }
}
```

字段说明:

```
预付卡是一个名为 CreditBalance 的结构包含以下字段:
amount:充值卡额
balance:卡额剩余
reference:交易备注
granted_at:充值时间
expires_at:过期时间
CreditGranted 预付卡充值额度 (如上默认创建并给予充值额度,所以是$100,这个字段只是记录最新一次充值额度大小)
```

```
Name  账号名,唯一标识,不能重复,可以修改(必须字段)
Email 账号邮箱,唯一标识,不能重复,可以修改(必须字段)
CreditGranted 预付卡充值额度(必须字段)
Alias 账号昵称,默认与Name一致(可选字段)
Level 账号等级,继承自父账号,不可更改
Rates 账号费率,继承自父账号,可以调大
SecretKey 子账号的API Key,系统生成唯一账号Key,只在账号创建之时显示一次,请妥善保管,不提供二次找回,丢失只能废弃重建
HardLimit 月度用量硬限制,默认取自充值额度向上取整100,可以调小 (系统硬限制,使用超过该额度将禁止调用,可以根据业务需要调大)
SoftLimit 月度用量软限制,默认取自充值额度向上取整100的80%,可以调小 (系统软限制,使用超过该额度将收到邮件提醒)
RateLimit 最大请求次/分钟,默认继承自父账号,可以调小
```

<div class="infobox">
"CreditGranted" 请求传递的是 float64 类型的数字,而不是字符串; "CreditBalance" 充值卡片,系统采用自动合并策略对充值卡片进行合并,对于拥有超过10张卡片的账号,系统会自动将其合并至10张以内,同时保证总卡额不变,在两张小卡片合并为一张大卡片的过程中,新卡片的过期时间将以原始小卡片中最长的过期时间为准。
</div>

## 2. 获取指定子账号

### 请求

```bash
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users/7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users/child-1"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users/child-1@proxyxai.com"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?id=7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?name=xxx"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?email=xxx"
```

### 响应

```json
[
  {
    "ID": 7,
    "Level": 0,
    "Name": "child-1",
    "Rates": 1,
    "CreditUsed": 0,
    "CreditBalance": [
      {
        "amount": 100,
        "balance": 100,
        "granted_at": "2023-10-24T18:46:12.304121985+08:00",
        "expires_at": "2024-10-24T18:46:12.304122072+08:00"
      }
    ],
    "CreditGranted": 100,
    "HardLimit": 100,
    "SoftLimit": 80,
    "RateLimit": 6666666,
    "ChildLimit": 88888888,
    "Child": 0,
    "Requests": 0,
    "Status": true,
    "Email": "child-1@proxyxai.com",
    "PartialKey": "0Pi7OZZnbfhTmxJ3zJsa",
    "SecretKey": "***",
    "CreatedAt": "2023-10-24T18:46:12.306937+08:00",
    "UpdatedAt": "2023-10-24T18:46:12.306937+08:00"
  }
]
```

字段说明:

```
"SecretKey": "***",
这个字段不同于上面创建时候的明文信息,而是加密存储
```

## 3. 获取所有子账号

### 请求
```
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?page=1&size=10"
```

### 响应
```
[
  {
    "ID": 8,
    "Level": 0,
    "Name": "child-2",
    "Rates": 1,
    "CreditUsed": 0,
    "CreditBalance": [
      {
        "amount": 100,
        "balance": 100,
        "granted_at": "2023-10-24T18:49:53.716420048+08:00",
        "expires_at": "2024-10-24T18:49:53.716420138+08:00"
      }
    ],
    "CreditGranted": 100,
    "HardLimit": 100,
    "SoftLimit": 80,
    "RateLimit": 6666666,
    "ChildLimit": 88888888,
    "Child": 0,
    "Requests": 0,
    "Status": true,
    "Email": "child-2@proxyxai.com",
    "PartialKey": "eQGRm3H3tyDDdCzGEACC",
    "SecretKey": "***",
    "CreatedAt": "2023-10-24T18:49:53.71827+08:00",
    "UpdatedAt": "2023-10-24T18:49:53.71827+08:00"
  },
  {
    "ID": 7,
    "Level": 0,
    "Name": "child-1",
    "Rates": 1,
    "CreditUsed": 0,
    "CreditBalance": [
      {
        "amount": 100,
        "balance": 100,
        "granted_at": "2023-10-24T18:46:12.304121985+08:00",
        "expires_at": "2024-10-24T18:46:12.304122072+08:00"
      }
    ],
    "CreditGranted": 100,
    "HardLimit": 100,
    "SoftLimit": 80,
    "RateLimit": 6666666,
    "ChildLimit": 88888888,
    "Child": 0,
    "Requests": 0,
    "Status": true,
    "Email": "child-1@proxyxai.com",
    "PartialKey": "0Pi7OZZnbfhTmxJ3zJsa",
    "SecretKey": "***",
    "CreatedAt": "2023-10-24T18:46:12.306937+08:00",
    "UpdatedAt": "2023-10-24T18:46:12.306937+08:00"
  }
]
```

<div class="infobox">
仅能获取直接子账号,参数可以传递账号ID,也可以传递账号Name,一页最多返回1000条数据记录,如果子账号数量超过1000条,则需要分页查询,比如 /x-users?page=2&size=1000 分两页,每页1000条;请注意 curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users" 全部子账号查询的时候,要调用核心API,每次需要系统手续费$0.002
</div>

## 4. 获取指定后代账号

### 请求

```bash
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna/7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna/child-1"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna/child-1@proxyxai.com"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?id=7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?name=xxx"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?email=xxx"
```

## 5. 获取所有后代账号

### 请求
```
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?page=1&size=10"
```

<div class="infobox">
与仅获取直接子账号的接口不同，此接口旨在获取当前账号的所有下级账号，包括子账号的子账号,子账号的子账号...，即获取所有后代账号。
</div>

## 6. 充值(扣减)子账号额度

### 请求
```
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 100}' "https://api.proxyxai.com/x-users/7"
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 100}' "https://api.proxyxai.com/x-users/child-1"
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": -10}' "https://api.proxyxai.com/x-users/child-1"
```

### 充值响应
```
{
  "Action": "update",
  "Parent": {
    "Balance": 9720,
    "Child": 2,
    "ChildLimit": 88888888,
    "CreditBalance": [
      {
        "amount": 10000,
        "balance": 9720,
        "granted_at": "2023-10-24T18:38:59.238721706+08:00",
        "expires_at": "2024-10-24T18:38:59.238721091+08:00"
      }
    ],
    "HardLimit": 1200000,
    "ID": 4,
    "Level": 0,
    "Name": "beta",
    "RateLimit": 6666666,
    "Rates": 1,
    "SoftLimit": 1000000
  },
  "User": {
    "ID": 7,
    "Name": "child-1",
    "Updates": {
      "ChildLimit": 88888888,
      "CreditBalance": [
        {
          "amount": 100,
          "balance": 100,
          "granted_at": "2023-10-24T18:46:12.304121985+08:00",
          "expires_at": "2024-10-24T18:46:12.304122072+08:00"
        },
        {
          "amount": 80,
          "balance": 80,
          "granted_at": "2023-10-24T18:52:18.074094181+08:00",
          "expires_at": "2024-10-24T18:52:18.074092875+08:00"
        }
      ],
      "Balance": 180,
      "CreditGranted": 80,
      "Email": "child-1@proxyxai.com",
      "HardLimit": 200,
      "Level": 0,
      "Name": "child-1",
      "RateLimit": 6666666,
      "Rates": 1,
      "SoftLimit": 80,
      "Status": true
    }
  }
}
```

### 扣减响应

```
{
  "Action": "update",
  "Parent": {
    "Balance": 9769.8,
    "Child": 2,
    "ChildLimit": 88888888,
    "CreditBalance": [
      {
        "amount": 50,
        "balance": 50,
        "granted_at": "2023-10-24T18:55:16.315242864+08:00",
        "expires_at": "2024-08-19T18:55:16.315242707+08:00"
      },
      {
        "amount": 10000,
        "balance": 9719.8,
        "granted_at": "2023-10-24T18:38:59.238721706+08:00",
        "expires_at": "2024-10-24T18:38:59.238721091+08:00"
      }
    ],
    "HardLimit": 1200000,
    "ID": 4,
    "Level": 0,
    "Name": "beta",
    "RateLimit": 6666666,
    "Rates": 1,
    "SoftLimit": 1000000
  },
  "User": {
    "ID": 7,
    "Name": "child-1",
    "Updates": {
      "ChildLimit": 88888888,
      "CreditBalance": [
        {
          "amount": 100,
          "balance": 50,
          "granted_at": "2023-10-24T18:46:12.304121985+08:00",
          "expires_at": "2024-10-24T18:46:12.304122072+08:00"
        },
        {
          "amount": 80,
          "balance": 80,
          "granted_at": "2023-10-24T18:52:18.074094181+08:00",
          "expires_at": "2024-10-24T18:52:18.074092875+08:00"
        }
      ],
      "Balance": 180,
      "CreditGranted": -50,
      "Email": "child-1@proxyxai.com",
      "HardLimit": 200,
      "Level": 0,
      "Name": "child-1",
      "RateLimit": 6666666,
      "Rates": 1,
      "SoftLimit": 80,
      "Status": true
    }
  }
}
```

字段说明:

```
Balance 账号总余额,其值为 CreditBalance 各个充值卡所剩余额 balance 累加之和
```

<div class="infobox">
如果"CreditGranted"的数值大于零，则表示进行了充值操作；若数值小于零，则意味着发生了退款或扣款。上面例子可以看到子账号扣减$50后,总余额变成了50+80,父账号增加了$50,总余额变成了 50+9719.8,这反映了退款流程的进行。需特别注意的是，$9719.8的余额较之前的$9720有所减少，这是因为系统收取了$0.2的手续费，旨在防止系统核心API被恶意使用。值得一提的是，当子账号被删除时，也会收取$0.2的手续费。此外，这个API不仅支持对直接子账号进行充值和扣款，也能作用于任何下属后代账号。
</div>

## 7. 为子账号充值并自定义过期时间

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 10, "Days": 30}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 10, "Days": 30}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
可以为子账号充值，并指定这次充值卡的有效期(如果不指定,默认是365天),参数 Days 用于设置充值卡额度的有效时间，其值可以是 0 到 365 之间的任意浮点数。到期未使用的额度会消失, 父账号可以在到期之前主动回收子账号未使用的卡额从而避免资损, 具体可以参考上面的扣减 API 操作
</div>

## 8. 调整子账号费率

### 请求
```
curl -X PUT -H "Authorization: Bearer $key" -d '{"Rates": 2}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"Rates": 2}' https://api.proxyxai.com/x-users/child-1
```

### 响应

```
{
  "Action": "update",
  "Parent": {
    "Balance": 9769.8,
    "Child": 2,
    "ChildLimit": 88888888,
    "CreditBalance": [
      {
        "amount": 50,
        "balance": 50,
        "granted_at": "2023-10-24T18:55:16.315242864+08:00",
        "expires_at": "2024-08-19T18:55:16.315242707+08:00"
      },
      {
        "amount": 10000,
        "balance": 9719.8,
        "granted_at": "2023-10-24T18:38:59.238721706+08:00",
        "expires_at": "2024-10-24T18:38:59.238721091+08:00"
      }
    ],
    "HardLimit": 1200000,
    "ID": 4,
    "Level": 0,
    "Name": "beta",
    "RateLimit": 6666666,
    "Rates": 1,
    "SoftLimit": 1000000
  },
  "User": {
    "ID": 7,
    "Name": "child-1",
    "Updates": {
      "ChildLimit": 88888888,
      "CreditBalance": [
        {
          "amount": 200,
          "balance": 100,
          "granted_at": "2023-10-24T18:46:12.304121985+08:00",
          "expires_at": "2024-10-24T18:46:12.304122072+08:00"
        },
        {
          "amount": 160,
          "balance": 160,
          "granted_at": "2023-10-24T18:52:18.074094181+08:00",
          "expires_at": "2024-10-24T18:52:18.074092875+08:00"
        }
      ],
      "Balance": 260,
      "CreditGranted": 0,
      "Email": "child-1@proxyxai.com",
      "HardLimit": 300,
      "Level": 0,
      "Name": "child-1",
      "RateLimit": 6666666,
      "Rates": 2,
      "SoftLimit": 80,
      "Status": true
    }
  }
}
```

<div class="infobox">
请特别注意这个费率调整,可以看到原先该子账号费率是1,总余额是50+80,当新调整费率为2,总余额也随之变化为100+160,而实际使用额度总量并没有变化,因为费率的调整子账号账面余额变大,所以之后费率是1的父账号再向该子账号充值的时候,充值100,实际上父账号扣减的是50,请了解这个计费算法
</div>

## 9. 调整子账号速率限制

### 请求

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"RateLimit": 5}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"RateLimit": 5}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
参数可以传递账号ID,也可以传递账号Name,设定目标子账号每分钟最大请求5次
</div>

## 10. 调整子账号邮箱和名称

### 请求

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"Email": "child-x@163.com"}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"Name": "child-x"}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"Name": "child-x", "Email": "child-x@163.com"}' https://api.proxyxai.com/x-users/7
```

<div class="infobox">
父账号可以更新其子账号的基本属性，例如在这个例子中，父账号将ID为7的子账号的邮箱（Email）和名称（Name）字段进行更新。可以分别单独更新每个字段，也可以一次性更新两个字段。
</div>

## 11. 删除子账号

### 请求

```bash
curl -X DELETE -H "Authorization: Bearer $key"  https://api.proxyxai.com/x-users/7
curl -X DELETE -H "Authorization: Bearer $key"  https://api.proxyxai.com/x-users/child-1
```

### 响应

```json
{
  "Action": "delete",
  "Parent": {
    "CreditBalance": [
      {
        "amount": 129.8,
        "balance": 129.8,
        "granted_at": "2023-10-24T19:05:14.133984009+08:00",
        "expires_at": "2024-04-21T19:05:14.133983832+08:00"
      },
      {
        "amount": 50,
        "balance": 50,
        "granted_at": "2023-10-24T18:55:16.315242864+08:00",
        "expires_at": "2024-08-19T18:55:16.315242707+08:00"
      },
      {
        "amount": 10000,
        "balance": 9719.8,
        "granted_at": "2023-10-24T18:38:59.238721706+08:00",
        "expires_at": "2024-10-24T18:38:59.238721091+08:00"
      }
    ],
    "ID": 4,
    "Name": "beta",
    "Rates": 1
  },
  "User": {
    "CreditBalance": [
      {
        "amount": 200,
        "balance": 100,
        "granted_at": "2023-10-24T18:46:12.304121985+08:00",
        "expires_at": "2024-10-24T18:46:12.304122072+08:00"
      },
      {
        "amount": 160,
        "balance": 160,
        "granted_at": "2023-10-24T18:52:18.074094181+08:00",
        "expires_at": "2024-10-24T18:52:18.074092875+08:00"
      }
    ],
    "ID": 7,
    "Name": "child-1",
    "Rates": 2
  }
}
```

<div class="infobox">
当子账号被删除时,子账号的余额将会退回到父账号.以上面例子来说,子账号有 100+160(账面额度)/2(费率) = 130余额,这些余额将会被退回到父账号,这个API调用消耗0.2系统手续费,最终父账号增加 130-0.2=129.8 额度.需要注意的是,退回的余额默认的有效期为180天.
</div>

## 12. 查询当前 key 所属账号基础属性

### 请求

```bash
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/dashboard/x_user/info"
```

## 13. 查询当前 key 一段日期的使用数据(最多查询12个月)

### 请求

```bash
curl GET -H "Authorization: Bearer $key"  "https://api.proxyxai.com/v1/dashboard/billing/usage?start_date=2023-08-10&end_date=2023-11-18"
```


## 14. 为子账号设置账单通知专属邮箱/自定义账号别名(可以自我调整)

### 请求

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"BillingEmail": "child-1@qq.com"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"Alias": "bob"}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
在创建子账号的过程中，账号名称和邮箱地址的唯一性是系统默认的强制要求，这确保了每个账号的独立性和安全性。简言之，同一邮箱不能被用来注册多个账号。然而，与此相反的是，账单邮箱的设置则灵活得多。系统允许多个账号共用同一账单邮箱地址，这样做的好处是父账号可以将多个子账号的账单和系统通知集中到一个邮箱里，便于用户统一管理和查阅，大大提升了管理效率和用户体验。此外，账号别名的个性化设置允许用户以更具特色的方式标识和区分各个账号。通过这样的设计，用户能够更加方便地掌握各个账号的财务和通知信息，从而实现高效的账号管理。
</div>

## 15. 访问控制: 添加/删除子账号的可信IP白名单

### 请求

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "49.234.158.212"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "118.23.21.0/24 119.24.12.11"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"DenyIPs": "49.234.158.212"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"DenyIPs": "118.23.21.0/24 119.24.12.11"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "*"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"DenyIPs": "*"}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
默认情况下，不限制调用来源IP。如果企业需要对子账号实施访问控制，可以设置子账号仅在可信来源IP集合内进行调用。支持CIDR格式。请注意，AllowIPs: "*" 表示恢复为默认不限制，而 DenyIPs: "*" 表示仅允许 127.0.0.1 调用。
</div>

## 16. 访问控制: 添加/删除子账号的Model白名单

### 请求

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "gpt-3.5-turbo"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "gpt-3.5-turbo gpt-4"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"DenyModels": "gpt-3.5-turbo"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"DenyModels": "gpt-3.5-turbo gpt-4"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "*"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"DenyModels": "*"}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
默认情况下，不限制调用模型。如果企业需要对子账号实施访问控制，可以设置子账号仅在允许的模型集合内进行调用。请注意，AllowModels: "*" 表示恢复为默认不限制，而 DenyModels: "*" 表示禁止所有模型调用。
</div>
