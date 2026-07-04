# Chat Platform Architecture

This document describes the design of the **Moataz AI Chat Platform**.

---

## 1. Data Flow & Streaming
Every chat session initializes a standard text-event-stream connection to our backend gateway:

```mermaid
sequenceDiagram
    participant UI as Chat Page
    participant API as /api/gateway/chat
    participant GW as Universal AI Gateway
    participant P as Provider (e.g. OpenAI)
    
    UI->>API: POST (model, messages, stream=true)
    API->>GW: Resolve routing & decrypt keys
    GW->>P: Fetch streaming completions
    P-->>GW: SSE chunks
    GW-->>API: SSE chunks
    API-->>UI: event-stream payload
    UI->>UI: Append chunks & auto-scroll
```

---

## 2. Message History Retention
Messages are saved to the relational Postgres `messages` schema. For quick local sessions, we maintain the active array state in memory, allowing users to scroll and toggle immediately.
