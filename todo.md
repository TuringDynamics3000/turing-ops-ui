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
