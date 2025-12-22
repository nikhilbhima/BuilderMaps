---
name: mcp-builder
description: Generate MCP (Model Context Protocol) servers to integrate external APIs like Google Maps, review platforms, or social media into Claude. Use when you want Claude to interact with external services.
allowed-tools: Read, Glob, Grep
---

# MCP Builder Skill

Create MCP servers to connect Claude with external APIs and services.

## What is MCP?

Model Context Protocol (MCP) lets Claude:
- Call external APIs (Google Maps, Twitter, etc.)
- Access databases directly
- Interact with services on your behalf

## Instructions

### 1. MCP Server Structure

```
mcp-servers/
  google-maps/
    index.ts       # Server entry point
    package.json   # Dependencies
    README.md      # Usage instructions
```

### 2. Basic MCP Server Template

```typescript
// index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "your-service-name",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// Define tools
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "your_tool_name",
      description: "What this tool does",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string", description: "Parameter description" },
        },
        required: ["param1"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "your_tool_name") {
    // Call external API here
    const result = await callExternalAPI(args.param1);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

### 3. Package.json Template

```json
{
  "name": "mcp-your-service",
  "version": "1.0.0",
  "type": "module",
  "main": "index.ts",
  "scripts": {
    "start": "npx tsx index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "tsx": "^4.0.0"
  }
}
```

### 4. Useful MCP Servers for BuilderMaps

| Service | Purpose | API Needed |
|---------|---------|------------|
| Google Maps | Geocoding, place details | Maps API key |
| Google Places | Search for spots | Places API key |
| Twitter/X | Post updates, fetch mentions | OAuth tokens |
| Supabase | Direct DB access | Service key |
| SendGrid | Email notifications | API key |

### 5. Register MCP Server

Add to Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "your-service": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-servers/your-service/index.ts"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## Output Format

```
## MCP Server: [Service Name]

### Generated Files
- `mcp-servers/[name]/index.ts`
- `mcp-servers/[name]/package.json`
- `mcp-servers/[name]/README.md`

### Tools Provided
| Tool | Description | Parameters |
|------|-------------|------------|
| tool_name | What it does | param1, param2 |

### Setup Instructions
1. Install dependencies: `cd mcp-servers/[name] && npm install`
2. Add API key to environment
3. Register in Claude settings

### Example Usage
[Example of calling the tool]
```

## Example Usage

```
/mcp-builder create google-maps
/mcp-builder create supabase-direct
/mcp-builder list
/mcp-builder help
```
