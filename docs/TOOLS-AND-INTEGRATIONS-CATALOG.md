# Tools, MCPs, APIs & CLIs for AIOS Squads

Comprehensive catalog of tools, MCP servers, APIs, and CLIs that can enhance your squad deliverables.

---

## Table of Contents

1. [MCP Servers (Model Context Protocol)](#1-mcp-servers-model-context-protocol)
2. [AI Agent Frameworks](#2-ai-agent-frameworks)
3. [Web Scraping & Data Extraction](#3-web-scraping--data-extraction)
4. [Search APIs](#4-search-apis)
5. [Workflow Automation](#5-workflow-automation)
6. [Backend as a Service](#6-backend-as-a-service)
7. [UI Generation Tools](#7-ui-generation-tools)
8. [Google APIs & Workspace](#8-google-apis--workspace)
9. [Microsoft Azure & Office 365](#9-microsoft-azure--office-365)
10. [Atlassian (Jira, Confluence, Xray)](#10-atlassian-jira-confluence-xray)
11. [Developer Tools & Code Quality](#11-developer-tools--code-quality)
12. [Integration Recommendations by Squad Type](#12-integration-recommendations-by-squad-type)

---

## 1. MCP Servers (Model Context Protocol)

MCP is the open standard for connecting AI models to external tools. There are **3,000+ MCP servers** available.

### Official Reference Servers

| Server | Purpose | Link |
|--------|---------|------|
| **Filesystem** | Secure file operations | [GitHub](https://github.com/modelcontextprotocol/servers) |
| **Git** | Repository operations | [GitHub](https://github.com/modelcontextprotocol/servers) |
| **Fetch** | Web content fetching | [GitHub](https://github.com/modelcontextprotocol/servers) |
| **Memory** | Knowledge graph-based persistent memory | [GitHub](https://github.com/modelcontextprotocol/servers) |
| **Sequential Thinking** | Problem-solving through thought sequences | [GitHub](https://github.com/modelcontextprotocol/servers) |
| **Time** | Timezone conversion | [GitHub](https://github.com/modelcontextprotocol/servers) |

### Developer Tools MCP

| Server | Purpose | Best For |
|--------|---------|----------|
| **GitHub MCP** | Manage commits, PRs, issues, branches | Version control automation |
| **Playwright MCP** | Browser automation, QA, E2E testing | Testing, scraping |
| **Docker MCP** | Container management, logs, environments | DevOps |
| **Context7** | Library documentation lookup | Always up-to-date docs for coding |

### Data & Search MCP

| Server | Purpose | Best For |
|--------|---------|----------|
| **EXA** | Semantic web search | Research, competitor analysis |
| **Apify** | Web scraping actors | Data extraction |
| **Chroma** | Vector/semantic document search | RAG, embeddings |
| **Qdrant** | High-performance vector search | AI memory |

### Enterprise MCP

| Server | Purpose | Best For |
|--------|---------|----------|
| **Supabase MCP** | Database schema via MCP | Database planning |
| **Salesforce MCP** | CRM data access | Sales automation |
| **AWS Bedrock AgentCore** | Multi-session memory, routing | Enterprise AI |

### Where to Find MCPs

- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers) - Curated list
- [MCP.so](https://mcp.so) - 3,000+ servers indexed
- [Smithery](https://smithery.ai) - 2,200+ servers with installation guides
- [Docker MCP Toolkit](https://www.docker.com/blog/add-mcp-servers-to-claude-code-with-mcp-toolkit/) - 200+ pre-built containerized servers

---

## 2. AI Agent Frameworks

### Top Frameworks (2026)

| Framework | Stars | Best For | Link |
|-----------|-------|----------|------|
| **OpenAI Agents SDK** | 11K+ | Multi-agent workflows, 100+ LLM providers | [GitHub](https://github.com/openai/openai-agents-sdk) |
| **LangChain** | 90K+ | LLM-powered apps, modular tools | [LangChain](https://langchain.com) |
| **AutoGen (Microsoft)** | 35K+ | Multi-agent conversations | [GitHub](https://github.com/microsoft/autogen) |
| **CrewAI** | 20K+ | Team of AI agents | [CrewAI](https://crewai.com) |
| **LlamaIndex** | 35K+ | Data indexing, RAG | [LlamaIndex](https://llamaindex.ai) |
| **LangGraph** | - | Agent workflows with state | [LangChain](https://langchain.com/langgraph) |

### AI Coding Agents

| Tool | Best For | Link |
|------|----------|------|
| **GitHub Copilot** | Code completion, PR reviews | [GitHub](https://github.com/features/copilot) |
| **Cursor** | AI-native IDE | [Cursor](https://cursor.com) |
| **Claude Code** | Terminal-based coding agent | [Anthropic](https://code.claude.com) |
| **Cline** | Open-source VS Code agent | [GitHub](https://github.com/cline/cline) |
| **Amazon Q Developer** | AWS integration, CLI agent | [AWS](https://aws.amazon.com/q/developer/) |

Sources: [Shakudo AI Agent Frameworks](https://www.shakudo.io/blog/top-9-ai-agent-frameworks), [Lindy Best AI Agents](https://www.lindy.ai/blog/best-ai-agent-frameworks), [DataCamp Best AI Agents](https://www.datacamp.com/blog/best-ai-agents)

---

## 3. Web Scraping & Data Extraction

### Apify

Full-stack web scraping platform with **10,000+ ready-made Actors**.

| Feature | Description |
|---------|-------------|
| **Store** | 10,000+ pre-built scrapers |
| **Actors** | Serverless programs for automation |
| **AI Integration** | Works with LangChain, Hugging Face |
| **MCP Server** | Lets Claude discover and use Actors |

**Popular Actors:**
- Amazon product data
- Google Maps listings
- Social media content (Instagram, TikTok, LinkedIn)
- E-commerce scraping
- Lead generation

**Links:** [Apify](https://apify.com), [Apify Store](https://apify.com/store), [Actors Documentation](https://docs.apify.com/platform/actors)

### Firecrawl

Web data API that converts websites into LLM-ready markdown.

| Feature | Description |
|---------|-------------|
| **Scrape** | URL to markdown/structured data |
| **Crawl** | Entire websites |
| **Zero-Selector** | Natural language extraction |
| **Speed** | Results in < 1 second |

**Integrations:** LangChain, Llama Index, CrewAI, Dify, Langflow

**Links:** [Firecrawl](https://www.firecrawl.dev), [GitHub](https://github.com/firecrawl/firecrawl), [Docs](https://docs.firecrawl.dev)

---

## 4. Search APIs

### EXA AI

Semantic web search API built for AI applications.

| Feature | Description |
|---------|-------------|
| **Embeddings-based** | Meaning-based search, not keywords |
| **Filters** | Date, category, domain |
| **Results** | 1-1000s per query |
| **Output** | Links, full text, highlights, summaries |

**Use Cases:** AI research, competitor analysis, content discovery

**Links:** [Exa](https://exa.ai), [API](https://exa.ai/exa-api), [Pricing](https://exa.ai/pricing)

### Context7

Library documentation lookup for AI coding.

| Tool | Purpose |
|------|---------|
| `resolve-library-id` | Convert library name to Context7 ID |
| `get-library-docs` | Fetch documentation chunks |

**Usage:** Add "use context7" to prompts for up-to-date docs.

**Links:** [GitHub](https://github.com/upstash/context7), [npm](https://www.npmjs.com/package/@upstash/context7-mcp), [Smithery](https://smithery.ai/server/@upstash/context7-mcp)

---

## 5. Workflow Automation

### n8n

Visual workflow automation with native AI capabilities.

| Feature | Description |
|---------|-------------|
| **Integrations** | 500+ apps |
| **AI Agents** | LangChain-powered agents |
| **Templates** | 600+ community templates |
| **Human-in-loop** | Approval steps, safety checks |
| **Performance** | 220 executions/second |

**Deployment:** Self-hosted or cloud

**Links:** [n8n](https://n8n.io), [AI Workflows](https://n8n.io/ai/), [GitHub](https://github.com/n8n-io/n8n)

### Other Automation Tools

| Tool | Best For | Link |
|------|----------|------|
| **Zapier** | No-code automation | [Zapier](https://zapier.com) |
| **Make (Integromat)** | Visual workflows | [Make](https://make.com) |
| **Pipedream** | Developer-first workflows | [Pipedream](https://pipedream.com) |

---

## 6. Backend as a Service

### Supabase

Open-source Firebase alternative built on PostgreSQL.

| Feature | Description |
|---------|-------------|
| **Database** | Full Postgres with no cold starts |
| **Auth** | User management, social logins |
| **Edge Functions** | Serverless TypeScript |
| **Realtime** | WebSocket subscriptions |
| **Storage** | S3-compatible file storage |
| **Vector** | pgvector for AI embeddings |
| **MCP Server** | Schema inspection via MCP |

**Security:** Row-Level Security (RLS), SOC 2 compliant

**Links:** [Supabase](https://supabase.com), [Features](https://supabase.com/features), [API Docs](https://supabase.com/docs/guides/api)

### Other BaaS Options

| Service | Best For | Link |
|---------|----------|------|
| **Firebase** | Google ecosystem, NoSQL | [Firebase](https://firebase.google.com) |
| **PlanetScale** | Serverless MySQL | [PlanetScale](https://planetscale.com) |
| **Neon** | Serverless Postgres | [Neon](https://neon.tech) |
| **Convex** | Realtime backend | [Convex](https://convex.dev) |

---

## 7. UI Generation Tools

### Vercel v0

AI-powered UI code generation for Next.js.

| Feature | Description |
|---------|-------------|
| **Input** | Natural language prompts |
| **Output** | React + Tailwind + shadcn/ui |
| **Best For** | Dashboards, marketing pages, prototypes |
| **Free Tier** | 200 credits/month |

**Limitations:** Frontend only, no backend logic

**Links:** [v0](https://v0.app), [Vercel](https://vercel.com), [Review](https://skywork.ai/blog/vercel-v0-review-2025-ai-ui-code-generation-nextjs/)

### Alternatives

| Tool | Description | Link |
|------|-------------|------|
| **Bolt.new** | Full-stack app builder | [Bolt](https://bolt.new) |
| **Lovable** | AI app builder with Supabase | [Lovable](https://lovable.dev) |
| **Replit** | Online IDE with AI | [Replit](https://replit.com) |
| **21st.dev Magic** | Component generation | [21st.dev](https://21st.dev) |

---

## 8. Google APIs & Workspace

### Gemini API

| Feature | Description |
|---------|-------------|
| **Text Generation** | Gemini 2.5 Flash/Pro |
| **Multi-modal** | Text, images, PDFs |
| **Function Calling** | Tool integration |
| **Apps Script** | Direct integration |

**Links:** [Gemini API](https://ai.google.dev/gemini-api/docs/quickstart), [Apps Script](https://developers.google.com/apps-script)

### Google Workspace APIs

| API | Purpose |
|-----|---------|
| **Gmail API** | Read, send, label emails |
| **Drive API** | File management, permissions |
| **Sheets API** | Spreadsheet CRUD |
| **Docs API** | Document manipulation |
| **Calendar API** | Events, scheduling |
| **Forms API** | Form creation, responses |

**Links:** [Workspace APIs](https://developers.google.com/workspace), [Release Notes](https://developers.google.com/workspace/release-notes)

### Google Workspace Studio (Dec 2025)

Create AI agents that work inside Gmail, Drive, Sheets.

| Capability | Description |
|------------|-------------|
| **Gmail Flows** | Labels, drafts, read/unread |
| **Drive Flows** | Folders, permissions, file moves |
| **Sheets Flows** | Row updates, lookups |

**Links:** [Workspace Studio](https://workspaceupdates.googleblog.com/2025/12/workspace-studio.html), [Beginner Guide](https://digitalmicroenterprise.com/google-workspace-studio-beginners-guide)

### Google Workspace MCP Server

Unified AI interface for all Workspace products.

| Product | MCP Available |
|---------|---------------|
| Gmail | Yes |
| Drive | Yes |
| Docs | Yes |
| Sheets | Yes |
| Slides | Yes |
| Calendar | Yes |
| Chat | Yes |

**Link:** [Workspace MCP](https://workspacemcp.com)

### GeminiApp Library (Apps Script)

| Feature | Description |
|---------|-------------|
| Multi-modal | Text, images, PDFs |
| Function Calling | Tool integration |
| Structured Conversations | Chat history |

**Link:** [GitHub](https://github.com/mhawksey/GeminiApp)

---

## 9. Microsoft Azure & Office 365

### Azure DevOps MCP Server (Official Microsoft)

Microsoft's official MCP server brings Azure DevOps directly to AI agents like Claude.

**Installation with Claude Code:**

```bash
# Add to Claude Code
claude mcp add azure-devops -- npx -y @azure-devops/mcp YourOrganization
```

**Claude Desktop Configuration:**

```json
// ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "YourOrganization"],
      "env": {
        "AZURE_DEVOPS_PAT": "your-pat-token"
      }
    }
  }
}
```

**Available Domains (load only what you need):**

| Domain | Capabilities |
|--------|--------------|
| **Work Items** | Create, update, query, transitions |
| **Repos** | Git operations, PRs, branches |
| **Pipelines** | Build & release management |
| **Boards** | Sprint planning, backlogs |
| **Projects** | Project management |

**Use Cases with Claude:**
- Query logs, diagnose failures, recommend fixes
- Trigger patch deployments automatically
- Manage work items with natural language
- Code reviews with Azure Repos context

**Links:** [Microsoft Official Docs](https://learn.microsoft.com/en-us/azure/devops/mcp-server/mcp-server-overview), [GitHub - microsoft/azure-devops-mcp](https://github.com/microsoft/azure-devops-mcp)

### Azure DevOps REST API

Comprehensive REST API for Azure DevOps services.

| Feature | Description |
|---------|-------------|
| **Work Items** | Create, update, query work items |
| **Repos** | Git operations, pull requests, branches |
| **Pipelines** | Build & release management |
| **Boards** | Sprint planning, backlogs |
| **Artifacts** | Package management |

**Python Library: azure-devops**

```python
from azure.devops.connection import Connection
from msrest.authentication import BasicAuthentication
from azure.devops.v7_0.work_item_tracking.models import Wiql

# Authentication via Personal Access Token (PAT)
credentials = BasicAuthentication('', 'your-pat-token')
connection = Connection(base_url='https://dev.azure.com/your-org', creds=credentials)

# Get clients
wit_client = connection.clients.get_work_item_tracking_client()
git_client = connection.clients.get_git_client()
build_client = connection.clients.get_build_client()

# Query work items
wiql = Wiql(query="""
    SELECT [System.Id], [System.Title], [System.State]
    FROM WorkItems
    WHERE [System.TeamProject] = 'MyProject'
    AND [System.State] = 'Active'
    ORDER BY [System.CreatedDate] DESC
""")
results = wit_client.query_by_wiql(wiql).work_items

# Get work item details
for item in results[:10]:
    work_item = wit_client.get_work_item(item.id)
    print(f"{work_item.id}: {work_item.fields['System.Title']}")

# Create work item
from azure.devops.v7_0.work_item_tracking.models import JsonPatchOperation

document = [
    JsonPatchOperation(op="add", path="/fields/System.Title", value="New User Story"),
    JsonPatchOperation(op="add", path="/fields/System.Description", value="Description here"),
    JsonPatchOperation(op="add", path="/fields/System.AssignedTo", value="user@email.com")
]
new_item = wit_client.create_work_item(document, project='MyProject', type='User Story')

# Update work item
update_doc = [
    JsonPatchOperation(op="add", path="/fields/System.State", value="Resolved")
]
wit_client.update_work_item(update_doc, id=new_item.id, project='MyProject')
```

**Advanced: AI-Powered PR Automation**

```python
from openai import AzureOpenAI
from azure.devops.connection import Connection
from msrest.authentication import BasicAuthentication

# Azure OpenAI for PR description generation
ai_client = AzureOpenAI(
    azure_endpoint="https://your-resource.openai.azure.com/",
    api_key="your-key",
    api_version="2024-02-01"
)

# Azure DevOps connection
credentials = BasicAuthentication('', 'your-pat-token')
connection = Connection(base_url='https://dev.azure.com/your-org', creds=credentials)
git_client = connection.clients.get_git_client()

def generate_pr_description(diff_content):
    """Use AI to generate PR description from diff."""
    response = ai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Generate a concise PR description from this code diff. Include: summary, changes made, testing done."},
            {"role": "user", "content": diff_content}
        ]
    )
    return response.choices[0].message.content

def create_ai_pr(repo_id, source_branch, target_branch, title):
    """Create PR with AI-generated description."""
    # Get diff
    diff = git_client.get_diff(repo_id, source_branch, target_branch)

    # Generate description
    description = generate_pr_description(str(diff))

    # Create PR
    from azure.devops.v7_0.git.models import GitPullRequest
    pr = GitPullRequest(
        source_ref_name=f"refs/heads/{source_branch}",
        target_ref_name=f"refs/heads/{target_branch}",
        title=title,
        description=description
    )
    return git_client.create_pull_request(pr, repo_id, project='MyProject')
```

**PowerShell Integration:**

```powershell
# Install Azure DevOps CLI extension
az extension add --name azure-devops

# Authenticate
$env:AZURE_DEVOPS_EXT_PAT = 'your-pat-token'
az devops configure --defaults organization=https://dev.azure.com/your-org project=MyProject

# Create work item
az boards work-item create --type "User Story" --title "New Feature" --assigned-to "user@email.com" --description "Feature description"

# Query work items
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.State] = 'Active'"

# Create pull request
az repos pr create --source-branch feature/my-feature --target-branch main --title "Feature PR" --description "PR description"

# Update work item state
az boards work-item update --id 123 --state "Resolved"

# List pipelines
az pipelines list --output table

# Trigger pipeline
az pipelines run --name "Build-Pipeline" --branch main
```

**Links:** [Azure DevOps REST API](https://learn.microsoft.com/en-us/rest/api/azure/devops/), [azure-devops-python-api](https://github.com/microsoft/azure-devops-python-api), [Az CLI DevOps](https://learn.microsoft.com/en-us/cli/azure/devops)

### Microsoft 365 Connector for Claude (Official)

Official Anthropic connector for Microsoft 365 integration with Claude.

**Availability:** Claude Team and Enterprise plans

**Capabilities:**

| Service | Features |
|---------|----------|
| **SharePoint/OneDrive** | Search and analyze documents across sites |
| **Outlook** | Access email threads, analyze patterns |
| **Teams** | Search chats, channels, meeting summaries |

**Setup Requirements:**
1. Microsoft Entra Global Administrator completes one-time setup
2. Search for "M365 MCP Server for Claude" in Entra admin center
3. Configure permissions (read-only access)
4. Users authenticate with their Microsoft 365 accounts

**Security:**
- Uses delegated permissions (users only access their data)
- Read-only access (Claude can search but not modify)
- SharePoint search requires Sites.Read.All

**Links:** [Claude M365 Connector Guide](https://support.claude.com/en/articles/12542951-enabling-and-using-the-microsoft-365-connector), [Microsoft Marketplace](https://marketplace.microsoft.com/en-us/product/saas/anthropic.microsoft-365-connector-for-claude)

### Microsoft 365 MCP Server (Community)

Open-source MCP server for Microsoft 365 via Graph API.

**Configuration:**

```json
// ~/.claude.json or claude_desktop_config.json
{
  "mcpServers": {
    "ms-365": {
      "command": "uvx",
      "args": ["ms-365-mcp-server"],
      "env": {
        "MS365_CLIENT_ID": "your-client-id",
        "MS365_CLIENT_SECRET": "your-client-secret",
        "MS365_TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

**Available Tools:**
- Teams & Chats management
- SharePoint Sites access
- Shared mailboxes
- Calendar operations

**Links:** [GitHub - Softeria/ms-365-mcp-server](https://github.com/Softeria/ms-365-mcp-server)

### Microsoft Graph API

Unified API for Microsoft 365 services.

| Service | Capabilities |
|---------|--------------|
| **Outlook** | Emails, calendar, contacts |
| **OneDrive** | Files, folders, sharing |
| **Teams** | Messages, channels, meetings |
| **SharePoint** | Sites, lists, documents |
| **Users** | Profile, groups, directory |

**Python Library: python-o365 (Comprehensive)**

```python
from O365 import Account

# OAuth2 authentication (application flow)
credentials = ('client_id', 'client_secret')
account = Account(credentials, auth_flow_type='credentials', tenant_id='your-tenant-id')

if account.authenticate():
    # ===== MAILBOX OPERATIONS =====
    mailbox = account.mailbox()
    inbox = mailbox.inbox_folder()

    # Read emails with filters
    messages = inbox.get_messages(limit=25, query="isRead eq false")
    for msg in messages:
        print(f"From: {msg.sender.address}")
        print(f"Subject: {msg.subject}")
        print(f"Body: {msg.body_preview}")

        # Mark as read
        msg.mark_as_read()

        # Reply
        reply = msg.reply()
        reply.body = "Thanks for your email!"
        reply.send()

    # Send new email with attachment
    m = account.new_message()
    m.to.add(['recipient@email.com'])
    m.cc.add(['cc@email.com'])
    m.subject = 'Report Attached'
    m.body = '<h1>Monthly Report</h1><p>Please find attached.</p>'
    m.attachments.add('report.pdf')
    m.send()

    # ===== CALENDAR OPERATIONS =====
    schedule = account.schedule()
    calendar = schedule.get_default_calendar()

    # Get events for next 7 days
    from datetime import datetime, timedelta
    start = datetime.now()
    end = start + timedelta(days=7)
    events = calendar.get_events(start=start, end=end)

    for event in events:
        print(f"{event.subject}: {event.start} - {event.end}")

    # Create event
    new_event = calendar.new_event()
    new_event.subject = "Team Meeting"
    new_event.start = datetime(2026, 2, 10, 14, 0)
    new_event.end = datetime(2026, 2, 10, 15, 0)
    new_event.location = "Conference Room A"
    new_event.attendees.add(['attendee@email.com'])
    new_event.save()

    # ===== ONEDRIVE OPERATIONS =====
    storage = account.storage()
    drive = storage.get_default_drive()
    root = drive.get_root_folder()

    # List files
    items = root.get_items()
    for item in items:
        print(f"{item.name} - {'Folder' if item.is_folder else 'File'}")

    # Upload file
    root.upload_file('local_file.docx')

    # Download file
    item = drive.get_item_by_path('/Documents/report.xlsx')
    item.download('./downloads/')

    # ===== SHAREPOINT OPERATIONS =====
    sharepoint = account.sharepoint()
    site = sharepoint.get_site('your-tenant.sharepoint.com', '/sites/TeamSite')
    lists = site.get_lists()

    for lst in lists:
        print(f"List: {lst.name}")
        items = lst.get_items()
        for item in items:
            print(f"  - {item.fields}")
```

**Microsoft Graph SDK (Official - Async):**

```python
import asyncio
from azure.identity import ClientSecretCredential
from msgraph import GraphServiceClient
from msgraph.generated.users.item.send_mail.send_mail_post_request_body import SendMailPostRequestBody
from msgraph.generated.models import Message, ItemBody, BodyType, Recipient, EmailAddress

async def main():
    credential = ClientSecretCredential(
        tenant_id='your-tenant-id',
        client_id='your-client-id',
        client_secret='your-client-secret'
    )

    client = GraphServiceClient(credentials=credential)

    # Get all users
    users = await client.users.get()
    for user in users.value:
        print(f"{user.display_name} - {user.mail}")

    # Get specific user's calendar
    events = await client.users.by_user_id('user@email.com').calendar.events.get()

    # Send email
    message = Message(
        subject="Hello from Graph SDK",
        body=ItemBody(content="Email body here", content_type=BodyType.Text),
        to_recipients=[
            Recipient(email_address=EmailAddress(address="recipient@email.com"))
        ]
    )
    request_body = SendMailPostRequestBody(message=message)
    await client.users.by_user_id('sender@email.com').send_mail.post(request_body)

    # Post to Teams channel
    from msgraph.generated.models import ChatMessage, ItemBody
    chat_message = ChatMessage(body=ItemBody(content="Hello Team!"))
    await client.teams.by_team_id('team-id').channels.by_channel_id('channel-id').messages.post(chat_message)

asyncio.run(main())
```

**PowerShell Module: Microsoft.Graph (Enterprise Toolkit)**

```powershell
# Install module
Install-Module Microsoft.Graph -Scope CurrentUser

# Connect with specific scopes
Connect-MgGraph -Scopes "User.Read.All", "Mail.ReadWrite", "Calendars.ReadWrite", "Files.ReadWrite.All"

# ===== USER MANAGEMENT =====
# Get all users
Get-MgUser -All | Select-Object DisplayName, Mail, UserPrincipalName

# Get user by ID
$user = Get-MgUser -UserId "user@email.com"

# Create new user
$passwordProfile = @{
    Password = "SecurePassword123!"
    ForceChangePasswordNextSignIn = $true
}
New-MgUser -DisplayName "John Doe" -MailNickname "johnd" -UserPrincipalName "johnd@contoso.com" -PasswordProfile $passwordProfile -AccountEnabled

# ===== EMAIL OPERATIONS =====
# Get inbox messages
Get-MgUserMessage -UserId "user@email.com" -Top 10 | Select-Object Subject, From, ReceivedDateTime

# Send email
$params = @{
    Message = @{
        Subject = "Weekly Report"
        Body = @{
            ContentType = "HTML"
            Content = "<h1>Report</h1><p>Details here</p>"
        }
        ToRecipients = @(
            @{ EmailAddress = @{ Address = "recipient@email.com" } }
        )
        Attachments = @(
            @{
                "@odata.type" = "#microsoft.graph.fileAttachment"
                Name = "report.pdf"
                ContentType = "application/pdf"
                ContentBytes = [Convert]::ToBase64String([IO.File]::ReadAllBytes("./report.pdf"))
            }
        )
    }
}
Send-MgUserMail -UserId "sender@email.com" -BodyParameter $params

# ===== CALENDAR OPERATIONS =====
# Get calendar events
Get-MgUserCalendarEvent -UserId "user@email.com" | Select-Object Subject, Start, End

# Create calendar event
$eventParams = @{
    Subject = "Project Review"
    Start = @{ DateTime = "2026-02-10T14:00:00"; TimeZone = "Pacific Standard Time" }
    End = @{ DateTime = "2026-02-10T15:00:00"; TimeZone = "Pacific Standard Time" }
    Location = @{ DisplayName = "Conference Room B" }
    Attendees = @(
        @{ EmailAddress = @{ Address = "attendee@email.com" }; Type = "required" }
    )
}
New-MgUserCalendarEvent -UserId "user@email.com" -BodyParameter $eventParams

# ===== TEAMS OPERATIONS =====
# List teams
Get-MgUserJoinedTeam -UserId "user@email.com" | Select-Object DisplayName, Id

# Get team channels
Get-MgTeamChannel -TeamId "team-id" | Select-Object DisplayName, Id

# Post message to channel
$messageParams = @{
    Body = @{
        Content = "Hello from PowerShell!"
    }
}
New-MgTeamChannelMessage -TeamId "team-id" -ChannelId "channel-id" -BodyParameter $messageParams
```

**Links:** [Microsoft Graph](https://developer.microsoft.com/en-us/graph), [python-o365](https://github.com/O365/python-o365), [Microsoft Graph SDK Python](https://github.com/microsoftgraph/msgraph-sdk-python), [Microsoft.Graph PowerShell](https://learn.microsoft.com/en-us/powershell/microsoftgraph/)

### Azure OpenAI Integration

AI-powered automation for DevOps workflows.

| Use Case | Description |
|----------|-------------|
| **PR Reviews** | Automated code review with GPT |
| **Work Item Generation** | Create stories from descriptions |
| **Documentation** | Auto-generate docs from code |
| **Test Generation** | Create unit tests automatically |

**Integration Pattern:**

```python
from openai import AzureOpenAI
from azure.devops.connection import Connection

# Azure OpenAI client
ai_client = AzureOpenAI(
    azure_endpoint="https://your-resource.openai.azure.com/",
    api_key="your-key",
    api_version="2024-02-01"
)

# Generate PR description
def generate_pr_description(diff):
    response = ai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Generate a PR description from this diff"},
            {"role": "user", "content": diff}
        ]
    )
    return response.choices[0].message.content
```

**Links:** [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service), [Python SDK](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart)

---

## 10. Atlassian (Jira, Confluence, Xray)

### Atlassian MCP Server (Official)

Official Atlassian Remote MCP Server for Claude integration.

**Status:** Beta (expanding to more products soon)

**Setup with Claude Code:**

```bash
# Add Atlassian MCP to Claude Code
claude mcp add atlassian -- npx -y @anthropic/atlassian-remote-mcp-server
```

**Claude Desktop Configuration:**

```json
// ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@anthropic/atlassian-remote-mcp-server"],
      "env": {
        "ATLASSIAN_API_TOKEN": "your-api-token",
        "ATLASSIAN_EMAIL": "email@example.com",
        "ATLASSIAN_DOMAIN": "your-instance.atlassian.net"
      }
    }
  }
}
```

**Available Tools:**

| Tool | Purpose |
|------|---------|
| `jira_create_issue` | Create Jira issues |
| `jira_search` | JQL search |
| `jira_get_issue` | Get issue details |
| `jira_update_issue` | Update issue fields |
| `confluence_create_page` | Create wiki pages |
| `confluence_search` | Search documentation |
| `confluence_get_page` | Get page content |

**Use Cases with Claude:**
- "Create 5 new Jira tickets for this project"
- "Search for all bugs assigned to me"
- "Create a Confluence page from this spec"
- "Link Confluence docs to Jira issues"

**Security:** Uses your existing permissions. Atlassian recommends:
- Use least privilege principle
- Review high-impact changes before confirming
- Monitor audit logs

**Known Issue:** Some users report needing to re-authenticate multiple times daily.

**Links:** [Atlassian Blog Announcement](https://www.atlassian.com/blog/announcements/remote-mcp-server), [GitHub - atlassian/atlassian-mcp-server](https://github.com/atlassian/atlassian-mcp-server), [Setup Guide](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/setting-up-clients/)

### Community Atlassian MCP (Alternative)

More comprehensive community MCP server.

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://your-instance.atlassian.net",
        "JIRA_USERNAME": "email@example.com",
        "JIRA_API_TOKEN": "your-api-token",
        "CONFLUENCE_URL": "https://your-instance.atlassian.net/wiki",
        "CONFLUENCE_USERNAME": "email@example.com",
        "CONFLUENCE_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Links:** [GitHub - sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian)

### Jira API

Complete REST API for project and issue management.

| Feature | Endpoint |
|---------|----------|
| **Issues** | Create, update, search, transitions |
| **Projects** | Boards, sprints, versions |
| **Users** | Assignment, permissions |
| **Webhooks** | Event notifications |

**Python Library: atlassian-python-api (Comprehensive)**

```python
from atlassian import Jira

# Authentication (Cloud) - use API token, not password
jira = Jira(
    url='https://your-instance.atlassian.net',
    username='email@example.com',
    password='your-api-token'
)

# ===== ISSUE OPERATIONS =====

# Create issue with all fields
new_issue = jira.issue_create(
    fields={
        'project': {'key': 'PROJ'},
        'summary': 'Issue summary',
        'description': {
            'type': 'doc',
            'version': 1,
            'content': [
                {
                    'type': 'paragraph',
                    'content': [{'type': 'text', 'text': 'Detailed description'}]
                }
            ]
        },
        'issuetype': {'name': 'Story'},
        'priority': {'name': 'High'},
        'assignee': {'accountId': 'user-account-id'},
        'labels': ['frontend', 'urgent'],
        'components': [{'name': 'UI'}],
        'customfield_10001': 'Custom value'  # Story points, etc.
    }
)
print(f"Created: {new_issue['key']}")

# Search issues with JQL (comprehensive)
jql = '''
    project = PROJ
    AND status IN ("To Do", "In Progress")
    AND assignee = currentUser()
    AND sprint IN openSprints()
    ORDER BY priority DESC, created DESC
'''
issues = jira.jql(jql, limit=50, fields='summary,status,priority,assignee')

for issue in issues['issues']:
    print(f"{issue['key']}: {issue['fields']['summary']}")
    print(f"  Status: {issue['fields']['status']['name']}")
    print(f"  Priority: {issue['fields']['priority']['name']}")

# Update issue
jira.issue_update(
    issue_key='PROJ-123',
    fields={
        'summary': 'Updated summary',
        'description': 'New description',
        'priority': {'name': 'Critical'}
    }
)

# Transition issue with comment
jira.issue_transition(
    issue_key='PROJ-123',
    transition='In Progress'
)

# Add comment (Atlassian Document Format)
jira.issue_add_comment(
    issue_key='PROJ-123',
    comment={
        'type': 'doc',
        'version': 1,
        'content': [
            {
                'type': 'paragraph',
                'content': [
                    {'type': 'text', 'text': 'Work started on this issue. '},
                    {'type': 'mention', 'attrs': {'id': 'user-account-id', 'text': '@John'}}
                ]
            }
        ]
    }
)

# Link issues
jira.create_issue_link({
    'type': {'name': 'Blocks'},
    'inwardIssue': {'key': 'PROJ-123'},
    'outwardIssue': {'key': 'PROJ-456'}
})

# ===== SPRINT OPERATIONS =====

# Get active sprint
board_id = 1
sprints = jira.get_all_sprints_from_board(board_id, state='active')
active_sprint = sprints['values'][0] if sprints['values'] else None

# Get sprint issues
if active_sprint:
    sprint_issues = jira.get_sprint_issues(active_sprint['id'], limit=100)
    for issue in sprint_issues['issues']:
        print(f"{issue['key']}: {issue['fields']['summary']}")

# Move issues to sprint
jira.add_issues_to_sprint(
    sprint_id=active_sprint['id'],
    issue_keys=['PROJ-124', 'PROJ-125', 'PROJ-126']
)

# ===== BULK OPERATIONS =====

# Bulk create issues
issues_to_create = [
    {'project': {'key': 'PROJ'}, 'summary': f'Task {i}', 'issuetype': {'name': 'Task'}}
    for i in range(1, 11)
]
created = jira.create_issues(issues_to_create)

# Bulk update (using JQL)
issues_to_update = jira.jql('project = PROJ AND labels = "needs-review"')
for issue in issues_to_update['issues']:
    jira.issue_update(issue['key'], fields={'labels': ['reviewed']})
```

**jira Python Library (alternative with more features):**

```python
from jira import JIRA
from jira.exceptions import JIRAError

# Connect
jira = JIRA(
    server='https://your-instance.atlassian.net',
    basic_auth=('email@example.com', 'api-token')
)

# Search with pagination
all_issues = []
start = 0
max_results = 50

while True:
    issues = jira.search_issues(
        'project = PROJ AND status != Done',
        startAt=start,
        maxResults=max_results,
        fields='summary,status,assignee,priority'
    )
    all_issues.extend(issues)
    if len(issues) < max_results:
        break
    start += max_results

print(f"Total issues: {len(all_issues)}")

# Watch issue
jira.add_watcher('PROJ-123', 'username')

# Add attachment
jira.add_attachment('PROJ-123', 'screenshot.png')

# Get issue changelog
issue = jira.issue('PROJ-123', expand='changelog')
for history in issue.changelog.histories:
    for item in history.items:
        print(f"{history.created}: {item.field} changed from {item.fromString} to {item.toString}")

# Work log
jira.add_worklog('PROJ-123', timeSpent='2h', comment='Worked on implementation')
```

**Links:** [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/), [atlassian-python-api](https://github.com/atlassian-api/atlassian-python-api), [jira library](https://jira.readthedocs.io/)

### Confluence API

Wiki and documentation management.

| Feature | Endpoint |
|---------|----------|
| **Pages** | Create, update, delete |
| **Spaces** | Manage workspaces |
| **Attachments** | File uploads |
| **Search** | CQL queries |

**Python Library: atlassian-python-api**

```python
from atlassian import Confluence

confluence = Confluence(
    url='https://your-instance.atlassian.net',
    username='email@example.com',
    password='api-token'
)

# Create page
page = confluence.create_page(
    space='SPACE',
    title='New Page',
    body='<h1>Content</h1><p>Page content here</p>',
    parent_id=12345  # Optional parent page
)

# Update page
confluence.update_page(
    page_id=67890,
    title='Updated Title',
    body='<p>New content</p>'
)

# Get page content
page = confluence.get_page_by_title(space='SPACE', title='Page Title')
content = confluence.get_page_by_id(page_id=page['id'], expand='body.storage')

# Search (CQL)
results = confluence.cql('space = SPACE AND type = page AND text ~ "search term"')

# Attach file
confluence.attach_file(
    filename='document.pdf',
    page_id=67890,
    content_type='application/pdf'
)
```

**Links:** [Confluence REST API](https://developer.atlassian.com/cloud/confluence/rest/v2/), [atlassian-python-api](https://github.com/atlassian-api/atlassian-python-api)

### Xray for Jira (Test Management)

Test case management integrated with Jira. Trusted by 10M+ testers at 10,000+ companies.

| Feature | Description |
|---------|-------------|
| **Test Cases** | Create, organize, version |
| **Test Executions** | Run tests, record results |
| **Test Plans** | Group test executions |
| **Requirements** | Link tests to stories |
| **Frameworks** | Cucumber, pytest, JUnit, Robot |

### pytest-jira-xray Plugin

Official pytest plugin for Xray integration.

**Installation:**

```bash
pip install pytest-jira-xray
```

**Environment Variables:**

```bash
# For Xray Cloud
export XRAY_API_BASE_URL="https://xray.cloud.getxray.app"
export XRAY_CLIENT_ID="your-client-id"
export XRAY_CLIENT_SECRET="your-client-secret"

# For Xray Server/DC
export XRAY_API_BASE_URL="https://jira.your-company.com"
export XRAY_API_USER="username"
export XRAY_API_PASSWORD="password"

# Optional: Test execution metadata
export XRAY_EXECUTION_TEST_ENVIRONMENTS="Chrome Firefox Safari"
export XRAY_EXECUTION_FIX_VERSION="1.0.0"
export XRAY_EXECUTION_SUMMARY="Regression Test Suite"
```

**Marking Tests:**

```python
# test_example.py
import pytest

# Single test case
@pytest.mark.xray('TEST-001')
def test_login_success():
    """Test successful login flow."""
    assert login('user', 'pass') == True

# Multiple test cases (both marked pass/fail together)
@pytest.mark.xray(['TEST-002', 'TEST-003'])
def test_user_registration():
    """Test user registration with email verification."""
    user = register_user('test@email.com', 'password123')
    assert user.is_verified == False
    verify_email(user)
    assert user.is_verified == True

# With defect linking
@pytest.mark.xray('TEST-004', defects=['BUG-101', 'BUG-102'])
def test_checkout_flow():
    """Test checkout with known defects."""
    # Defects are always included regardless of test outcome
    cart = add_to_cart('product-1', quantity=2)
    assert checkout(cart) == 'success'

# Parameterized tests
@pytest.mark.parametrize('browser', ['chrome', 'firefox', 'safari'])
@pytest.mark.xray('TEST-005')
def test_cross_browser(browser):
    """Test cross-browser compatibility."""
    driver = get_driver(browser)
    assert driver.get('https://example.com').status == 200
```

**Running Tests:**

```bash
# Basic run (Xray Server/DC)
pytest --jira-xray tests/

# Xray Cloud (different result format)
pytest --jira-xray --cloud tests/

# With Client ID/Secret authentication (Cloud)
pytest --jira-xray --cloud --client-secret-auth tests/

# With API Key authentication (Server/DC)
pytest --jira-xray --api-key-auth tests/

# Generate JUnit XML for manual import
pytest --junitxml=results.xml tests/
```

**CI/CD Integration (GitHub Actions):**

```yaml
# .github/workflows/tests.yml
name: Run Tests and Report to Xray

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest-jira-xray

      - name: Run tests and report to Xray
        env:
          XRAY_CLIENT_ID: ${{ secrets.XRAY_CLIENT_ID }}
          XRAY_CLIENT_SECRET: ${{ secrets.XRAY_CLIENT_SECRET }}
          XRAY_EXECUTION_SUMMARY: "CI Build #${{ github.run_number }}"
          XRAY_EXECUTION_FIX_VERSION: ${{ github.ref_name }}
        run: |
          pytest --jira-xray --cloud --client-secret-auth tests/ -v
```

### Xray REST API (Direct Integration)

**Complete Python Client:**

```python
import requests
from typing import Optional, List, Dict
import json

class XrayClient:
    """Xray Cloud API client."""

    def __init__(self, client_id: str, client_secret: str):
        self.base_url = "https://xray.cloud.getxray.app/api/v2"
        self.token = self._authenticate(client_id, client_secret)
        self.headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

    def _authenticate(self, client_id: str, client_secret: str) -> str:
        """Authenticate and get bearer token."""
        response = requests.post(
            f"{self.base_url}/authenticate",
            json={'client_id': client_id, 'client_secret': client_secret}
        )
        response.raise_for_status()
        return response.text.strip('"')

    # ===== TEST MANAGEMENT =====

    def create_test(self, project_key: str, summary: str, test_type: str = 'Manual',
                    steps: Optional[List[Dict]] = None) -> Dict:
        """Create a new test case."""
        # First create the Jira issue via Jira API
        # Then update with Xray-specific fields
        pass

    def get_test(self, test_key: str) -> Dict:
        """Get test case details."""
        response = requests.get(
            f"{self.base_url}/export/test?keys={test_key}",
            headers=self.headers
        )
        return response.json()

    # ===== TEST EXECUTION =====

    def import_junit_results(self, project_key: str, xml_file: str,
                             test_plan_key: Optional[str] = None,
                             test_environments: Optional[List[str]] = None) -> Dict:
        """Import JUnit XML test results."""
        params = {'projectKey': project_key}
        if test_plan_key:
            params['testPlanKey'] = test_plan_key
        if test_environments:
            params['testEnvironments'] = ';'.join(test_environments)

        with open(xml_file, 'rb') as f:
            response = requests.post(
                f"{self.base_url}/import/execution/junit",
                headers={**self.headers, 'Content-Type': 'application/xml'},
                params=params,
                data=f.read()
            )
        response.raise_for_status()
        return response.json()

    def import_cucumber_results(self, project_key: str, json_file: str) -> Dict:
        """Import Cucumber JSON test results."""
        with open(json_file, 'rb') as f:
            response = requests.post(
                f"{self.base_url}/import/execution/cucumber",
                headers=self.headers,
                params={'projectKey': project_key},
                data=f.read()
            )
        response.raise_for_status()
        return response.json()

    def import_robot_results(self, project_key: str, xml_file: str) -> Dict:
        """Import Robot Framework XML results."""
        with open(xml_file, 'rb') as f:
            response = requests.post(
                f"{self.base_url}/import/execution/robot",
                headers={**self.headers, 'Content-Type': 'application/xml'},
                params={'projectKey': project_key},
                data=f.read()
            )
        response.raise_for_status()
        return response.json()

    def create_test_execution(self, project_key: str, summary: str,
                               test_keys: List[str],
                               test_plan_key: Optional[str] = None) -> Dict:
        """Create a test execution with specific tests."""
        payload = {
            "info": {
                "project": project_key,
                "summary": summary,
                "testPlanKey": test_plan_key
            },
            "tests": [{"testKey": key} for key in test_keys]
        }
        response = requests.post(
            f"{self.base_url}/import/execution",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def update_test_run(self, test_exec_key: str, test_key: str,
                        status: str, comment: Optional[str] = None) -> Dict:
        """Update individual test run status."""
        payload = {
            "testExecutionKey": test_exec_key,
            "tests": [{
                "testKey": test_key,
                "status": status,  # PASSED, FAILED, TODO, EXECUTING
                "comment": comment
            }]
        }
        response = requests.post(
            f"{self.base_url}/import/execution",
            headers=self.headers,
            json=payload
        )
        return response.json()

    # ===== EXPORT =====

    def export_tests_to_cucumber(self, test_keys: List[str]) -> str:
        """Export tests as Cucumber feature files."""
        response = requests.get(
            f"{self.base_url}/export/cucumber",
            headers=self.headers,
            params={'keys': ';'.join(test_keys)}
        )
        return response.text


# Usage example
if __name__ == '__main__':
    import os

    client = XrayClient(
        client_id=os.environ['XRAY_CLIENT_ID'],
        client_secret=os.environ['XRAY_CLIENT_SECRET']
    )

    # Import JUnit results
    result = client.import_junit_results(
        project_key='PROJ',
        xml_file='test-results/junit.xml',
        test_plan_key='PROJ-100',
        test_environments=['Chrome', 'Windows 11']
    )
    print(f"Created execution: {result['key']}")

    # Update specific test
    client.update_test_run(
        test_exec_key=result['key'],
        test_key='PROJ-TEST-001',
        status='PASSED',
        comment='All assertions passed'
    )
```

**Links:** [Xray Cloud API](https://docs.getxray.app/display/XRAYCLOUD/REST+API), [Xray Server API](https://docs.getxray.app/display/XRAY/REST+API), [pytest-jira-xray](https://pypi.org/project/pytest-jira-xray/), [GitHub](https://github.com/fundakol/pytest-jira-xray)

### Atlassian MCP Server

MCP server for Claude integration with Atlassian products.

**Configuration:**

```json
// ~/.claude.json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@anthropic/atlassian-remote-mcp-server"],
      "env": {
        "ATLASSIAN_API_TOKEN": "your-api-token",
        "ATLASSIAN_EMAIL": "email@example.com",
        "ATLASSIAN_DOMAIN": "your-instance.atlassian.net"
      }
    }
  }
}
```

**Available Tools:**

| Tool | Purpose |
|------|---------|
| `jira_create_issue` | Create Jira issues |
| `jira_search` | JQL search |
| `jira_get_issue` | Get issue details |
| `confluence_create_page` | Create wiki pages |
| `confluence_search` | Search documentation |

**Links:** [Atlassian Remote MCP](https://www.npmjs.com/package/@anthropic/atlassian-remote-mcp-server), [Setup Guide](https://www.atlassian.com/blog/developer/remote-mcp-server)

### CI/CD Integration

**GitHub Actions with Jira:**

```yaml
# .github/workflows/jira-integration.yml
name: Jira Integration
on:
  push:
    branches: [main]
  pull_request:

jobs:
  update-jira:
    runs-on: ubuntu-latest
    steps:
      - name: Login to Jira
        uses: atlassian/gajira-login@v3
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

      - name: Transition Issue
        uses: atlassian/gajira-transition@v3
        with:
          issue: PROJ-123
          transition: "In Progress"

      - name: Add Comment
        uses: atlassian/gajira-comment@v3
        with:
          issue: PROJ-123
          comment: "Build ${{ github.run_number }} completed"
```

**Azure DevOps Integration:**

```yaml
# azure-pipelines.yml
trigger:
  - main

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        steps:
          - script: |
              curl -X POST \
                -H "Authorization: Basic $(echo -n email:$(JIRA_TOKEN) | base64)" \
                -H "Content-Type: application/json" \
                -d '{"transition": {"id": "31"}}' \
                "https://your-instance.atlassian.net/rest/api/3/issue/PROJ-123/transitions"
            displayName: 'Update Jira'
```

---

## 11. Developer Tools & Code Quality

### Code Review & Quality

| Tool | Purpose | Link |
|------|---------|------|
| **CodeRabbit** | AI code review, line-by-line feedback | [CodeRabbit](https://coderabbit.ai) |
| **Greptile** | AI tools that understand your codebase | [Greptile](https://greptile.com) |
| **SonarQube** | Code quality, security | [SonarQube](https://sonarqube.org) |

### CLI Tools

| Tool | Purpose | Link |
|------|---------|------|
| **GitHub CLI** | GitHub operations from terminal | [gh](https://cli.github.com) |
| **Vercel CLI** | Deploy to Vercel | [Vercel CLI](https://vercel.com/docs/cli) |
| **Supabase CLI** | Database management | [Supabase CLI](https://supabase.com/docs/reference/cli) |
| **Railway CLI** | Infrastructure deployment | [Railway](https://railway.app) |

---

## 12. Integration Recommendations by Squad Type

### Development Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | GitHub, Playwright, Context7, Docker, Azure DevOps |
| **AI Framework** | OpenAI Agents SDK, LangChain |
| **Backend** | Supabase |
| **Code Quality** | CodeRabbit |
| **Project Management** | Jira MCP, Azure Boards |
| **Automation** | n8n |

### QA/Testing Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | Atlassian, Playwright |
| **Test Management** | Xray for Jira, pytest-jira-xray |
| **Automation** | pytest, JUnit, Cucumber |
| **CI/CD** | Azure Pipelines, GitHub Actions |
| **Documentation** | Confluence MCP |

### Data/Analytics Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | EXA, Chroma, Qdrant |
| **Scraping** | Apify, Firecrawl |
| **Search** | EXA AI |
| **Productivity** | Microsoft 365 MCP (Excel, SharePoint) |
| **Automation** | n8n, Google Workspace |

### Research Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | EXA, Context7, Confluence |
| **Search** | EXA AI (semantic) |
| **Scraping** | Apify (social media) |
| **Documentation** | Confluence, SharePoint |
| **AI Framework** | LangChain, LlamaIndex |

### DevOps Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | Docker, GitHub, Azure DevOps, AWS Bedrock |
| **CLI** | GitHub CLI, Vercel CLI, Railway CLI, Az CLI |
| **Pipelines** | Azure Pipelines, GitHub Actions |
| **Automation** | n8n, PowerShell |
| **Monitoring** | Azure DevOps, Jira |

### Enterprise/Corporate Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | Microsoft 365, Atlassian, Azure DevOps |
| **Productivity** | Outlook, Teams, SharePoint |
| **Project Management** | Jira, Azure Boards |
| **Documentation** | Confluence, SharePoint |
| **Authentication** | Microsoft Graph, Entra ID |

### Content/Marketing Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | EXA, Apify |
| **UI Generation** | v0, Bolt.new |
| **Automation** | n8n, Zapier |
| **Google** | Workspace APIs, Gemini |
| **Microsoft** | Teams, SharePoint |

### Full-Stack Squad

| Category | Recommended Tools |
|----------|-------------------|
| **MCP** | GitHub, Playwright, Supabase, Context7, Atlassian |
| **Backend** | Supabase |
| **Frontend** | v0, shadcn/ui |
| **AI Framework** | LangChain |
| **Code Quality** | CodeRabbit |
| **Project Management** | Jira MCP, Azure DevOps |
| **Testing** | Xray, pytest |
| **Automation** | n8n |

---

## Quick Reference: Adding to Your Squad

### MCP Configuration (Claude Code)

```json
// ~/.claude.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

### Docker MCP Toolkit

```bash
# Requires Docker Desktop 4.48+
# MCPs run inside containers automatically
```

### Squad manifest.yaml

```yaml
# squads/my-squad/squad.yaml
components:
  tools:
    - context7
    - exa
    - playwright
    - supabase-cli
  integrations:
    - apify
    - n8n
    - google-workspace

# Enterprise squad example
# squads/enterprise-squad/squad.yaml
components:
  mcp_servers:
    - azure-devops         # Microsoft Azure DevOps
    - atlassian            # Jira + Confluence
    - ms-365               # Microsoft 365
  tools:
    - pytest-jira-xray     # Test management
    - atlassian-python-api # Jira/Confluence automation
    - python-o365          # Microsoft 365 automation
  integrations:
    - azure-pipelines      # CI/CD
    - github-actions       # CI/CD
    - xray                 # Test management
```

---

## Sources

### MCP & Protocol
- [GitHub - MCP Servers](https://github.com/modelcontextprotocol/servers)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers)
- [Docker MCP Toolkit](https://www.docker.com/blog/add-mcp-servers-to-claude-code-with-mcp-toolkit/)
- [Best MCP Servers 2026](https://www.intuz.com/blog/best-mcp-servers)

### AI Agents & Frameworks
- [Top AI Agent Frameworks](https://www.shakudo.io/blog/top-9-ai-agent-frameworks)
- [Best AI Agents 2026](https://www.datacamp.com/blog/best-ai-agents)
- [AI Coding Assistants](https://www.shakudo.io/blog/best-ai-coding-assistants)
- [OpenAI for Developers 2025](https://developers.openai.com/blog/openai-for-developers-2025/)

### Data & Scraping
- [Apify](https://apify.com)
- [Firecrawl](https://www.firecrawl.dev)
- [Exa AI](https://exa.ai)
- [Context7](https://github.com/upstash/context7)

### Automation & Backend
- [n8n](https://n8n.io)
- [Supabase](https://supabase.com)
- [Vercel v0](https://v0.app)

### Google
- [Gemini API](https://ai.google.dev)
- [Google Workspace APIs](https://developers.google.com/workspace)
- [Workspace Studio](https://workspaceupdates.googleblog.com/2025/12/workspace-studio.html)
- [Workspace MCP](https://workspacemcp.com)
- [GeminiApp](https://github.com/mhawksey/GeminiApp)

### Microsoft Azure & Office 365
- [Azure DevOps MCP Server](https://learn.microsoft.com/en-us/azure/devops/mcp-server/mcp-server-overview) - Official Microsoft
- [GitHub - microsoft/azure-devops-mcp](https://github.com/microsoft/azure-devops-mcp)
- [Azure DevOps REST API](https://learn.microsoft.com/en-us/rest/api/azure/devops/)
- [azure-devops-python-api](https://github.com/microsoft/azure-devops-python-api)
- [Microsoft Graph API](https://developer.microsoft.com/en-us/graph)
- [python-o365](https://github.com/O365/python-o365)
- [Microsoft Graph SDK Python](https://github.com/microsoftgraph/msgraph-sdk-python)
- [Microsoft.Graph PowerShell](https://learn.microsoft.com/en-us/powershell/microsoftgraph/)
- [M365 Connector for Claude](https://support.claude.com/en/articles/12542951-enabling-and-using-the-microsoft-365-connector)
- [GitHub - Softeria/ms-365-mcp-server](https://github.com/Softeria/ms-365-mcp-server)
- [Python for DevOps 2026](https://devopscube.com/python-for-devops/)

### Atlassian (Jira, Confluence, Xray)
- [Atlassian Remote MCP Server](https://www.atlassian.com/blog/announcements/remote-mcp-server)
- [GitHub - atlassian/atlassian-mcp-server](https://github.com/atlassian/atlassian-mcp-server)
- [GitHub - sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian) - Community MCP
- [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Confluence REST API](https://developer.atlassian.com/cloud/confluence/rest/v2/)
- [atlassian-python-api](https://github.com/atlassian-api/atlassian-python-api)
- [jira Python Library](https://jira.readthedocs.io/)
- [Xray Cloud API](https://docs.getxray.app/display/XRAYCLOUD/REST+API)
- [pytest-jira-xray](https://pypi.org/project/pytest-jira-xray/)
- [Testing with pytest in Python - Xray](https://docs.getxray.app/display/XRAY/Testing+using+pytest+in+Python)
- [Jira Xray Integration Tutorial](https://www.atlassian.com/devops/testing-tutorials/jira-xray-integration-trigger-automated-tests)

---

*Catalog Version 2.0 - February 2026*
