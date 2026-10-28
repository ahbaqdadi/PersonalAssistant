# 🤖 AI Personal Assistant Workflow

A powerful multi-agent Personal Assistant built with **n8n**, designed to automate daily tasks, research, communication, scheduling, content creation, finance tracking, and travel planning.

This workflow combines multiple specialized AI agents into a single assistant that can be accessed through chat or voice commands.

> [!IMPORTANT]
> Credentials are not included in the workflow. An early export contained a SerpAPI key in a request URL; treat that key as compromised and revoke it before using this project. The current workflow uses n8n's SerpAPI credential instead.

## Quick start

1. Download [`workflows/Personal Assistant.json`](workflows/Personal%20Assistant.json).
2. In n8n, choose **Import from File** and select the downloaded workflow.
3. Create the credentials listed below, then assign them to every node showing a credential warning.
4. Re-select the Airtable bases/tables and any Google Drive destination so they point to resources in your account.
5. Keep the workflow inactive while testing. Exercise read-only commands first, then verify every node that can send email, modify a calendar, write files, or create records.
6. Activate the Telegram trigger only after the test run behaves as expected.

The workflow defaults calendar operations to the authenticated Google account's primary calendar. Use least-privilege OAuth scopes and separate test resources where possible.

### Required credentials

| Integration | n8n credential/configuration |
| --- | --- |
| OpenAI and Anthropic | Provider API credentials |
| Telegram | Telegram Bot API credential |
| Gmail, Calendar, Contacts, Docs | Google OAuth credentials with only the scopes you use |
| Airtable | Airtable personal access token and your own base/table selections |
| Tavily and Replicate | HTTP Header Auth credentials |
| SerpAPI | Built-in SerpAPI credential |
| WeatherAPI | HTTP Query Auth credential |
| Perplexity | Perplexity credential |
| FlowGuard | `X-FlowGuard-API-Key` header and the endpoint for your account |

Do not paste tokens into request URLs, prompts, sticky notes, or exported JSON.

---

## ✨ Features

### 📧 Email Management Agent

Manage your inbox without leaving the conversation.

- Draft emails
- Send emails
- Search email history
- Automatically organize emails with labels
- Reply to conversations using existing context
- Email search and retrieval

---

### 📅 Calendar Agent

Keep your schedule organized automatically.

- Create calendar events
- Update existing meetings
- Delete events
- Find available time slots
- Book meetings intelligently
- Google Calendar integration

---

### 💰 Finance Tracker Agent

Track personal expenses with natural language.

- Log expenses automatically
- Categorize spending
- Generate spending reports
- Track food, travel, entertainment, and more
- Airtable integration for storage

Example:

> "Log lunch expense 15€"

---

### 🌍 Travel Agent

Plan trips without manually comparing dozens of websites.

- Search flights
- Search hotels
- Compare travel options
- Find cost-effective recommendations
- Uses SerpAPI for real-time search

Outputs:

- Top 3 recommended flights
- Best-value hotels
- Travel cost comparisons

---

### 📰 Weather & News Agent

Stay informed wherever you are.

- Current weather
- Multi-day forecasts
- Breaking news
- Topic-based news research
- Location-aware responses

Powered by:

- WeatherAPI
- SerpAPI

---

### 🔍 Research Agent

Conduct deep research from multiple sources.

- Quick research mode
- Deep research mode
- Multi-source validation
- Citation support
- Fact-checking

Integrations:

- Tavily
- Perplexity

Ideal for:

- Market research
- Competitive analysis
- Technology research
- Trend discovery

---

### ✍️ Content Creation Agent

Generate complete content pipelines automatically.

- SEO blog post generation
- Automatic article structuring
- H2/H3 heading generation
- Source-backed content
- Google Docs creation
- AI image generation

Powered by:

- Flux (via Replicate)
- Google Docs

---

### 📱 Social Media Calendar Agent

Manage your content strategy.

- Generate content ideas
- Organize content calendars
- Suggest post frameworks
- Approve or reject ideas
- Airtable integration

Supported platforms:

- Instagram
- LinkedIn
- TikTok

---

### 👥 Contact Manager Agent

Access and manage contacts instantly.

- Search Google Contacts
- Find email addresses
- Find phone numbers
- Connect with Calendar Agent
- Simplify meeting scheduling

---

## 🎙️ Voice Commands

The assistant can be controlled directly through Telegram voice messages.

Examples:

```text
Log lunch expense 15€
What's the weather tomorrow?
Find flights from Berlin to Dubai next week
Write a blog post about AI automation
Schedule a meeting with John next Tuesday
```

---

## 💬 Text Commands

The workflow also supports traditional chat interactions.

Examples:

```text
Research AI agents for e-commerce
Reply to the latest email from my manager
Create a content plan for LinkedIn
Show my spending report this month
Find available meeting times next week
```

---

## 🛡️ Cost Protection & Monitoring

This workflow uses **[FlowGuard](https://flow-guard.io)** to monitor and protect AI usage.

Benefits:

- AI cost monitoring
- Request tracking
- Usage analytics
- Budget protection
- Workflow observability
- Performance insights
- Provider-level monitoring
- OpenAI-compatible integration

FlowGuard helps prevent AI workflows from silently burning money while providing visibility into every request.

---

## 🏗️ Tech Stack

- n8n
- OpenAI / Compatible LLM Providers
- FlowGuard
- Telegram
- Google Calendar
- Gmail
- Google Contacts
- Airtable
- Tavily
- Perplexity
- SerpAPI
- WeatherAPI
- Replicate (Flux)
- Google Docs

---

## 🚀 Use Cases

- Personal productivity assistant
- Executive assistant
- AI-powered travel planner
- Research assistant
- Expense tracker
- Content marketing assistant
- Social media planning
- Email management
- Calendar automation

---

## Validation

Validate the export before committing it:

```bash
node --test
node scripts/validate-workflow.mjs
```

The validator checks JSON structure, node and connection integrity, matched Airtable reader/writer routing, accidental hard-coded credentials, and insecure external HTTP URLs. GitHub Actions runs the same check on every pull request and push to `main`.

This is a static check. It cannot verify external credentials, provider quotas, or destructive side effects, so test imported workflows against disposable resources before activation.

---

## 📜 License

This project is available under the [MIT License](LICENSE).
