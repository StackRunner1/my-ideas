# Session 4 Unit Mapping: Original PRD → Part A & Part B

**Document Version**: 1.0  
**Last Updated**: December 3, 2025  
**Purpose**: Map original learning units (S4U0-S4U17) to new split PRD structure

---

## Overview

The original Session 4 PRD has been split into two comprehensive PRDs:

- **Part A: Responses API** (`Beast_Mode_OARAPI_PRD1.md`) - Units 1-14
- **Part B: Agent SDK** (`Beast_Mode_Agent_SDK_PRD2.md`) - Units 15-32

This document maps the original 18 learning units to the new 32 implementation units.

---

## Quick Reference: Original → New

| Original Unit | Title                 | Maps To       | New PRD Location                   |
| ------------- | --------------------- | ------------- | ---------------------------------- |
| S4U0          | Pre-Brief             | Prerequisites | Part A - Intro                     |
| S4U1          | Structured Outputs    | Unit 15       | Part B - Phase 4                   |
| S4U2          | Tool Spec: create_tag | Unit 16       | Part B - Phase 4                   |
| S4U3          | OpenAI SDK Setup      | Unit 1        | Part A - Phase 1                   |
| S4U4          | Agent Definition      | Unit 18       | Part B - Phase 4                   |
| S4U5          | Backend Orchestrator  | Unit 22       | Part B - Phase 5                   |
| S4U6          | Agent User Creation   | Units 2-4     | Part A - Phase 1                   |
| S4U7          | Agent RLS Integration | Unit 5        | Part A - Phase 1                   |
| S4U8          | Chat Interface (MVP)  | Units 11-13   | Part A - Phase 3                   |
| S4U9          | Guardrails & Safety   | Units 14, 28  | Part A - Phase 3, Part B - Phase 7 |
| S4U10         | Responses API         | Units 6-8     | Part A - Phase 2                   |
| S4U11         | Multi-Specialist      | Units 19-21   | Part B - Phase 5                   |
| S4U12         | Built-In Tools        | Unit 27       | Part B - Phase 7                   |
| S4U13         | Failure Modes         | Unit 31       | Part B - Phase 7                   |
| S4U14         | Advanced Chat UI      | Units 25, 29  | Part B - Phase 6, 7                |
| S4U15         | Observability         | Unit 30       | Part B - Phase 7                   |
| S4U16         | Testing & QA          | Units 14, 26  | Part A - Phase 3, Part B - Phase 6 |
| S4U17         | Commit & Docs         | Unit 32       | Part B - Phase 7                   |

---

## Part A: Responses API Implementation (Units 1-14)

### Phase 1: OpenAI Integration & Agent-User Foundation (Units 1-5)

| New Unit   | Title                         | Original Mapping                          | Duration | Focus                                      |
| ---------- | ----------------------------- | ----------------------------------------- | -------- | ------------------------------------------ |
| **Unit 1** | OpenAI SDK Setup              | **S4U3** - OpenAI SDK Setup               | 1-2 hrs  | Install OpenAI SDK, config, health check   |
| **Unit 2** | Agent-User Database Schema    | **S4U6** - Agent User Creation (Part 1/3) | 1-2 hrs  | Extend user_profile table, RLS policies    |
| **Unit 3** | Credential Encryption Service | **S4U6** - Agent User Creation (Part 2/3) | 1-2 hrs  | Fernet encryption for agent passwords      |
| **Unit 4** | Agent-User Creation on Signup | **S4U6** - Agent User Creation (Part 3/3) | 2-3 hrs  | Extend signup to create agent accounts     |
| **Unit 5** | Agent Authentication Service  | **S4U7** - Agent RLS Integration          | 2-3 hrs  | Authenticate agent-user, RLS-scoped client |

**Phase 1 Notes**:

- Original S4U6 (30 min) expanded into 3 detailed units (2-4)
- Separates schema, encryption, and creation for clarity
- S4U7 maps directly to Unit 5

---

### Phase 2: Responses API & Structured Query Generation (Units 6-8)

| New Unit   | Title                                | Original Mapping                     | Duration | Focus                                        |
| ---------- | ------------------------------------ | ------------------------------------ | -------- | -------------------------------------------- |
| **Unit 6** | Pydantic Models for Responses API    | **S4U10** - Responses API (Part 1/3) | 1-2 hrs  | Type-safe models, SQL safety validation      |
| **Unit 7** | Responses API Service Implementation | **S4U10** - Responses API (Part 2/3) | 3-4 hrs  | SQL generation, safety checks, execution     |
| **Unit 8** | Responses API Endpoint               | **S4U10** - Responses API (Part 3/3) | 2-3 hrs  | FastAPI endpoint, rate limiting, audit trail |

**Phase 2 Notes**:

- Original S4U10 (30 min) expanded into 3 units (6-8)
- Separates models, business logic, and API layer
- Emphasizes SQL safety and RLS enforcement

---

### Phase 3: Frontend Chat Interface for Responses API (Units 9-14)

| New Unit    | Title                               | Original Mapping                         | Duration | Focus                                 |
| ----------- | ----------------------------------- | ---------------------------------------- | -------- | ------------------------------------- |
| **Unit 9**  | Redux Chat Slice                    | **S4U8** - Chat Interface MVP (Part 1/5) | 2-3 hrs  | State management for chat messages    |
| **Unit 10** | Chat Service Layer                  | **S4U8** - Chat Interface MVP (Part 2/5) | 1-2 hrs  | API communication layer               |
| **Unit 11** | ChatInterface Component             | **S4U8** - Chat Interface MVP (Part 3/5) | 2-3 hrs  | Main chat UI component                |
| **Unit 12** | Message Display Components          | **S4U8** - Chat Interface MVP (Part 4/5) | 2-3 hrs  | Message cards, results table          |
| **Unit 13** | Chat Route & Navigation Integration | **S4U8** - Chat Interface MVP (Part 5/5) | 1-2 hrs  | Routing, protected route, nav links   |
| **Unit 14** | Responses API Polish & Testing      | **S4U9** + **S4U16** (Part A)            | 3-4 hrs  | Final validation, rate limiting tests |

**Phase 3 Notes**:

- Original S4U8 (35 min) expanded into 5 units (9-13)
- Unit 14 combines S4U9 (guardrails) and S4U16 (testing) for Part A
- Comprehensive frontend architecture

---

## Part B: Agent SDK Implementation (Units 15-32)

### Phase 4: Tool Infrastructure (Units 15-18)

| New Unit    | Title                          | Original Mapping                 | Duration | Focus                                          |
| ----------- | ------------------------------ | -------------------------------- | -------- | ---------------------------------------------- |
| **Unit 15** | Tool Base Class                | **S4U1** - Structured Outputs    | 2-3 hrs  | Abstract base class, Pydantic validation       |
| **Unit 16** | create_tag Tool Implementation | **S4U2** - Tool Spec: create_tag | 2-3 hrs  | First concrete tool with full contract         |
| **Unit 17** | Pydantic Models for Agent SDK  | **NEW** (not in original)        | 1-2 hrs  | AgentRequest, AgentResponse, ToolResult models |
| **Unit 18** | System Prompts Module          | **S4U4** - Agent Definition      | 2-3 hrs  | Reusable prompt templates, decision policies   |

**Phase 4 Notes**:

- S4U1 (Pydantic validation) becomes Unit 15 (tool base class)
- S4U2 (create_tag) maps directly to Unit 16
- Unit 17 is NEW - explicit models for Agent SDK
- S4U4 (agent definition) becomes Unit 18 (system prompts)

---

### Phase 5: Agent SDK Implementation (Units 19-22)

| New Unit    | Title                             | Original Mapping                        | Duration | Focus                         |
| ----------- | --------------------------------- | --------------------------------------- | -------- | ----------------------------- |
| **Unit 19** | Items Specialist Agent            | **S4U11** - Multi-Specialist (Part 1/4) | 2-3 hrs  | Items domain agent with tools |
| **Unit 20** | Tags Specialist Agent             | **S4U11** - Multi-Specialist (Part 2/4) | 2-3 hrs  | Tags domain agent with tools  |
| **Unit 21** | Orchestrator Agent Implementation | **S4U11** - Multi-Specialist (Part 3/4) | 3-4 hrs  | Route requests to specialists |
| **Unit 22** | Agent SDK Backend Endpoint        | **S4U5** + **S4U11** (Part 4/4)         | 2-3 hrs  | POST /agent/chat endpoint     |

**Phase 5 Notes**:

- Original S4U11 (40 min) expanded into 4 units (19-22)
- Unit 22 combines S4U5 (backend orchestrator) with S4U11 completion
- Each specialist gets dedicated implementation unit

---

### Phase 6: Frontend Agent Interface (Units 23-26)

| New Unit    | Title                              | Original Mapping                        | Duration | Focus                                |
| ----------- | ---------------------------------- | --------------------------------------- | -------- | ------------------------------------ |
| **Unit 23** | Redux Agent Slice Extension        | **NEW** (not in original)               | 2-3 hrs  | Extend Redux for agent mode          |
| **Unit 24** | Agent Chat Components              | **S4U8** (Agent mode extension)         | 2-3 hrs  | Agent-specific UI components         |
| **Unit 25** | Mode Toggle & Agent Action Display | **S4U14** - Advanced Chat UI (Part 1/2) | 2-3 hrs  | Switch between Responses/Agent modes |
| **Unit 26** | Agent SDK Integration Testing      | **S4U16** - Testing & QA (Part B)       | 3-4 hrs  | E2E tests for agent interactions     |

**Phase 6 Notes**:

- Unit 23 is NEW - explicit Redux state for agent mode
- Unit 24 extends S4U8 for agent-specific components
- Unit 25 maps to part of S4U14 (mode switching)
- Unit 26 is testing portion of S4U16 for Agent SDK

---

### Phase 7: Production Features (Units 27-32)

| New Unit    | Title                            | Original Mapping                        | Duration | Focus                                   |
| ----------- | -------------------------------- | --------------------------------------- | -------- | --------------------------------------- |
| **Unit 27** | Web Search Integration           | **S4U12** - Built-In Tools              | 2-3 hrs  | OpenAI web search tool integration      |
| **Unit 28** | Rate Limiting & Cost Controls    | **S4U9** - Guardrails & Safety (Part B) | 3-4 hrs  | Advanced rate limiting, cost budgets    |
| **Unit 29** | Advanced Conversation Management | **S4U14** - Advanced Chat UI (Part 2/2) | 4-5 hrs  | Persistence, history, export            |
| **Unit 30** | Agent Observability & Monitoring | **S4U15** - Observability               | 3-4 hrs  | Logging, audit trail, metrics dashboard |
| **Unit 31** | Error Handling & Failure Modes   | **S4U13** - Failure Modes               | 3-4 hrs  | Comprehensive error handling            |
| **Unit 32** | Documentation & Deployment Guide | **S4U17** - Commit & Docs               | 4-5 hrs  | Complete system documentation           |

**Phase 7 Notes**:

- Units 27-32 map directly to original units S4U12-17
- Unit 28 is Part B portion of S4U9 (guardrails)
- Unit 29 is Part 2 of S4U14 (conversation persistence)
- All production readiness features consolidated here

---

## Detailed Expansion Analysis

### Units That Expanded (1 → Multiple)

| Original                       | New Units               | Expansion Ratio | Reason                                    |
| ------------------------------ | ----------------------- | --------------- | ----------------------------------------- |
| **S4U6** (Agent User Creation) | Units 2, 3, 4           | 1 → 3           | Separate schema, encryption, creation     |
| **S4U8** (Chat Interface MVP)  | Units 9, 10, 11, 12, 13 | 1 → 5           | Full frontend architecture layers         |
| **S4U10** (Responses API)      | Units 6, 7, 8           | 1 → 3           | Models, service, endpoint separation      |
| **S4U11** (Multi-Specialist)   | Units 19, 20, 21, 22    | 1 → 4           | Each specialist + orchestrator + endpoint |

### New Units (Not in Original)

| Unit        | Title                         | Rationale                                    |
| ----------- | ----------------------------- | -------------------------------------------- |
| **Unit 17** | Pydantic Models for Agent SDK | Explicit type definitions for agent patterns |
| **Unit 23** | Redux Agent Slice Extension   | State management for dual-mode chat          |
| **Unit 26** | Agent SDK Integration Testing | Dedicated testing phase for agents           |

### Units That Split (Across Parts)

| Original                  | Part A Unit | Part B Unit  | Rationale                                           |
| ------------------------- | ----------- | ------------ | --------------------------------------------------- |
| **S4U9** (Guardrails)     | Unit 14     | Unit 28      | Basic (Responses) vs Advanced (Agent) rate limiting |
| **S4U14** (Advanced Chat) | -           | Units 25, 29 | Mode toggle + conversation persistence              |
| **S4U16** (Testing)       | Unit 14     | Unit 26      | Validate each part separately                       |

---

## Implementation Sequence

### Original Learning Path (Published)

```
S4U0 → S4U1 → S4U2 → S4U3 → S4U4 → S4U5 → S4U6 → S4U7 → S4U8 →
S4U9 → S4U10 → S4U11 → S4U12 → S4U13 → S4U14 → S4U15 → S4U16 → S4U17
```

### New Implementation Path (PRD-Driven)

```
PART A (Foundation):
Prerequisites → Unit 1 → Units 2-5 → Units 6-8 → Units 9-14 → Validation

PART B (Advanced):
Prerequisites → Units 15-18 → Units 19-22 → Units 23-26 → Units 27-32 → Final Validation
```

---

## Duration Comparison

| Metric             | Original PRD       | New PRDs    | Change              |
| ------------------ | ------------------ | ----------- | ------------------- |
| **Total Units**    | 18 units           | 32 units    | +77%                |
| **Total Duration** | ~530 min (8.8 hrs) | ~80-100 hrs | Reality check       |
| **Part A**         | ~6 units           | 14 units    | Foundation emphasis |
| **Part B**         | ~12 units          | 18 units    | Production features |

**Note**: Original time estimates were optimistic learning times, not implementation times. New estimates reflect realistic development including testing, debugging, and iteration.

---

## XP Mapping (Optional: For Learning Platform)

If you want to maintain the XP structure from the original learning units:

| Original Total XP | Suggested Distribution               |
| ----------------- | ------------------------------------ |
| **2600 XP**       | Part A: 1200 XP (14 units × ~86 avg) |
|                   | Part B: 1400 XP (18 units × ~78 avg) |

Alternative: Award XP by phase completion rather than individual units for larger implementation chunks.

---

## Usage Guide

### For Learners (Using Learning Platform)

- Follow original S4U0-S4U17 sequence for conceptual understanding
- Refer to this mapping to find detailed implementation in PRDs
- Use PRDs as implementation reference during hands-on work

### For AI Coding Assistant

- Execute new PRD units sequentially (1-32)
- Mark completion in PRD checklists
- Reference original unit numbers in commit messages for traceability

### For Course Maintainers

- Keep S4U0-S4U17 as published learning content
- Link each learning unit to corresponding PRD sections
- This mapping document bridges learning → implementation

---

## Traceability Matrix

For each commit during implementation, reference both systems:

**Example Commit Message**:

```
feat(responses-api): implement SQL generation service

- Implements Part A, Phase 2, Unit 7
- Maps to original S4U10 (Responses API)
- Adds OpenAI Chat Completions integration
- Adds SQL safety validation
- Adds RLS-enforced query execution

Refs: Beast_Mode_OARAPI_PRD1.md#unit-7
Original: S4U10 from Beast_Mode_Agent_SDK_PRD_Init.md
```

---

## Document Metadata

- **Version**: 1.0
- **Created**: December 3, 2025
- **Purpose**: Map original learning units to new implementation PRDs
- **Audience**: Learners, AI coding assistants, course maintainers
- **Related Documents**:
  - `Beast_Mode_OARAPI_PRD1.md` - Part A implementation
  - `Beast_Mode_Agent_SDK_PRD2.md` - Part B implementation
  - `Beast_Mode_Agent_SDK_PRD_Init.md` - Original combined PRD

---

**END OF UNIT MAPPING DOCUMENT**
