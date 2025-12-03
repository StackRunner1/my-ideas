# OpenAI Responses API and Agents SDK Developer Guide

**Version**: 1.1  
**Last Updated**: December 3, 2025  
**Implementation**: Session 4, Units 1-32


---

## Table of Contents 

TO BE CREATED
---

## Technical Specifications

### Environment Variables

**Backend** (extends Session 2 `.env`):

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7
OPENAI_REQUEST_TIMEOUT=30

# Encryption
ENCRYPTION_KEY=<base64-encoded-32-byte-key>

# Rate Limiting
RATE_LIMIT_QUERIES_PER_MINUTE=10
RATE_LIMIT_AGENT_PER_MINUTE=20
DAILY_COST_BUDGET_USD=5.00
```

**Frontend** (extends Session 2 `.env.local`):

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### API Endpoint Summary

**AI Endpoints** (`/api/v1/ai` and `/api/v1/agent`):

- `GET /ai/health` - OpenAI connectivity check
- `POST /ai/query` - Responses API structured queries
- `POST /agent/chat` - Agent SDK tool-calling messages
- `GET /conversations` - List user conversations
- `GET /conversations/{id}` - Load specific conversation
- `DELETE /conversations/{id}` - Delete conversation
- `GET /admin/usage` - API usage statistics (admin only)
- `GET /admin/agent-stats` - Agent performance metrics (admin only)

### Data Models

**Conversations Table**:

```sql
conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  mode TEXT CHECK (mode IN ('responses_api', 'agent_sdk')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

**Conversation Messages Table**:

```sql
conversation_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  metadata JSONB, -- {tokens, cost, tool_results, confidence}
  created_at TIMESTAMP DEFAULT NOW()
)
```

**User API Usage Table**:

```sql
user_api_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE,
  total_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC(10,4) DEFAULT 0,
  request_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
)
```

**Agent Audit Log Table**:

```sql
agent_audit_log (
  id UUID PRIMARY KEY,
  request_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  agent_user_id UUID REFERENCES auth.users(id),
  specialist_type TEXT,
  action TEXT,
  confidence NUMERIC(3,2),
  tool_used TEXT,
  success BOOLEAN,
  latency_ms INTEGER,
  tokens_used INTEGER,
  cost_usd NUMERIC(10,4),
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## Success Metrics

1. **Responses API Performance**: < 2s p95 latency for SQL generation and
   execution
2. **Agent SDK Performance**: < 3s p95 latency for tool-calling operations
3. **Safety**: 100% dangerous SQL patterns blocked by validation
4. **Security**: 100% RLS enforcement preventing cross-user data access
5. **Accuracy**: > 90% agent tool execution success rate
6. **User Experience**: < 5% error rate in production
7. **Cost Efficiency**: Average cost per query < $0.05
8. **Adoption**: > 70% of active users engage with AI features weekly

---

## Future Enhancements (Out of Scope for Session 4)

- [ ] Multi-modal support (image analysis, document processing)
- [ ] Voice input/output for chat interface
- [ ] Agent memory and personalization (learning user preferences)
- [ ] Custom tool creation UI for power users
- [ ] Agent-to-agent communication for complex workflows
- [ ] Integration with external APIs (calendar, email, etc.)
- [ ] Fine-tuned models for domain-specific tasks
- [ ] Real-time collaborative chat (multiple users with shared agent)
- [ ] Mobile app with offline mode
- [ ] Advanced analytics and insights dashboard

---

## Appendix: Common Patterns

### Adding a New Tool

1. Create tool class extending `Tool` base class in
   `backend/app/services/tools/`
2. Implement required methods: `name`, `description`, `parameters_schema`,
   `validate_parameters()`, `execute()`
3. Register tool with appropriate specialist agent
4. Update specialist system prompt mentioning new tool
5. Add tool tests verifying success and error paths
6. Document tool contract in `docs/ai_system/tools.md`

### Debugging Agent Decisions

1. Enable debug mode: Add `?debug=true` to chat request
2. Check agent_audit_log table for decision trail
3. Review confidence scores for low-confidence scenarios
4. Examine system prompt if agent behavior unexpected
5. Test with explicit examples in unit tests
6. Adjust confidence thresholds if needed

### Tuning Agent Prompts

1. Version current prompt before changes
2. Modify prompt with clear intent
3. Test with 10+ diverse scenarios
4. Compare metrics vs previous version
5. Deploy to subset of users first (A/B test)
6. Monitor success rate, clarification rate, error rate
7. Iterate based on data

---

## Document Metadata

- **Version**: 1.0
- **Status**: Complete
- **Last Updated**: 2025-11-30
- **Authors**: AI Coding Assistant + Learner
- **Session**: Session 4 - OpenAI Responses API & Agent SDK
- **Prerequisites**: Sessions 1-3 complete
- **Estimated Total Effort**: 80-100 hours
- **Related Documents**:
  - `Beast_Mode_SB_Auth_PRD.md` - Session 2 authentication reference
  - `SESSION_4_STANDARDS.md` - Session 4 coding standards
  - Individual unit files for detailed implementation guides

---
