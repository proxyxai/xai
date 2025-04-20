+++
title = "Document Parsing Service Guide"
description = "Introducing ProxyXAI"
date = 2025-04-20T09:19:42+00:00
updated = 2025-04-20T09:19:42+00:00
draft = false
template = "blog/page.html"

[taxonomies]
authors = ["Team ProxyXAI"]

+++

Our document parsing service leverages the  `claude-3-7-sonnet-latest,deepseek-r1,mistral-large-latest`  model and ProxyXAI to extract and analyze content from various document formats using AI models (including Anthropic Claude series). The service can process single or multiple documents and provide relevant information based on user queries.

## Supported File Formats

We support parsing for the following 7 document formats:
- PDF (.pdf)
- Text files (.txt, .sh, .py, .js, etc.)
- Word documents (.doc, .docx)
- Excel spreadsheets (.xls, .xlsx)
- CSV files (.csv)
- Markdown files (.md, .markdown)
- HTML files (.html, .htm)

## Usage Limits
- PDF file size must not exceed 4.5MB
- Maximum of 5 files per conversation

## API Endpoints

Our service provides two main API endpoints:

1. `https://api.proxyxai.com/v1/messages` (Production public network, office network calls)
2. `https://api.proxyxai.com/v1/chat/completions` (Production public network, office network calls)

## Usage Examples

Here are several examples of using our document parsing service:

### Example 1: Single Document Processing

Using the `/v1/messages` endpoint to process a single document:

```bash
API_KEY=sk-Xvs....

curl https://dev-api.proxyxai.com/v1/messages \
   -H "content-type: application/json" \
   -H "x-api-key: $API_KEY" \
   -H "anthropic-version: 2023-06-01" \
   -d '{
     "model": "claude-3-7-sonnet-latest",
     "max_tokens": 1024,
     "messages": [{
         "role": "user",
         "content": [{
             "type": "document",
             "source": {
                 "type": "url",
                 "url": "https://cfbed.1314883.xyz/file/1744972227336_test-1.pdf"
             }
         },
         {
             "type": "text",
             "text": "Extract key information from the document"
         }]
     }]
 }'
```

### Example 2: Single Document Processing with Alternative Endpoint

Using the `/v1/chat/completions` endpoint to process a single document:

```bash
API_KEY=sk-Xvs....
curl -X POST "http://dev-api.proxyxai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "claude-3-7-sonnet-latest",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "document",
            "source": {
              "type": "url",
              "url": "https://cfbed.1314883.xyz/file/1744972223519_test.docx"
            }
          },
          {
            "type": "text",
             "text": "Summarize the main content of this document"
          }
        ]
      }
    ],
    "max_tokens": 1000
  }'
```

### Example 3: Multi-Document Processing

Using the `/v1/chat/completions` endpoint to process multiple documents (max 5):

```bash
API_KEY=sk-Xvs....
curl -X POST "http://dev-api.proxyxai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "claude-3-7-sonnet-latest",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "document",
            "source": {
              "type": "url",
              "url": "https://cfbed.1314883.xyz/file/1744972223519_test.xlsx"
            }
          },
          {
            "type": "document",
            "source": {
              "type": "url",
              "url": "https://cfbed.1314883.xyz/file/1744972227336_test.pdf"
            }
          },
          {
            "type": "text",
             "text": "Compare the data differences between these documents"
          }
        ]
      }
    ],
    "max_tokens": 1000
  }'
```

### Example 4: Multi-Document Processing with Alternative Endpoint

Using the `/v1/messages` endpoint to process multiple documents:

```bash
API_KEY=sk-Xvs....
curl https://dev-api.proxyxai.com/v1/messages \
   -H "content-type: application/json" \
   -H "x-api-key: $API_KEY" \
   -H "anthropic-version: 2023-06-01" \
   -d '{
     "model": "claude-3-7-sonnet-latest",
     "max_tokens": 1024,
     "messages": [{
         "role": "user",
         "content": [{
             "type": "document",
             "source": {
                 "type": "url",
                 "url": "https://cfbed.1314883.xyz/file/1744972227336_test.md"
             }
         },
         {
             "type": "document",
             "source": {
                 "type": "url",
                 "url": "https://cfbed.1314883.xyz/file/1744972223519_test.html"
             }
         },
         {
             "type": "text",
             "text": "Analyze the content structure of these documents"
         }]
     }]
 }'
```

Note: Ensure all documents comply with size limits and do not exceed 5 files per request.
