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

# XAI API Reference

Welcome to the XAI API documentation. Our platform provides a comprehensive set of APIs for managing AI services, subaccounts, and resources. This document covers all available endpoints, their functions, parameters, and usage examples.

## API Overview

XAI offers the following API categories:

1. **AI Service Proxy** - OpenAI/Anthropic compatible endpoints
2. **User Management** - Create and manage subaccounts
3. **Key Management** - Manage API keys and providers
4. **Billing & Usage** - Track usage and billing information
5. **Configuration** - System and user configuration
6. **News & Notifications** - System announcements and user notifications

## Authentication

All API requests require authentication using a Bearer token:

```bash
Authorization: Bearer sk-Xvs...
```

## Base URL

```
https://api.proxyxai.com
```

## API Endpoints

### 1. User Management APIs

#### 1.1 Create Subaccount

Create a new subaccount under your account.

**Endpoint:** `POST /x-users`

**Request Body:**
```json
{
  "Name": "subaccount-1",
  "Email": "sub1@example.com",
  "CreditGranted": 100,
  "Alias": "Production Account",
  "Rates": 1.0,
  "HardLimit": 1000,
  "SoftLimit": 800,
  "RPM": 60,
  "TPM": 150000
}
```

**Required Fields:**
- `Name` - Unique account name (4-63 chars, at least 1 letter)
- `Email` - Valid email address
- `CreditGranted` - Initial credit amount (min: 2)

**Optional Fields:**
- `Alias` - Display name (default: same as Name)
- `BillingEmail` - Billing notification email
- `Rates` - Rate multiplier (must be ≥ parent's rate)
- `HardLimit` - Monthly hard limit
- `SoftLimit` - Monthly soft limit (email alert threshold)
- `RPM/RPH/RPD` - Request rate limits
- `TPM/TPH/TPD` - Token rate limits
- `AllowIPs` - IP whitelist
- `AllowModels` - Model whitelist
- `Resources` - API endpoint whitelist

**Example:**
```bash
curl -X POST https://api.proxyxai.com/x-users \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "prod-account",
    "Email": "prod@company.com",
    "CreditGranted": 500,
    "Alias": "Production Environment",
    "RPM": 100,
    "TPM": 200000
  }'
```

**Response:**
```json
{
  "Action": "add",
  "User": {
    "ID": 42,
    "SecretKey": "sk-Xvs...",
    "Updates": {
      "Name": "prod-account",
      "Email": "prod@company.com",
      "CreditGranted": 500,
      "Balance": 500,
      "HardLimit": 5000,
      "SoftLimit": 4000
    }
  }
}
```

#### 1.2 Update Subaccount

Update an existing subaccount's settings.

**Endpoint:** `PUT /x-users/{identifier}`

**Identifier:** Can be user ID, name, or email

**Request Body:**
```json
{
  "CreditGranted": 100,      // Recharge amount (negative for refund)
  "Days": 30,                // Credit expiry days (optional)
  "Rates": 1.5,              // Update rate multiplier
  "Status": true,            // Enable/disable account
  "HardLimit": 2000,         // Update limits
  "AllowModels": "gpt-4* claude-*",  // Model whitelist
  "AllowIPs": "192.168.1.0/24 10.0.0.5",  // IP whitelist
  "ModelLimits": {           // Per-model limits
    "gpt-4": {
      "rpm": 30,
      "tpm": 90000
    }
  }
}
```

**Special Operations:**
- **Recharge:** `"CreditGranted": 100`
- **Refund:** `"CreditGranted": -50`
- **Custom Expiry:** `"CreditGranted": 100, "Days": 90`
- **Reset Whitelist:** `"AllowModels": "*"`
- **Remove from Whitelist:** `"AllowModels": "-gpt-3.5-turbo"`

**Example:**
```bash
# Recharge with 30-day expiry
curl -X PUT https://api.proxyxai.com/x-users/42 \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"CreditGranted": 100, "Days": 30}'

# Update model whitelist
curl -X PUT https://api.proxyxai.com/x-users/prod-account \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"AllowModels": "gpt-4* claude-3*"}'
```

#### 1.3 Get User Information

Retrieve user(s) information.

**Endpoints:**
- `GET /x-users` - Get all direct subaccounts
- `GET /x-users/{identifier}` - Get specific user
- `GET /x-dna` - Get all descendant accounts
- `GET /x-dna/{identifier}` - Get specific descendant

**Query Parameters:**
- `id` - Filter by user ID
- `name` - Filter by username
- `email` - Filter by email
- `level` - Filter by level
- `dna` - Filter by DNA (hierarchy)
- `page` - Page number (default: 1)
- `size` - Page size (max: 1000)

**Special Filters:**
- `L{n}` - Filter by Level (e.g., L1, L2)
- `G{n}` - Filter by Gear
- `R{n}` - Filter by Role
- `T{n}` - Filter by Tier
- `F{n}` - Filter by Factor

**Examples:**
```bash
# Get all subaccounts
curl -X GET https://api.proxyxai.com/x-users \
  -H "Authorization: Bearer $API_KEY"

# Get specific user by ID
curl -X GET https://api.proxyxai.com/x-users/42 \
  -H "Authorization: Bearer $API_KEY"

# Get users by level
curl -X GET "https://api.proxyxai.com/x-users?level=2" \
  -H "Authorization: Bearer $API_KEY"

# Get all descendants with pagination
curl -X GET "https://api.proxyxai.com/x-dna?page=1&size=100" \
  -H "Authorization: Bearer $API_KEY"
```

#### 1.4 Delete Subaccount

Delete a subaccount and refund remaining balance.

**Endpoint:** `DELETE /x-users/{identifier}`

**Note:**
- Remaining balance is automatically refunded to parent account
- A transaction fee of $0.2 is deducted
- Refunded balance has 180-day validity by default

**Example:**
```bash
curl -X DELETE https://api.proxyxai.com/x-users/42 \
  -H "Authorization: Bearer $API_KEY"
```

### 2. Key Management APIs

#### 2.1 Generate New Key

Generate a new API key.

**Endpoint:** `GET /x-gkey`

**Example:**
```bash
curl -X GET https://api.proxyxai.com/x-gkey \
  -H "Authorization: Bearer $API_KEY"
```

#### 2.2 Add Key

Add an external API key to the system.

**Endpoint:** `POST /x-keys`

**Request Body:**
```json
{
  "SecretKey": "sk-...",
  "Name": "Production Key",
  "Level": 1,
  "Provider": "https://api.openai.com",
  "Status": true
}
```

**Example:**
```bash
curl -X POST https://api.proxyxai.com/x-keys \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "SecretKey": "sk-...",
    "Name": "Claude API Key",
    "Level": 2,
    "Provider": "https://api.anthropic.com"
  }'
```

#### 2.3 Update Key

Update key properties.

**Endpoint:** `PUT /x-keys/{id}`

**Request Body:**
```json
{
  "Name": "Updated Name",
  "Level": 2,
  "Status": false,
  "Provider": "https://api.anthropic.com"
}
```

#### 2.4 Get Keys

Retrieve keys with optional filters.

**Endpoints:**
- `GET /x-keys` - Get all keys
- `GET /x-keys/{id}` - Get specific key
- `GET /x-keys?level={n}` - Filter by level
- `GET /x-keys?provider={url}` - Filter by provider

**Example:**
```bash
# Get all keys
curl -X GET https://api.proxyxai.com/x-keys \
  -H "Authorization: Bearer $API_KEY"

# Get keys by level
curl -X GET "https://api.proxyxai.com/x-keys?level=2" \
  -H "Authorization: Bearer $API_KEY"
```

### 3. Billing & Usage APIs

#### 3.1 Get Usage Report

Get detailed usage report for accounts.

**Endpoint:** `GET /x-bill`

**Query Parameters:**
- `u` or `user` - User identifier (ID, name, email, or filter)
- `d` or `date` - Specific date (YYYY-MM-DD)
- `s` or `start` - Start date
- `e` or `end` - End date
- `days` - Number of days from today

**Examples:**
```bash
# Current month usage for all subaccounts
curl -X GET https://api.proxyxai.com/x-bill \
  -H "Authorization: Bearer $API_KEY"

# Specific user's usage for last 30 days
curl -X GET "https://api.proxyxai.com/x-bill?user=prod-account&days=30" \
  -H "Authorization: Bearer $API_KEY"

# Date range query
curl -X GET "https://api.proxyxai.com/x-bill?start=2025-01-01&end=2025-01-31" \
  -H "Authorization: Bearer $API_KEY"

# Filter by user attributes
curl -X GET "https://api.proxyxai.com/x-bill?user=L2" \  # All Level 2 users
  -H "Authorization: Bearer $API_KEY"
```

**Response Structure:**
```json
{
  "object": "list",
  "data": [
    {
      "aggregation_timestamp": 1234567890,
      "n_requests": 1000,
      "n_context_tokens_total": 500000,
      "n_generated_tokens_total": 100000,
      "n_cached_tokens_total": 50000,
      "usage_details": {
        "gpt-4": {
          "requests": 100,
          "prompt": 50000,
          "completion": 10000,
          "cost": 3.5
        }
      }
    }
  ],
  "total_usage": {
    "requests": 10000,
    "cost": 125.50
  },
  "usage_users": [
    {
      "id": 42,
      "name": "prod-account",
      "email": "prod@company.com",
      "total_requests": 5000,
      "total_cost": 62.75,
      "usage_analysis": {
        "request_percentage": 50.0,
        "cost_percentage": 50.0
      }
    }
  ]
}
```

### 4. Dashboard APIs

#### 4.1 User Status

Get current user status and balance.

**Endpoint:** `GET /dashboard/x-user-status`

**Response:**
```json
{
  "object": "user_status",
  "id": 42,
  "name": "prod-account",
  "email": "prod@company.com",
  "balance": 450.25,
  "dna": ".1.42."
}
```

#### 4.2 User Info

Get detailed user information.

**Endpoint:** `GET /dashboard/x-user-info`

**Response includes:**
- Basic user information
- Credit balance details
- Rate limits
- Usage statistics
- Whitelists and restrictions

#### 4.3 User Logs

Get operation logs for the account.

**Endpoint:** `GET /dashboard/x-user-logs`

**Query Parameters:**
- `page` - Page number (default: 1)
- `size` - Page size (default: 24, max: 100)
- `action` - Filter by action type
- `target_id` - Filter by target ID
- `status` - Filter by status

**Response:**
```json
{
  "logs": [
    {
      "id": 123,
      "action": "add_user",
      "operator_id": 1,
      "target_id": 42,
      "details": "Created user with email: prod@company.com",
      "created_at": "2025-01-15 10:30:00"
    }
  ],
  "total": 150,
  "page": 1,
  "size": 24,
  "has_more": true
}
```

### 5. Key Rotation APIs

#### 5.1 Rotate Self Key

Rotate your own API key.

**Endpoint:** `POST /x-self`

**Request Body:**
```json
{
  "confirm": "2025-01-15-ROTATE-SELF"  // Current date + "-ROTATE-SELF"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Self key rotated successfully",
  "rotate": {
    "action": "rotate_self",
    "id": 42,
    "name": "prod-account",
    "key": "sk-Xvs...",  // New key
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### 5.2 Rotate Root Key

Rotate root or specific user's key (root only).

**Endpoint:** `POST /x-root`

**Request Body:**
```json
{
  "name": "target-user",  // Optional, defaults to "root"
  "key": "sk-Xvs...",     // Optional, auto-generated if not provided
  "confirm": "2025-01-15-ROTATE-ROOT"
}
```

### 6. News & Notifications APIs

#### 6.1 Create News

Create news/notifications for users.

**Endpoints:**
- `POST /x-news` - System-wide news (root only)
- `POST /x-news/{target}` - Targeted news

**Target Types:**
- User ID: `/x-news/42`
- Username: `/x-news/prod-account`
- DNA group: `/x-news/.1.42.`

**Request Body:**
```json
{
  "title": "Maintenance Notice",
  "content": "System maintenance scheduled for...",
  "days": 7  // Expiry days (default: 7 for system, 32 for targeted)
}
```

**Example:**
```bash
# Create system news
curl -X POST https://api.proxyxai.com/x-news \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Feature Release",
    "content": "We are excited to announce...",
    "days": 14
  }'

# Create news for specific user
curl -X POST https://api.proxyxai.com/x-news/42 \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Account Update",
    "content": "Your account settings have been updated."
  }'
```

#### 6.2 Get News

Get news/notifications.

**Endpoint:** `GET /dashboard/x-user-news`

**Response:**
```json
{
  "success": true,
  "system_news": [
    {
      "title": "System Update",
      "content": "...",
      "created_at": "2025-01-15T10:00:00Z",
      "expires_at": "2025-01-22T10:00:00Z"
    }
  ],
  "user_news": [
    {
      "title": "Account Update",
      "content": "...",
      "created_at": "2025-01-15T11:00:00Z",
      "expires_at": "2025-02-15T11:00:00Z"
    }
  ]
}
```

#### 6.3 Delete News

Delete news items.

**Endpoints:**
- `DELETE /x-news` - Delete all system news
- `DELETE /x-news/{target}` - Delete targeted news

**Example:**
```bash
# Delete all news for user 42
curl -X DELETE https://api.proxyxai.com/x-news/42 \
  -H "Authorization: Bearer $API_KEY"
```

### 7. Configuration APIs

#### 7.1 Get Configuration

Get current system configuration.

**Endpoint:** `GET /x-config`

**Response:**
```json
{
  "success": true,
  "configs": {
    "MODEL_MAPPER": "gpt-3.5-turbo=gpt-4",
    "LEVEL_MAPPER": "gpt-4=2",
    "RESOURCES": "/v1/chat/completions,/v1/embeddings",
    "XAI_MAIL": "admin@proxyxai.com"
  }
}
```

#### 7.2 Update Configuration

Update system configuration.

**Endpoint:** `POST /x-config`

**Request Body:**
```json
{
  "MODEL_MAPPER": "gpt-3.5-turbo=gpt-4,claude-2=claude-3",
  "LEVEL_MAPPER": "gpt-4=2,claude-3=2",
  "RESOURCES": "/v1/chat/completions,/v1/embeddings"
}
```

**Available Configuration Keys:**
- `MODEL_MAPPER` - Model name mappings
- `LEVEL_MAPPER` - Model to level mappings
- `SWITCH_OVER` - Level switching rules
- `RESOURCES` - Allowed API endpoints
- `XAI_MAIL` - System email
- `EMAIL_*` - Email server settings

## Rate Limiting

The API implements multiple levels of rate limiting:

1. **Request Rate Limits:**
   - `RPM` - Requests per minute
   - `RPH` - Requests per hour
   - `RPD` - Requests per day

2. **Token Rate Limits:**
   - `TPM` - Tokens per minute
   - `TPH` - Tokens per hour
   - `TPD` - Tokens per day

3. **Model-Specific Limits:**
   - Set via `ModelLimits` in user configuration
   - Overrides global limits for specific models

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Description of the error",
    "type": "error_type",
    "code": "error_code"
  }
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Best Practices

1. **Key Management:**
   - Rotate keys regularly using the rotation API
   - Use different keys for different environments
   - Monitor key usage through logs

2. **Rate Limiting:**
   - Set appropriate limits based on usage patterns
   - Use model-specific limits for expensive models
   - Monitor usage to avoid hitting limits

3. **Access Control:**
   - Use IP whitelisting for production environments
   - Restrict model access based on requirements
   - Regularly review and update permissions

4. **Billing:**
   - Monitor usage regularly through billing API
   - Set up soft limits for email alerts
   - Use auto-quota for automatic limit adjustments

5. **Error Handling:**
   - Implement exponential backoff for retries
   - Handle rate limit errors gracefully
   - Log errors for debugging

<div class="infobox">
For real-time support and updates, join our community channels or contact support@proxyxai.com
</div>
