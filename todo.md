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


## Ledger Data Population
- [x] Add comprehensive ledger entries with realistic transaction data
- [x] Include variety of entry types (CREDIT, DEBIT)
- [x] Add realistic counterparties and amounts
- [x] Include integrity verification indicators


## Multi-Entity Consolidation (Production Build Pack)
### Database Schema
- [x] Create entities table (id, legal_name, status, created_at)
- [x] Create groups table (id, name, status, created_by, created_at)
- [x] Create group_memberships table (id, group_id, entity_id, status, activated_at, revoked_at)
- [x] Create group_user_roles table (id, group_id, user_id, role)
- [x] Add entity_id column to decisions table (mandatory)
- [x] Add group_id column to decisions table (optional, contextual)
- [x] Create required indexes for performance

### Auth Middleware
- [x] Implement AuthContext interface (entityScopes, groupScopes, entityRoles, groupRoles)
- [x] Implement resolveAuthContext function
- [x] Implement hasEntityAuthority function (group scope never implies entity authority)
- [x] Implement getVisibleEntityIds function
- [x] Implement getActionableEntityIds function
- [x] Implement validateDecisionAuthority function

### Decision Types
- [x] Add GROUP_CREATE decision type
- [x] Add GROUP_ADD_ENTITY decision type
- [x] Add GROUP_REMOVE_ENTITY decision type
- [x] Add GROUP_ROLE_ASSIGN decision type

### APIs
- [x] Implement POST /entities for entity management
- [x] Implement POST /groups for group creation (creates GROUP_CREATE decision)
- [x] Implement POST /groups/{id}/add-entity (creates GROUP_ADD_ENTITY decision)
- [x] Implement POST /groups/{id}/remove-entity (creates GROUP_REMOVE_ENTITY decision)
- [x] Implement GET /groups/{id}/members with entity details

### UI Components
- [x] Implement Scope Selector in Header (Entity/Group dropdown)
- [x] Implement Group Decision Inbox with entity legal_name column
- [x] Update DecisionRow to show entity badge
- [x] Implement scope-filtered inbox (platform/entity/group views)
- [x] Add Group Consolidation Mode warning banner
- [ ] Update Evidence Pack to include Group ID, Group Name, Affected Entity IDs

### Seed Data
- [x] Create demo entities (4 Australian companies: BHP, Rio Tinto, Woolworths, Telstra)
- [x] Create demo group (Coastal Mining Group)
- [x] Create demo group memberships (BHP and Rio Tinto in Coastal Group)
- [x] Create demo decisions with entity_id populated

### Tests
- [x] Multi-entity database schema tests
- [x] Seed data verification tests
- [x] Authority context unit tests (hasEntityAuthority, getVisibleEntityIds, etc.)


## Dashboard Enhancement (Engaging + Authoritative)
- [x] Add subtle animations to KPI cards (number counting, micro-interactions)
- [x] Implement real-time pulse/glow effects for live data indicators
- [x] Add mini sparkline charts to show trends
- [x] Enhance card depth with refined shadows and gradients
- [x] Add status indicators with animated states
- [x] Improve typography hierarchy and visual rhythm
- [x] Add System Health panel with service status
- [x] Implement smooth transitions between data updates


## Real-Time Dashboard Features
- [x] Implement auto-refresh every 30 seconds with refetchInterval
- [x] Add smooth number transition animations on data updates (useAnimatedNumber hook)
- [x] Add visual refresh indicator (timestamp + manual refresh button + auto-refresh badge)
- [x] Add quick action buttons (Approve/Reject) to Top Risks list
- [x] Implement inline decision actions with loading states
- [x] Add success/error toast notifications for quick actions (using sonner)
