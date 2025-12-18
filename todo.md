# Project TODO

- [x] Define database schema for Decisions, Policies, and Evidence
- [x] Run database migrations
- [x] Implement backend API for Decisions (list, get, approve, reject, escalate)
- [x] Implement backend API for Policies (list, get, update)
- [x] Implement backend API for Evidence Packs (list, get, generate)
- [x] Connect frontend Inbox to real-time Decision API
- [x] Connect frontend Decision Card to real-time API
- [x] Implement PDF export for Evidence Packs
- [x] Build Configuration section for Policy/Authority management
- [x] Add role-based access control to Configuration section

## Handover Specification Implementation

- [x] Implement OpenAPI-compliant Decision API with explicit verbs (approve/reject/escalate)
- [x] Add decidedAt, decidedBy, executionRef fields to Decision schema
- [x] Upgrade Evidence Pack PDF to 4-page regulator-grade layout
- [x] Implement formal Authority Matrix data model with AuthorityRule type
- [x] Add POLICY_CHANGE decision type with dual control
- [x] Implement hasAuthority() runtime enforcement function
- [x] Add Authority Matrix Viewer to /system/config with role-based visibility table
- [x] Generate demo data script for realistic test scenarios (seedInitialData in db.ts)


## Platform Upgrade (New Specification)

- [x] Change currency from GBP to AUD throughout the application
- [x] Implement Executive Overview page (/overview) with KPI metrics
- [x] Implement Payments Explorer (/state/payments) with decision routing
- [x] Implement Ledger Explorer (/state/ledger) with integrity indicators
- [x] Implement Risk Explorer (/state/risk) page
- [x] Implement Global Search (/search) with client-side search
- [x] Implement Board Pack monthly PDF export (/board-pack)
- [x] Add POST /decisions endpoint for decision creation
- [x] Update navigation routes to match new information architecture


## Authority Matrix Viewer Rebuild

- [x] Create GET /system/authority-matrix API endpoint with version, hash, effectiveFrom
- [x] Rebuild /system/config/authority page as read-only constitutional document
- [x] Add Authority Header with version, effective date, hash (copyable), last change decision link
- [x] Add Authority Matrix Table with role badges, dual control indicators, escalation paths
- [x] Add Authority Governance History section showing POLICY_CHANGE decisions
- [x] Add "Propose Authority Change" button linking to Decision creation flow
- [x] Remove all edit affordances (no toggles, modals, save buttons)
- [x] Verify enforcement alignment (runtime, API, UI all use same source)


## Hover Explainers (Competitive Differentiation)

- [x] Create reusable Explainer tooltip component with rich content support
- [x] Add explainers to Executive Overview (Live Operations, Decision Governance metrics)
- [x] Add explainers to Decision Inbox (SLA, Risk indicators, Authority requirements)
- [x] Add explainers to Decision Card (Transaction context, Risk profile, Evidence generation)
- [x] Add explainers to Authority Matrix (Version control, Hash verification, Dual control)
- [x] Add explainers to Configuration (Policy definitions, Visibility matrix)
- [x] Add explainers to State Explorers (Payments, Ledger, Risk)
- [x] Add explainers to Evidence Pack (Immutability, Cryptographic proof, Audit trail)
- [x] Ensure all explainers highlight advantages over Constantinople and Thought Machine


## Synthetic Data Population
- [x] Create comprehensive seed data script with 50+ decisions
- [x] Add variety of decision types (PAYMENT, LIMIT_OVERRIDE, AML_EXCEPTION, POLICY_CHANGE)
- [x] Include mix of statuses (PENDING, APPROVED, REJECTED, ESCALATED, EXECUTED)
- [x] Add realistic counterparties, amounts, and risk profiles
- [x] Create corresponding evidence packs for completed decisions
- [x] Update dashboard metrics to pull from real database counts
