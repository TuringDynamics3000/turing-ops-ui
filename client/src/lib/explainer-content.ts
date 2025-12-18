// Pre-defined explainer content for common concepts
// Each explainer highlights TuringDynamics Core advantages over legacy systems

export const EXPLAINER_CONTENT = {
  // Executive Overview - Live Operations
  paymentsToday: {
    title: "Real-Time Payment Throughput",
    description: "Live count of all payment transactions processed through the governance layer today, with cryptographic proof of each decision.",
    advantages: [
      "Every payment decision is cryptographically sealed with SHA-256 hash",
      "Sub-second decision latency with full audit trail",
      "No batch processing delays - decisions are immediate",
    ],
    legacyComparison: {
      legacy: "Batch-based reconciliation with T+1 visibility. Decisions buried in workflow queues without cryptographic proof.",
      turing: "Real-time streaming with instant visibility. Every decision produces an immutable Evidence Pack within milliseconds.",
    },
  },
  
  successRate: {
    title: "Governance Success Rate",
    description: "Percentage of payment decisions that completed successfully through the full governance lifecycle without requiring manual intervention.",
    advantages: [
      "Automated authority verification eliminates human error",
      "Policy-driven routing ensures correct approval paths",
      "Failed decisions automatically escalate with full context",
    ],
    legacyComparison: {
      legacy: "Manual exception handling with email-based escalation. Success metrics often exclude manual overrides.",
      turing: "Automated escalation with preserved decision context. All outcomes tracked including escalations and overrides.",
    },
  },
  
  failureRate: {
    title: "Governance Failure Rate",
    description: "Percentage of decisions that failed policy validation or were rejected. Each failure generates an Evidence Pack for audit purposes.",
    advantages: [
      "Failures are first-class governance events with full audit trail",
      "Automatic root cause classification by policy rule",
      "Failure patterns surfaced for policy optimization",
    ],
    legacyComparison: {
      legacy: "Failures often logged as exceptions without structured data. Root cause analysis requires manual log correlation.",
      turing: "Every failure produces structured evidence. Policy violations are automatically classified and traceable to specific rules.",
    },
  },
  
  processingLatency: {
    title: "Decision Processing Latency",
    description: "Time from decision request to final outcome, including authority verification, policy evaluation, and evidence generation.",
    advantages: [
      "In-memory authority matrix evaluation in <1ms",
      "Parallel evidence generation doesn't block decision",
      "P95 latency SLAs enforced at the governance layer",
    ],
    legacyComparison: {
      legacy: "Multi-hop approval workflows with database round-trips. Latency varies from seconds to hours depending on queue depth.",
      turing: "Single-hop decision with pre-computed authority. Consistent sub-200ms latency regardless of system load.",
    },
  },
  
  // Executive Overview - Decision Governance
  decisionsPending: {
    title: "Pending Decision Queue",
    description: "Decisions awaiting human authority action. Each decision has an SLA countdown and risk classification visible to authorized operators.",
    advantages: [
      "SLA enforcement at the decision level, not workflow level",
      "Risk-based prioritization surfaces critical decisions first",
      "Authority requirements visible before decision is opened",
    ],
    legacyComparison: {
      legacy: "Flat task queues without risk context. Operators must open each item to understand urgency and authority requirements.",
      turing: "Risk-stratified inbox with authority pre-checks. Operators see exactly what they can act on and what requires escalation.",
    },
  },
  
  timeToDecision: {
    title: "Mean Time to Decision",
    description: "Average time from decision creation to final outcome across all decision types, weighted by risk level.",
    advantages: [
      "Tracks actual decision time, not just approval click time",
      "Includes evidence generation and cryptographic sealing",
      "Broken down by decision type and authority level",
    ],
    legacyComparison: {
      legacy: "Measures workflow completion, not decision quality. Often excludes time spent in manual review or exception queues.",
      turing: "End-to-end decision lifecycle tracking from request to sealed evidence. No hidden queues or unmeasured steps.",
    },
  },
  
  escalationRate: {
    title: "Escalation Rate",
    description: "Percentage of decisions that required escalation to a higher authority level due to policy rules or SLA breach risk.",
    advantages: [
      "Escalation triggers are policy-defined and auditable",
      "Escalation preserves full decision context",
      "Escalation patterns inform authority matrix optimization",
    ],
    legacyComparison: {
      legacy: "Escalations often ad-hoc via email or chat. No structured record of why escalation occurred or who received it.",
      turing: "Escalation is a governed event. Every escalation produces evidence showing trigger reason, target authority, and timing.",
    },
  },
  
  dualControlCompliance: {
    title: "Dual Control Compliance",
    description: "Percentage of decisions requiring dual control that received two independent authorizations from different principals.",
    advantages: [
      "Cryptographically enforced separation of duties",
      "Both approvers' identities sealed in evidence",
      "Cannot be bypassed by system administrators",
    ],
    legacyComparison: {
      legacy: "Dual control often implemented as sequential approvals that can be bypassed by privileged users or batch overrides.",
      turing: "Cryptographic enforcement - dual control decisions cannot complete without two distinct authority signatures in the evidence chain.",
    },
  },
  
  // Decision Inbox
  slaIndicator: {
    title: "SLA Countdown Timer",
    description: "Real-time countdown to the decision's Service Level Agreement deadline. Breaches are automatically escalated and recorded in the evidence trail.",
    advantages: [
      "SLA defined per policy, not per workflow",
      "Automatic escalation triggers before breach",
      "Breach events become part of immutable audit record",
    ],
    legacyComparison: {
      legacy: "SLAs tracked in separate reporting systems. Breaches often discovered in retrospective analysis, not real-time.",
      turing: "SLA is a first-class governance concept. Every decision carries its deadline, and the system enforces it automatically.",
    },
  },
  
  riskIndicator: {
    title: "Risk Classification",
    description: "Policy-driven risk level assigned at decision creation based on transaction attributes, counterparty data, and historical patterns.",
    advantages: [
      "Risk classification is deterministic and auditable",
      "Classification logic defined in versioned policy",
      "Cannot be manually overridden without evidence",
    ],
    legacyComparison: {
      legacy: "Risk scores computed by opaque ML models or manual assignment. Classification rationale often not preserved.",
      turing: "Deterministic risk classification with full policy traceability. Every risk level can be explained by policy version and input data.",
    },
  },
  
  authorityBadge: {
    title: "Required Authority Level",
    description: "The minimum authority level required to act on this decision, determined by the Authority Matrix and decision type.",
    advantages: [
      "Authority requirements visible before opening decision",
      "Matrix is versioned and cryptographically hashed",
      "Changes to authority require governed POLICY_CHANGE decision",
    ],
    legacyComparison: {
      legacy: "Authority often determined by role membership in identity systems. Changes made by administrators without audit trail.",
      turing: "Authority Matrix is a governed artifact. Every change produces an Evidence Pack and requires dual control.",
    },
  },
  
  // Decision Card
  transactionContext: {
    title: "Transaction Context Panel",
    description: "Complete transaction details preserved at decision creation time. This context is immutable and sealed into the Evidence Pack.",
    advantages: [
      "Context captured at decision time, not approval time",
      "Includes all data used for risk classification",
      "Cannot be modified after decision is created",
    ],
    legacyComparison: {
      legacy: "Transaction data often pulled from source systems at approval time. Context can change between request and approval.",
      turing: "Snapshot semantics - all context frozen at decision creation. Approvers see exactly what the system evaluated.",
    },
  },
  
  riskProfile: {
    title: "Risk Profile Analysis",
    description: "Detailed breakdown of risk factors contributing to the decision's classification, with policy references for each factor.",
    advantages: [
      "Every risk factor traceable to policy definition",
      "Composite risk score with explainable components",
      "Historical comparison to similar decisions",
    ],
    legacyComparison: {
      legacy: "Risk scores often presented as single numbers without breakdown. Difficult to explain to regulators why a decision was classified.",
      turing: "Full risk decomposition with policy citations. Regulators can trace any classification back to specific policy rules.",
    },
  },
  
  decisionActions: {
    title: "Authority-Gated Actions",
    description: "Action buttons that only appear when the current user has sufficient authority. Unauthorized users see a clear explanation of required authority.",
    advantages: [
      "No hidden functionality - authority is always visible",
      "Actions require explicit justification before execution",
      "Every action produces cryptographically sealed evidence",
    ],
    legacyComparison: {
      legacy: "Buttons often hidden or disabled without explanation. Users must guess why they cannot perform actions.",
      turing: "Transparent authority - users always see what authority is required and whether they have it. No guessing.",
    },
  },
  
  // Authority Matrix
  authorityHash: {
    title: "Authority Matrix Hash",
    description: "SHA-256 hash of the current Authority Matrix configuration. This hash appears in every Evidence Pack to prove which rules were in effect.",
    advantages: [
      "Cryptographic proof of authority rules at decision time",
      "Hash changes when any rule is modified",
      "Enables point-in-time authority reconstruction",
    ],
    legacyComparison: {
      legacy: "Authority configurations stored in databases without versioning. Impossible to prove what rules were active for historical decisions.",
      turing: "Every Evidence Pack contains the authority hash. Regulators can verify exactly which rules governed any historical decision.",
    },
  },
  
  dualControlRule: {
    title: "Dual Control Requirement",
    description: "When enabled, decisions of this type require two independent authorizations from principals with the required authority level.",
    advantages: [
      "Enforced at the cryptographic layer, not workflow layer",
      "Both signatures sealed into Evidence Pack",
      "Cannot be bypassed by any user including admins",
    ],
    legacyComparison: {
      legacy: "Dual control often implemented as 'four eyes' workflow that can be bypassed by batch operations or emergency overrides.",
      turing: "Cryptographic dual control - the Evidence Pack is invalid without two distinct signatures. No bypass mechanism exists.",
    },
  },
  
  authorityVersion: {
    title: "Authority Matrix Version",
    description: "Semantic version identifier for the current Authority Matrix. Changes increment the version and require a governed POLICY_CHANGE decision.",
    advantages: [
      "Full version history with diff capability",
      "Every version change linked to its governing decision",
      "Rollback requires another governed decision",
    ],
    legacyComparison: {
      legacy: "Authority changes made directly in admin consoles. No version history or change tracking beyond basic audit logs.",
      turing: "Authority Matrix is a versioned artifact. Every change is a governed decision with full evidence trail.",
    },
  },
  
  // Evidence Pack
  evidenceHash: {
    title: "Evidence Pack Hash",
    description: "SHA-256 hash of the complete Evidence Pack contents. This hash can be independently verified to prove the evidence has not been tampered with.",
    advantages: [
      "Tamper-evident - any modification changes the hash",
      "Can be verified by external auditors without system access",
      "Suitable for regulatory submission as cryptographic proof",
    ],
    legacyComparison: {
      legacy: "Audit logs stored in databases that administrators can modify. No cryptographic proof of log integrity.",
      turing: "Evidence Packs are cryptographically sealed. Even database administrators cannot modify evidence without detection.",
    },
  },
  
  immutableRecord: {
    title: "Immutable Evidence Record",
    description: "Once generated, Evidence Packs cannot be modified or deleted. They form a permanent, tamper-evident record of every governed decision.",
    advantages: [
      "Append-only storage with cryptographic chaining",
      "Deletion attempts are themselves recorded",
      "Meets regulatory requirements for record retention",
    ],
    legacyComparison: {
      legacy: "Audit records can be purged, archived, or modified by database administrators. Retention policies often not enforced.",
      turing: "True immutability - Evidence Packs are cryptographically chained. Any tampering breaks the chain and is immediately detectable.",
    },
  },
  
  evidenceTimeline: {
    title: "Decision Timeline",
    description: "Chronological record of every event in the decision lifecycle, from creation through approval to evidence sealing.",
    advantages: [
      "Microsecond-precision timestamps for all events",
      "Events cannot be reordered or inserted retroactively",
      "Timeline hash included in Evidence Pack",
    ],
    legacyComparison: {
      legacy: "Audit logs often have second-precision timestamps. Events from different systems difficult to correlate chronologically.",
      turing: "Single timeline with microsecond precision. All events cryptographically ordered - impossible to insert backdated entries.",
    },
  },
  
  // State Explorers
  ledgerIntegrity: {
    title: "Ledger Integrity Verification",
    description: "Real-time verification that ledger entries match their governing decisions. Any discrepancy triggers an automatic alert.",
    advantages: [
      "Continuous reconciliation, not periodic batch checks",
      "Every ledger entry links to its Decision ID",
      "Discrepancies are governance events, not just alerts",
    ],
    legacyComparison: {
      legacy: "Reconciliation runs as batch jobs, often daily. Discrepancies discovered hours or days after they occur.",
      turing: "Streaming reconciliation - ledger integrity verified within seconds of each transaction. Discrepancies trigger immediate governance events.",
    },
  },
  
  paymentRouting: {
    title: "Decision-Linked Payment Routing",
    description: "Every payment in the explorer links directly to its governing decision and Evidence Pack, enabling instant audit trail navigation.",
    advantages: [
      "One-click navigation from payment to decision to evidence",
      "No separate audit system to query",
      "Complete traceability without manual correlation",
    ],
    legacyComparison: {
      legacy: "Payments and approvals stored in separate systems. Audit requires manual correlation using reference numbers.",
      turing: "Unified data model - payments, decisions, and evidence are linked by design. Any record leads to complete context.",
    },
  },
  
  riskExposure: {
    title: "Real-Time Risk Exposure",
    description: "Live calculation of risk exposure across all active limits and positions, updated with each governed decision.",
    advantages: [
      "Risk updated in real-time, not end-of-day",
      "Exposure linked to governing decisions",
      "Limit breaches trigger automatic governance events",
    ],
    legacyComparison: {
      legacy: "Risk exposure calculated in batch, often overnight. Intraday exposure may exceed limits without detection.",
      turing: "Streaming risk calculation - exposure updated with every decision. Limit breaches impossible without governance event.",
    },
  },
  
  // Configuration
  policyDefinition: {
    title: "Policy Definition",
    description: "Formal policy specification including risk classification rules, authority requirements, and SLA parameters.",
    advantages: [
      "Policies are versioned and cryptographically hashed",
      "Policy changes require governed POLICY_CHANGE decision",
      "Every decision references its governing policy version",
    ],
    legacyComparison: {
      legacy: "Policies defined in configuration files or admin consoles. Changes made directly without governance or audit trail.",
      turing: "Policies are governed artifacts. Every change produces evidence and requires appropriate authority.",
    },
  },
  
  visibilityMatrix: {
    title: "UI Visibility Matrix",
    description: "Defines which UI areas each role can access. Unlike authority (who can act), visibility controls who can see.",
    advantages: [
      "Visibility separate from authority - see vs. do",
      "No hidden functionality - all capabilities visible",
      "Visibility changes are governed like authority changes",
    ],
    legacyComparison: {
      legacy: "UI permissions often hardcoded or managed in separate identity systems. Difficult to audit who can see what.",
      turing: "Visibility is a first-class governance concept. The matrix is versioned and changes require appropriate authority.",
    },
  },

  // Authority Matrix Page
  authorityMatrix: {
    title: "Authority Matrix Overview",
    description: "The Authority Matrix is the constitutional document that governs all decisions in the platform. It defines which roles can act on each decision type, dual control requirements, and escalation paths.",
    advantages: [
      "Single source of truth for all authority rules",
      "Versioned and cryptographically hashed for integrity",
      "Changes require governed POLICY_CHANGE decisions with dual control",
    ],
    legacyComparison: {
      legacy: "Authority rules scattered across code, config files, and identity systems. Changes made by admins without formal approval or audit trail.",
      turing: "One matrix, one source. Runtime, API, and UI all read from this document. Every change is a governed decision.",
    },
  },

  hashVerification: {
    title: "Cryptographic Hash Verification",
    description: "SHA-256 hash of the current Authority Matrix. This hash appears in every Evidence Pack to prove which rules were in effect at decision time.",
    advantages: [
      "Tamper-evident - any modification changes the hash",
      "Hash embedded in all Evidence Packs",
      "Enables point-in-time authority reconstruction for audits",
    ],
    legacyComparison: {
      legacy: "Authority configurations stored without cryptographic proof. Impossible to verify what rules were active for historical decisions.",
      turing: "Every Evidence Pack contains the authority hash. Regulators can verify exactly which rules governed any historical decision.",
    },
  },

  dualControl: {
    title: "Dual Control Requirement",
    description: "When enabled, decisions of this type require two independent authorizations from principals with the required authority level. This is cryptographically enforced, not just workflow-enforced.",
    advantages: [
      "Cryptographically enforced separation of duties",
      "Both approvers' signatures sealed in Evidence Pack",
      "Cannot be bypassed by any user including system administrators",
    ],
    legacyComparison: {
      legacy: "Dual control often implemented as 'four eyes' workflow that can be bypassed by batch operations, emergency overrides, or privileged users.",
      turing: "Cryptographic enforcement - dual control decisions cannot complete without two distinct authority signatures. No bypass possible.",
    },
  },

  executionRef: {
    title: "Execution Reference",
    description: "The reference from the payment rail confirming execution. This links the governance decision to the actual settlement, creating end-to-end traceability.",
    advantages: [
      "End-to-end traceability from decision to settlement",
      "Execution reference sealed in Evidence Pack",
      "Enables reconciliation with external systems",
    ],
    legacyComparison: {
      legacy: "Execution references stored separately. Manual correlation required between approval and settlement.",
      turing: "Execution reference captured in Evidence Pack. Complete chain from decision to settlement in one record.",
    },
  },

  enforcementAlignment: {
    title: "Enforcement Alignment Guarantee",
    description: "The Authority Matrix displayed here is the single source of truth. Runtime enforcement (hasAuthority()), the Decision API, and this UI all read from the same source.",
    advantages: [
      "No drift between UI display and actual enforcement",
      "Hash verification proves alignment",
      "Regulators can trust what they see in the UI",
    ],
    legacyComparison: {
      legacy: "UI often shows different permissions than what's actually enforced. Admin consoles may be out of sync with runtime systems.",
      turing: "Single source of truth with cryptographic proof. What you see is exactly what's enforced - verified by hash.",
    },
  },
};
