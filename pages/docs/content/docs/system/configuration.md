+++
title = "Configuration Management"
date = 2025-03-01T08:00:00+00:00
updated = 2025-03-16T08:00:00+00:00
draft = false
weight = 2
sort_by = "weight"
template = "docs/page.html"

[extra]
toc = true
top = false
+++

# Configuration Management

XAI provides a powerful configuration management system that allows administrators to dynamically update system settings without service restart.

## Overview

The configuration system manages:
- Model mappings and routing
- Resource access controls
- Email settings
- System behaviors

## Configuration API

### Get Current Configuration

Retrieve all current configuration values.

**Endpoint:** `GET /x-config`

**Response:**
```json
{
  "success": true,
  "configs": {
    "MODEL_MAPPER": "gpt-3.5-turbo=gpt-4,gpt-4-32k=gpt-4",
    "LEVEL_MAPPER": "gpt-4=2,claude-3=2",
    "SWITCH_OVER": "1=2,2=3",
    "RESOURCES": "/v1/chat/completions,/v1/embeddings",
    "XAI_MAIL": "admin@proxyxai.com",
    "EMAIL_SMTP": "smtp.gmail.com",
    "EMAIL_PORT": "587"
  }
}
```

### Update Configuration

Update one or more configuration values.

**Endpoint:** `POST /x-config`

**Request Body:**
```json
{
  "MODEL_MAPPER": "gpt-3.5-turbo=gpt-4,claude-instant=claude-3",
  "LEVEL_MAPPER": "gpt-4=2,claude-3=3",
  "RESOURCES": "/v1/chat/completions,/v1/embeddings,/v1/images/generations"
}
```

**Response:**
```json
{
  "success": true,
  "updated": {
    "MODEL_MAPPER": "gpt-3.5-turbo=gpt-4,claude-instant=claude-3",
    "LEVEL_MAPPER": "gpt-4=2,claude-3=3",
    "RESOURCES": "/v1/chat/completions,/v1/embeddings,/v1/images/generations"
  },
  "message": "Configurations updated successfully"
}
```

### Delete Configuration

Reset configuration to default values.

**Endpoint:** `DELETE /x-config`

**Request Body:**
```json
{
  "keys": ["MODEL_MAPPER", "LEVEL_MAPPER"]
}
```

**Response:**
```json
{
  "success": true,
  "deleted": ["MODEL_MAPPER", "LEVEL_MAPPER"],
  "message": "Configurations deleted successfully (restored to default env)"
}
```

## Configuration Parameters

### MODEL_MAPPER

Maps incoming model requests to different models.

**Format:** `source_model=target_model`

**Examples:**
```
gpt-3.5-turbo=gpt-4
gpt-4-32k=gpt-4
claude-instant=claude-3-sonnet
```

**Use Cases:**
- Upgrade requests from older models
- Route to more cost-effective alternatives
- A/B testing different models

### LEVEL_MAPPER

Maps models to specific key levels for routing.

**Format:** `model=level`

**Examples:**
```
gpt-4=2
claude-3-opus=3
gpt-3.5-turbo=1
```

**Purpose:**
- Route expensive models to premium keys
- Distribute load across key levels
- Control access to specific providers

### SWITCH_OVER

Defines automatic level switching on failures.

**Format:** `from_level=to_level`

**Examples:**
```
1=2    # If level 1 fails, try level 2
2=3    # If level 2 fails, try level 3
3=1    # If level 3 fails, try level 1
```

**Benefits:**
- Automatic failover
- High availability
- Load distribution

### RESOURCES

Defines allowed API endpoints globally.

**Format:** Comma-separated endpoint paths

**Examples:**
```
/v1/chat/completions,/v1/embeddings
/v1/chat/completions,/v1/embeddings,/v1/images/generations,/v1/audio/transcriptions
```

**Security:**
- Restrict access to specific endpoints
- Prevent unauthorized API usage
- Compliance with usage policies

### Email Configuration

Configure email settings for notifications.

**Parameters:**
- `XAI_MAIL` - System notification email
- `EMAIL_SMTP` - SMTP server address
- `EMAIL_PORT` - SMTP port (25, 587, 465)
- `EMAIL_AUTH` - Authentication email
- `EMAIL_PASS` - Authentication password
- `EMAIL_SENDER` - Sender name/email
- `EMAIL_TLS` - Enable TLS (true/false)

**Example:**
```json
{
  "EMAIL_SMTP": "smtp.gmail.com",
  "EMAIL_PORT": "587",
  "EMAIL_AUTH": "notifications@company.com",
  "EMAIL_PASS": "app-specific-password",
  "EMAIL_SENDER": "XAI System <notifications@company.com>",
  "EMAIL_TLS": "true"
}
```

## Advanced Configuration

### System-Wide Settings

Some configurations require root access:

```bash
# Enable logging
curl -X POST https://api.proxyxai.com/x-conf \
  -H "Authorization: Bearer $ROOT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"LogEnable": true}'

# Force key reload
curl -X POST https://api.proxyxai.com/x-conf \
  -H "Authorization: Bearer $ROOT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"LoadKeys": true}'

# Update stats interval
curl -X POST https://api.proxyxai.com/x-conf \
  -H "Authorization: Bearer $ROOT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"StatsInterval": 100}'
```

### Model Limits Configuration

Set global model-specific limits:

```json
{
  "ModelLimits": {
    "gpt-4": {
      "rpm": 100,
      "tpm": 150000
    },
    "claude-3-opus": {
      "rpm": 50,
      "tpm": 100000
    }
  }
}
```

### Dynamic Model Mapping

Use wildcards for flexible routing:

```
gpt-4*=gpt-4
claude-*=claude-3-sonnet
*-vision=gpt-4-vision-preview
```

## Configuration Best Practices

### 1. Model Mapping Strategy

**Development Environment:**
```
gpt-4=gpt-3.5-turbo  # Use cheaper models
claude-3-opus=claude-3-sonnet
```

**Production Environment:**
```
gpt-3.5-turbo=gpt-4  # Upgrade for better quality
claude-instant=claude-3-sonnet
```

### 2. Level Distribution

**Typical Setup:**
```
# Level 1: High-volume, low-cost models
gpt-3.5-turbo=1
claude-instant=1

# Level 2: Standard models
gpt-4=2
claude-3-sonnet=2

# Level 3: Premium models
gpt-4-32k=3
claude-3-opus=3
```

### 3. Failover Configuration

**High Availability:**
```
# Circular failover
1=2
2=3
3=1

# Or hierarchical failover
1=2
2=3
# No 3=X means level 3 doesn't fail over
```

### 4. Resource Security

**Minimal Access:**
```
/v1/chat/completions  # Only chat API
```

**Full Access:**
```
/v1/chat/completions,/v1/embeddings,/v1/images/generations,/v1/audio/transcriptions,/v1/moderations
```

## Configuration Persistence

- Configurations are stored in Redis
- Changes are applied immediately without restart
- Configurations persist across service restarts
- Default values from environment variables are used as fallback

## Monitoring Configuration Changes

Configuration changes are logged and can be monitored:

1. **Through Logs:**
   - All configuration updates are logged
   - Failed updates include error details

2. **Through API:**
   - Query current configuration state
   - Compare with expected values

3. **Through Webhooks:**
   - Set up notifications for configuration changes
   - Monitor critical setting modifications

## Troubleshooting

### Common Issues

1. **Configuration Not Taking Effect:**
   - Verify the configuration was saved successfully
   - Check for syntax errors in mappings
   - Ensure proper permissions for updates

2. **Model Routing Issues:**
   - Verify MODEL_MAPPER syntax
   - Check LEVEL_MAPPER assignments
   - Confirm target models exist

3. **Email Not Working:**
   - Test SMTP credentials
   - Verify port and TLS settings
   - Check firewall rules

### Configuration Validation

Before applying configurations:

1. Test model mappings with sample requests
2. Verify level assignments match available keys
3. Confirm resource paths are valid
4. Test email settings with test message

<div class="infobox">
Configuration changes may affect all users immediately. Test changes in a development environment first. Keep backups of working configurations.
</div>
