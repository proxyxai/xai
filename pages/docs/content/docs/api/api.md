+++
title = "API Reference"
date = 2025-03-01T08:00:00+00:00
updated = 2025-03-16T08:00:00+00:00
draft = false
weight = 1
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

# XAI Subaccount API Usage Guide

Welcome to the Subaccount API of XAI system. We provide developers with a comprehensive set of APIs to help you easily manage and operate subaccounts in your application. This document will provide you with detailed instructions on how to use these APIs, including interface functions, call methods, parameter descriptions, and sample code. Through our API system, you can easily create and manage subaccounts, allocate features and resources to your team members or share them with your friends. Whether it's for business collaboration, project management, or simple sharing, our subaccount management features offer maximum flexibility and convenience. Start using our APIs now, embark on an intelligent allocation journey, and enjoy the potential benefits and value-added services that come with it!

## 1. Create Subaccount

### Request

```bash
curl -X POST -H "Authorization: Bearer $key" -d '{"Name": "child-1", "Email": "child-1@proxyxai.com", "CreditGranted": 100}' https://api.proxyxai.com/x-users
curl -X POST -H "Authorization: Bearer $key" -d '{"Name": "child-1", "Email": "child-1@proxyxai.com", "CreditGranted": 100, "Alias": "Nickname"}' https://api.proxyxai.com/x-users
```

### Response

Response data contains the parent account information

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
    "RPM": 6666666,
    "Rates": 1,
    "SoftLimit": 1000000
  },
  "User": {
    "ID": 7,
	"Alias": "Nickname",
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
      "RPM": 6666666,
      "Rates": 1,
      "SoftLimit": 80
    }
  }
}
```

Field description:

```
The prepaid card is a structure called CreditBalance that includes the following fields:
amount: Recharge card amount
balance: Remaining card balance
reference: Transaction remarks
granted_at: Recharge time
expires_at: Expiration time
CreditGranted Prepaid card recharge amount (As shown above, the default creation and recharge amount are given, so it is $100, this field is only a record of the latest recharge amount size)
```

```
Name  Account name, unique identifier, cannot be repeated, can be modified (Required field)
Email Account email, unique identifier, cannot be repeated, can be modified (Required field)
CreditGranted Prepaid card recharge amount (Required field)
Alias Account nickname, default is the same as Name (Optional field)
Level Account level, inherited from parent account, cannot be modified
Rates Account rate, inherited from parent account, can be adjusted larger
SecretKey Subaccount API Key, system-generated unique account key, only displayed once at the time of account creation, please keep it safe, no secondary recovery is provided, it can only be discarded and rebuilt if lost
HardLimit Monthly usage hard limit, defaulting to the rounded up integer of the recharge amount, can be reduced (System hard limit, usage beyond this limit will be blocked, can be adjusted upwards according to business needs)
SoftLimit Monthly usage soft limit, defaulting to 80% of the rounded up integer of the recharge amount, can be reduced (System soft limit, usage beyond this limit will receive email reminders)
RPM Maximum requests per minute, default inherited from parent account, can be reduced
```

<div class="infobox">
"CreditGranted" passes a float64 type number in the request, not a string; "CreditBalance" recharge card, the system uses an automatic merge strategy to merge recharge cards, for accounts with more than 10 cards, the system will automatically merge them to less than 10 while maintaining the total card balance unchanged, during the process of merging two small cards into a larger one, the expiration time of the new card will be based on the longest expiration time among the original small cards.
</div>

## 2. Get the specified subaccount

### Request

```bash
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users/7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users/child-1"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users/child-1@proxyxai.com"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?id=7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?name=xxx"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?email=xxx"
```

### Response

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
    "RPM": 6666666,
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

Field description:

```
"SecretKey": "***",
This field is different from the plaintext information when created, as it is encrypted storage
```

## 3. Get all subaccounts

### Request
```
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-users?page=1&size=10"
```

### Response
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
    "RPM": 6666666,
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
    "RPM": 6666666,
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
This API can only obtain direct subaccounts. Parameters can be passed for the account ID or account Name. A maximum of 1,000 data records can be returned on a single page. If the number of subaccounts exceeds 1,000, pagination is required for querying, such as /x-users ?page=2&size=1000, divided into two pages, each with 1,000 records. Please note, when querying all subaccounts, the core API should be called, and each time the system will consume a $0.002 service fee.
</div>

## 4. Get specified descendant accounts

### Request

```bash
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna/7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna/child-1"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna/child-1@proxyxai.com"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?id=7"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?name=xxx"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?email=xxx"
```

## 5. Get all descendant accounts

### Request
```
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna"
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/x-dna?page=1&size=10"
```

<div class="infobox">
Different from the interface for obtaining only direct subaccounts, this interface aims to obtain all lower-level accounts of the current account, including subaccount's subaccounts, subaccount's subaccounts..., that is, to obtain all descendant accounts.
</div>

## 6. Recharge (deduct) subaccount balance

### Request
```
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 100}' "https://api.proxyxai.com/x-users/7"
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 100}' "https://api.proxyxai.com/x-users/child-1"
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": -10}' "https://api.proxyxai.com/x-users/child-1"
```

### Recharge Response
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
    "RPM": 6666666,
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
      "HardLimit": 100,
      "Level": 0,
      "Name": "child-1",
      "RPM": 6666666,
      "Rates": 1,
      "SoftLimit": 80,
      "Status": true
    }
  }
}
```

### Deduct Response

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
    "RPM": 6666666,
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
      "RPM": 6666666,
      "Rates": 1,
      "SoftLimit": 80,
      "Status": true
    }
  }
}
```

Field explanation:

```
Balance Total account balance, which is the sum of the remaining balances of each recharge card in CreditBalance
```

<div class="infobox">
If the value of "CreditGranted" is greater than zero, it means a recharge operation has occurred; if the value is less than zero, it means a refund or deduction has occurred. In the example above, you can see that after the subaccount is deducted $50, the total balance becomes 50+80, and the parent account is increased by $50, and the total balance becomes 50+9719.8. This reflects the progress of the refund process. It should be noted that the $9719.8 balance is less than the previous $9720 because the system charged a $0.2 handling fee to prevent the core API from being maliciously used. It is worth mentioning that when a subaccount is deleted, a $0.2 handling fee will also be charged. In addition, this API not only supports recharging and deducting for direct subaccounts but also applies to any subordinate descendant accounts.
</div>

## 7. Recharge for subaccount with custom expiration time

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 10, "Days": 30}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"CreditGranted": 10, "Days": 30}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
You can recharge for your subaccount and specify the expiration time for this recharge card (if not specified, the default is 365 days). The "Days" parameter is used to set the validity period of the recharge card balance, the value can be any floating-point number between 0 and 365. The unused balance will disappear after it expires, and the parent account can actively recover the unused card balance of the subaccount before it expires to avoid loss, which can refer to the corresponding deduction API operation mentioned above.
</div>

## 8. Adjust subaccount rate

### Request
```
curl -X PUT -H "Authorization: Bearer $key" -d '{"Rates": 2}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"Rates": 2}' https://api.proxyxai.com/x-users/child-1
```

### Response

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
    "RPM": 6666666,
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
      "RPM": 6666666,
      "Rates": 2,
      "SoftLimit": 80,
      "Status": true
    }
  }
}
```

<div class="infobox">
Please pay special attention to this rate adjustment. As you can see, the original subaccount rate was 1, and the total balance was 50+80. When the new rate was adjusted to 2, the total balance also changed to 100+160. But the actual total usage amount didn't change, because as the rate increased, the subaccount balance also increased. So the next time the parent account recharges the subaccount with a rate of 1, recharging 100 will actually cost the parent account 50. Please understand this billing algorithm.
</div>

## 9. Adjust subaccount rate limit

### Request

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"RPM": 5}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"RPM": 5}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
Parameters can be passed with the account ID or account Name, setting the target subaccount's maximum requests per minute to 5
</div>

## 10. Adjust subaccount email and name

### Request

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"Email": "child-x@163.com"}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"Name": "child-x"}' https://api.proxyxai.com/x-users/7
curl -X PUT -H "Authorization: Bearer $key" -d '{"Name": "child-x", "Email": "child-x@163.com"}' https://api.proxyxai.com/x-users/7
```

<div class="infobox">
Parent account can update the basic attributes of its subaccounts, such as updating the email (Email) and name (Name) fields of the subaccount with ID 7 in this example. Each field can be updated separately or both fields can be updated at the same time.
</div>

## 11. Delete subaccount

### Request

```bash
curl -X DELETE -H "Authorization: Bearer $key"  https://api.proxyxai.com/x-users/7
curl -X DELETE -H "Authorization: Bearer $key"  https://api.proxyxai.com/x-users/child-1
```

### Response

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
When a subaccount is deleted, the subaccount's balance will be refunded to the parent account. In the example above, the subaccount has a balance of 100+160 (account balance)/2 (rate) = 130, which will be refunded to the parent account. This API consumes a $0.2 system handling fee, and the final increase in the parent account balance is 130-0.2=129.8. It should be noted that the refunded balance default validity period is 180 days.
</div>

## 12. Query the basic attributes of the account to which the current key belongs

### Request

```bash
curl -X GET -H "Authorization: Bearer $key" "https://api.proxyxai.com/dashboard/x_user/info"
```

## 13. Query the current key's usage data for a period of time (up to 12 months)

### Request

```bash
curl GET -H "Authorization: Bearer $key"  "https://api.proxyxai.com/dashboard/billing/usage?start_date=2023-08-10&end_date=2023-11-18"
```

## 14. Set a dedicated billing notification email address / custom account alias for subaccount (can be self-adjusted)

### Request

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"BillingEmail": "child-1@qq.com"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"Alias": "bob"}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
By default, the uniqueness of account names and email addresses is a mandatory requirement set by the system, ensuring the independence and security of each account. In other words, the same email address cannot be used to register multiple accounts. However, contrary to this, the setting of billing emails is much more flexible. The system allows multiple accounts to share the same billing email address. In this way, the parent account can consolidate the billing and system notifications of multiple subaccounts into a single email address, making it easier for users to manage and look up, greatly improving management efficiency and user experience. In addition, the personalized setting of account aliases allows users to identify and differentiate accounts in a more distinctive way. With such a design, users can more conveniently grasp the financial and notification information of various accounts, thus achieving efficient account management.
</div>

## 15. Access Control: Add / Remove trusted IP whitelist for subaccount

### Request

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "49.234.158.212"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "118.23.21.0/24 119.24.12.11"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "-49.234.158.212"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "-118.23.21.0/24,119.24.12.11"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "*"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowIPs": "-*"}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
By default, the source IP is not restricted. If the enterprise needs to implement access control for subaccounts, you can set the subaccount to call only within the trusted source IP collection. CIDR format supported. Please note that AllowIPs: "*" means to restore to the default unrestricted state, while AllowIPs: "-*" means to allow only 127.0.0.1 calls.
</div>

## 16. Access Control: Add / Remove Model whitelist for subaccount

### Request

```bash
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "gpt-3.5-turbo"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "gpt-3.5-turbo gpt-4"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "-gpt-3.5-turbo"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "-gpt-3.5-turbo gpt-4"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "*"}' https://api.proxyxai.com/x-users/child-1
curl -X PUT -H "Authorization: Bearer $key" -d '{"AllowModels": "-*"}' https://api.proxyxai.com/x-users/child-1
```

<div class="infobox">
By default, there is no restriction on model calls. If an organization needs to apply access control to subaccounts, you can set up a subaccount to call only the allowed set of models. Please note, AllowModels: "*" means to restore to the default unrestricted state, while AllowModels: "-*" means to ban all model calls.
</div>
