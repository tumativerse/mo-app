# MCP Server Setup Guide

MCP (Model Context Protocol) servers extend Claude Code with additional capabilities. This guide covers setting up MCP servers for the Mo app.

## Recommended MCP Servers

### 1. GitHub MCP Server

Enables Claude to interact with GitHub PRs, issues, and repositories.

**Installation**:

```bash
npm install -g @anthropic/mcp-server-github
```

**Configuration** (add to `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "your-github-token"
      }
    }
  }
}
```

**Get GitHub Token**:

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `read:user`

### 2. PostgreSQL MCP Server

Enables Claude to query the database directly.

**Installation**:

```bash
npm install -g @anthropic/mcp-server-postgres
```

**Configuration** (add to `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "postgres": {
      "command": "mcp-server-postgres",
      "env": {
        "DATABASE_URL": "your-neon-database-url"
      }
    }
  }
}
```

**Note**: Use a read-only database URL for safety:

```
postgresql://username:password@host/database?sslmode=require&options=default_transaction_read_only%3Don
```

### 3. Filesystem MCP Server

Enhanced file operations (already available via built-in tools).

## Configuration Location

MCP servers are configured globally in:

- macOS/Linux: `~/.claude/settings.json`
- Windows: `%USERPROFILE%\.claude\settings.json`

## Example Full Configuration

```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "mcp-server-postgres",
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

## Verifying Setup

After configuration, restart Claude Code and run:

```
/mcp
```

This shows connected MCP servers and available tools.

## Security Notes

- Never commit tokens to version control
- Use environment variables for sensitive values
- For database access, use read-only credentials when possible
- Review MCP server permissions before enabling
