# OpenClaw Bridge Contract

This app now exposes a minimal control and telemetry surface for a remote OpenClaw worker.

## Current app-side contract

### Environment variables

- `OPENCLAW_BRIDGE_TOKEN`
  - Required in production.
  - The OpenClaw bridge must send this token when posting telemetry events.
- `TELEGRAM_BOT_TOKEN`
  - Used by the Next.js app to send OpenClaw commands into Telegram.
- `TELEGRAM_CHAT_ID`
  - The chat where the Next.js app will post OpenClaw commands.
- `TELEGRAM_MESSAGE_THREAD_ID`
  - Optional Telegram topic ID if you want commands isolated to one forum topic.

## HTTP endpoints

### `POST /api/openclaw/events`

Used by the OpenClaw bridge to send telemetry into the dashboard.

Headers:

- `Authorization: Bearer <OPENCLAW_BRIDGE_TOKEN>`

Body:

```json
{
  "runId": "run_123",
  "kind": "log",
  "payload": {
    "level": "info",
    "text": "Recon started"
  }
}
```

You can also batch:

```json
{
  "events": [
    {
      "runId": "run_123",
      "kind": "status",
      "payload": {
        "status": "running",
        "target": "https://target.example",
        "agentId": "openclaw-host-01",
        "progress": 12
      }
    },
    {
      "runId": "run_123",
      "kind": "thought",
      "payload": {
        "text": "OpenClaw is enumerating discovered endpoints."
      }
    }
  ]
}
```

Supported kinds:

- `status`
- `metric`
- `log`
- `thought`
- `finding`
- `command_ack`

### `POST /api/openclaw/commands`

Used by the dashboard UI to create a command record and send the command to Telegram.

Body:

```json
{
  "runId": "run_123",
  "type": "set_scope",
  "payload": {
    "target": "https://target.example"
  },
  "issuedBy": "dashboard"
}
```

Delivery behavior:

- The app sends a Telegram message with the prefix `OPENCLAW_COMMAND ` followed by a compact JSON envelope.
- Example message text:

```text
OPENCLAW_COMMAND {"version":1,"kind":"openclaw_command","command":{"id":"cmd_123","runId":"run_123","type":"set_scope","payload":{"target":"https://target.example"},"issuedBy":"dashboard","createdAt":"2026-04-04T19:00:00.000Z"}}
```

If Telegram delivery fails, this route returns `502` and marks the command as `failed` in the in-memory run state.

### `GET /api/openclaw/status?runId=<id>`

Used by the dashboard to fetch the latest snapshot before opening the live stream.

### `GET /api/openclaw/stream?runId=<id>`

SSE stream used by the dashboard for live updates.

## What the OpenClaw machine needs to do

Run a long-lived bridge process next to OpenClaw.

That process should:

1. Connect to the same Telegram bot or otherwise read messages from the configured chat.
2. Watch that chat for messages beginning with `OPENCLAW_COMMAND `.
3. Parse the JSON envelope after the prefix.
4. Deduplicate commands by `command.id`.
5. Execute only allowlisted commands:
   - `start_scan`
   - `pause`
   - `resume`
   - `stop`
   - `set_scope`
   - `note`
6. Convert OpenClaw activity into structured telemetry events.
7. `POST` those events to `/api/openclaw/events`.
8. Send a `command_ack` event after receiving or finishing a command.

The OpenClaw machine no longer needs to poll this app for pending commands. Command delivery now happens through Telegram.

## Telegram listener shape

The easiest listener on the OpenClaw machine is:

1. Use the Telegram Bot API `getUpdates` method with the same bot token.
2. Persist the last processed `update_id`.
3. Ignore messages from the wrong chat or wrong topic.
4. Ignore any message that does not start with `OPENCLAW_COMMAND `.
5. Parse and execute the JSON that follows the prefix.
6. After execution begins or completes, send a `command_ack` event to this app.

You should also keep a local set of processed `command.id` values so retries or duplicate Telegram deliveries do not re-run a command.

## Minimum event shapes

### Log event

```json
{
  "runId": "run_123",
  "kind": "log",
  "payload": {
    "logId": "log_045",
    "level": "info",
    "text": "Running nuclei templates against 47 endpoints"
  }
}
```

### Thought event

```json
{
  "runId": "run_123",
  "kind": "thought",
  "payload": {
    "text": "A public config file looks promising. Pulling it now."
  }
}
```

### Finding event

```json
{
  "runId": "run_123",
  "kind": "finding",
  "payload": {
    "findingId": "finding_007",
    "severity": "P1",
    "title": "SQL Injection in /api/users?id=",
    "description": "Boolean-based injection confirmed in user lookup endpoint.",
    "evidenceLogId": "log_045"
  }
}
```

### Status event

```json
{
  "runId": "run_123",
  "kind": "status",
  "payload": {
    "status": "running",
    "target": "https://target.example",
    "agentId": "openclaw-host-01",
    "progress": 46,
    "riskPercent": 71
  }
}
```

### Metric event

```json
{
  "runId": "run_123",
  "kind": "metric",
  "payload": {
    "progress": 46,
    "riskPercent": 71,
    "totalFindings": 5,
    "countsBySeverity": {
      "P1": 1,
      "P2": 2,
      "P3": 1,
      "P4": 1
    }
  }
}
```

### Command acknowledgement event

```json
{
  "runId": "run_123",
  "kind": "command_ack",
  "payload": {
    "commandId": "cmd_123",
    "status": "completed",
    "runStatus": "running",
    "result": "Scan started successfully"
  }
}
```

## Important limitations of the current app-side MVP

- The event store is in-memory only.
- This is fine for local development or a single long-lived Node process.
- It is not sufficient for horizontally scaled or serverless production deployments.
- Before production, move runs, commands, and findings to durable storage and use a shared pub/sub layer for live fanout.
