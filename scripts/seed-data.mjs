/**
 * Comprehensive Seed Data Script for TuringDynamics Core
 * 
 * This script generates realistic synthetic data to populate the dashboard
 * with operational data that looks like a real financial operations center.
 */

import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import crypto from "crypto";

// Database connection
const db = drizzle(process.env.DATABASE_URL);

// Helper functions
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomDate(daysBack) {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function generateHash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex").slice(0, 16);
}

// Realistic counterparties
const counterparties = [
  { name: "Meridian Capital Partners", country: "AU", type: "institutional" },
  { name: "Pacific Rim Holdings Ltd", country: "SG", type: "corporate" },
  { name: "Westfield Property Trust", country: "AU", type: "reit" },
  { name: "Northern Star Resources", country: "AU", type: "mining" },
  { name: "Cathay Pacific Airways", country: "HK", type: "airline" },
  { name: "BHP Group Limited", country: "AU", type: "mining" },
  { name: "Commonwealth Bank", country: "AU", type: "bank" },
  { name: "Telstra Corporation", country: "AU", type: "telecom" },
  { name: "Woolworths Group", country: "AU", type: "retail" },
  { name: "Qantas Airways", country: "AU", type: "airline" },
  { name: "Rio Tinto Limited", country: "AU", type: "mining" },
  { name: "Macquarie Group", country: "AU", type: "financial" },
  { name: "CSL Limited", country: "AU", type: "biotech" },
  { name: "Fortescue Metals", country: "AU", type: "mining" },
  { name: "Wesfarmers Limited", country: "AU", type: "conglomerate" },
  { name: "ANZ Banking Group", country: "AU", type: "bank" },
  { name: "National Australia Bank", country: "AU", type: "bank" },
  { name: "Woodside Energy", country: "AU", type: "energy" },
  { name: "Santos Limited", country: "AU", type: "energy" },
  { name: "Transurban Group", country: "AU", type: "infrastructure" },
  { name: "Brambles Limited", country: "AU", type: "logistics" },
  { name: "Sonic Healthcare", country: "AU", type: "healthcare" },
  { name: "Aristocrat Leisure", country: "AU", type: "gaming" },
  { name: "James Hardie Industries", country: "IE", type: "construction" },
  { name: "Cochlear Limited", country: "AU", type: "medtech" },
  { name: "Goodman Group", country: "AU", type: "property" },
  { name: "Scentre Group", country: "AU", type: "retail_property" },
  { name: "Mirvac Group", country: "AU", type: "property" },
  { name: "Dexus Property", country: "AU", type: "property" },
  { name: "GPT Group", country: "AU", type: "property" },
  { name: "Lendlease Group", country: "AU", type: "construction" },
  { name: "Origin Energy", country: "AU", type: "energy" },
  { name: "AGL Energy", country: "AU", type: "energy" },
  { name: "Medibank Private", country: "AU", type: "insurance" },
  { name: "Insurance Australia Group", country: "AU", type: "insurance" },
  { name: "QBE Insurance", country: "AU", type: "insurance" },
  { name: "Suncorp Group", country: "AU", type: "financial" },
  { name: "AMP Limited", country: "AU", type: "financial" },
  { name: "Challenger Limited", country: "AU", type: "financial" },
  { name: "Magellan Financial", country: "AU", type: "asset_mgmt" },
];

// Realistic operators
const operators = [
  { id: "op-001", name: "Sarah Mitchell", role: "SUPERVISOR" },
  { id: "op-002", name: "James Wong", role: "SUPERVISOR" },
  { id: "op-003", name: "Emma Thompson", role: "OPERATOR" },
  { id: "op-004", name: "Michael Chen", role: "OPERATOR" },
  { id: "op-005", name: "Lisa Anderson", role: "COMPLIANCE" },
  { id: "op-006", name: "David Kim", role: "COMPLIANCE" },
  { id: "op-007", name: "Rachel Green", role: "PLATFORM_ADMIN" },
  { id: "op-008", name: "Alex Chen", role: "SUPERVISOR" },
  { id: "op-009", name: "Jennifer Liu", role: "OPERATOR" },
  { id: "op-010", name: "Robert Taylor", role: "SUPERVISOR" },
];

// Risk signals
const riskSignals = [
  "Velocity check: 3 payments in 24h",
  "New counterparty relationship",
  "Amount exceeds 90-day average by 2.3x",
  "Cross-border transaction to high-risk jurisdiction",
  "Beneficiary name mismatch detected",
  "Unusual payment timing (outside business hours)",
  "Multiple failed authentication attempts",
  "IP geolocation anomaly detected",
  "Device fingerprint changed",
  "Transaction pattern deviation",
  "Sanctions screening: partial name match",
  "PEP association detected",
  "Adverse media flag",
  "Unusual account activity pattern",
  "Large round amount",
  "First transaction to new jurisdiction",
  "Dormant account reactivation",
  "Rapid succession of transactions",
];

// Justifications for decisions
const approvalJustifications = [
  "Verified with counterparty via secure channel. Transaction aligns with established trading pattern.",
  "Confirmed legitimate business purpose. Supporting documentation reviewed and validated.",
  "Risk signals investigated and cleared. Customer relationship verified through KYC refresh.",
  "Amount within approved limits for this counterparty. No adverse indicators.",
  "Dual control verification completed. Both approvers confirmed transaction legitimacy.",
  "Enhanced due diligence completed. Source of funds verified.",
  "Transaction consistent with customer profile and historical activity.",
  "Compliance review completed. No regulatory concerns identified.",
  "Customer callback completed. Transaction purpose confirmed.",
  "Supporting invoice and contract documentation verified.",
];

const rejectionJustifications = [
  "Unable to verify beneficiary identity. Transaction blocked pending further investigation.",
  "Sanctions screening returned positive match. Escalated to compliance for review.",
  "Customer failed to provide adequate documentation within SLA window.",
  "Transaction purpose inconsistent with declared business activity.",
  "Risk score exceeds threshold. Insufficient mitigating factors.",
  "Duplicate payment detected. Original transaction already processed.",
  "Beneficiary account flagged for suspicious activity.",
  "Amount exceeds approved limit. Customer must submit limit increase request.",
];

const escalationJustifications = [
  "Complex transaction requiring senior review. Multiple risk factors present.",
  "Policy exception required. Escalating to compliance for determination.",
  "Unusual pattern detected. Requires enhanced due diligence review.",
  "Cross-border complexity requires additional verification.",
  "High-value transaction exceeds supervisor authority. Escalating to compliance.",
  "Potential regulatory reporting requirement. Compliance review needed.",
];

// Generate decisions
async function generateDecisions() {
  const decisions = [];
  const evidencePacks = [];
  
  // Generate 60 decisions with realistic distribution
  // Status distribution: 15 PENDING, 30 APPROVED, 8 REJECTED, 5 ESCALATED, 2 EXECUTED
  
  const statusDistribution = [
    ...Array(15).fill("PENDING"),
    ...Array(30).fill("APPROVED"),
    ...Array(8).fill("REJECTED"),
    ...Array(5).fill("ESCALATED"),
    ...Array(2).fill("EXECUTED"),
  ];
  
  const typeDistribution = [
    ...Array(40).fill("PAYMENT"),
    ...Array(12).fill("LIMIT_OVERRIDE"),
    ...Array(6).fill("AML_EXCEPTION"),
    ...Array(2).fill("POLICY_CHANGE"),
  ];
  
  for (let i = 0; i < 60; i++) {
    const status = statusDistribution[i];
    const type = randomChoice(typeDistribution);
    const counterparty = randomChoice(counterparties);
    const operator = randomChoice(operators);
    const createdAt = randomDate(30);
    
    // Determine risk level based on amount and type
    let amount, riskLevel, slaMinutes;
    if (type === "PAYMENT") {
      amount = randomAmount(5000, 500000);
      if (amount > 250000) {
        riskLevel = "CRITICAL";
        slaMinutes = 15;
      } else if (amount > 100000) {
        riskLevel = "HIGH";
        slaMinutes = 30;
      } else if (amount > 50000) {
        riskLevel = "MEDIUM";
        slaMinutes = 60;
      } else {
        riskLevel = "LOW";
        slaMinutes = 120;
      }
    } else if (type === "LIMIT_OVERRIDE") {
      amount = randomAmount(100000, 2000000);
      riskLevel = amount > 1000000 ? "CRITICAL" : "HIGH";
      slaMinutes = 30;
    } else if (type === "AML_EXCEPTION") {
      amount = randomAmount(50000, 500000);
      riskLevel = "CRITICAL";
      slaMinutes = 15;
    } else {
      amount = 0;
      riskLevel = "HIGH";
      slaMinutes = 60;
    }
    
    // Generate SLA deadline
    const slaDeadline = new Date(createdAt.getTime() + slaMinutes * 60 * 1000);
    
    // Generate risk signals (1-4 signals)
    const numSignals = Math.floor(Math.random() * 4) + 1;
    const selectedSignals = [];
    for (let j = 0; j < numSignals; j++) {
      const signal = randomChoice(riskSignals);
      if (!selectedSignals.includes(signal)) {
        selectedSignals.push(signal);
      }
    }
    
    // Generate context based on type
    let context;
    if (type === "PAYMENT") {
      context = {
        amount,
        currency: "AUD",
        beneficiary: counterparty.name,
        beneficiaryCountry: counterparty.country,
        beneficiaryAccount: `${counterparty.country}${randomAmount(10000000, 99999999)}`,
        purpose: randomChoice([
          "Invoice payment",
          "Trade settlement",
          "Dividend distribution",
          "Capital call",
          "Loan repayment",
          "Service fee",
          "Acquisition payment",
          "Royalty payment",
        ]),
        reference: `INV-${randomAmount(100000, 999999)}`,
        riskSignals: selectedSignals,
      };
    } else if (type === "LIMIT_OVERRIDE") {
      context = {
        currentLimit: randomAmount(100000, 500000),
        requestedLimit: amount,
        counterparty: counterparty.name,
        justification: "Business expansion requires increased transaction capacity",
        riskSignals: selectedSignals,
      };
    } else if (type === "AML_EXCEPTION") {
      context = {
        alertId: `AML-${randomAmount(10000, 99999)}`,
        alertType: randomChoice(["Transaction Monitoring", "Sanctions Screening", "PEP Screening"]),
        customer: counterparty.name,
        amount,
        currency: "AUD",
        riskSignals: selectedSignals,
      };
    } else {
      context = {
        policyCode: randomChoice(["PAY-004", "LIM-002", "AML-007", "GOV-001"]),
        changeType: randomChoice(["threshold_update", "role_assignment", "escalation_path"]),
        currentValue: "Previous policy configuration",
        proposedValue: "Updated policy configuration",
        riskSignals: selectedSignals,
      };
    }
    
    const decisionId = `DEC-2024-${String(i + 100).padStart(3, "0")}`;
    
    // Determine decided fields for non-pending decisions
    let decidedAt = null;
    let decidedBy = null;
    let justification = null;
    let executionRef = null;
    
    if (status !== "PENDING") {
      decidedAt = new Date(createdAt.getTime() + randomAmount(5, slaMinutes) * 60 * 1000);
      decidedBy = randomChoice(operators).name;
      
      if (status === "APPROVED" || status === "EXECUTED") {
        justification = randomChoice(approvalJustifications);
        if (status === "EXECUTED") {
          executionRef = `EXE-${randomAmount(100000, 999999)}`;
        }
      } else if (status === "REJECTED") {
        justification = randomChoice(rejectionJustifications);
      } else if (status === "ESCALATED") {
        justification = randomChoice(escalationJustifications);
      }
    }
    
    const decision = {
      decisionId,
      type,
      status,
      riskLevel,
      context: JSON.stringify(context),
      policyCode: type === "PAYMENT" ? "PAY-004" : type === "LIMIT_OVERRIDE" ? "LIM-002" : type === "AML_EXCEPTION" ? "AML-007" : "GOV-001",
      policyText: `Standard ${type.toLowerCase().replace("_", " ")} policy`,
      slaDeadline: slaDeadline.toISOString().slice(0, 19).replace("T", " "),
      createdAt: createdAt.toISOString().slice(0, 19).replace("T", " "),
      decidedAt: decidedAt ? decidedAt.toISOString().slice(0, 19).replace("T", " ") : null,
      decidedBy,
      justification,
      executionRef,
    };
    
    decisions.push(decision);
    
    // Generate evidence pack for completed decisions
    if (status === "APPROVED" || status === "REJECTED" || status === "EXECUTED") {
      const evidenceId = `EVD-${decisionId.split("-")[2]}`;
      const evidenceData = {
        decision: { ...decision, context },
        operator: decidedBy,
        timestamp: decidedAt,
        outcome: status,
      };
      
      const evidencePack = {
        evidenceId,
        decisionId,
        outcome: status === "EXECUTED" ? "APPROVED" : status,
        operatorId: decidedBy,
        justification,
        contextSnapshot: JSON.stringify(context),
        policySnapshot: JSON.stringify({ code: decision.policyCode, text: decision.policyText }),
        evidenceHash: generateHash(evidenceData),
        createdAt: decidedAt.toISOString().slice(0, 19).replace("T", " "),
        executionRef,
      };
      
      evidencePacks.push(evidencePack);
    }
  }
  
  return { decisions, evidencePacks };
}

// Generate policies
function generatePolicies() {
  return [
    {
      code: "PAY-004",
      name: "Payment Authorization Policy",
      description: "Governs approval requirements for outbound payments based on amount thresholds and risk factors",
      thresholdAud: 50000,
      requiredAuthority: "SUPERVISOR",
      effectiveFrom: "2024-01-01 00:00:00",
    },
    {
      code: "PAY-005",
      name: "High-Value Payment Policy",
      description: "Enhanced controls for payments exceeding $250,000 AUD requiring dual control",
      thresholdAud: 250000,
      requiredAuthority: "DUAL",
      effectiveFrom: "2024-01-01 00:00:00",
    },
    {
      code: "LIM-002",
      name: "Limit Override Policy",
      description: "Controls for temporary or permanent increases to customer transaction limits",
      thresholdAud: 100000,
      requiredAuthority: "DUAL",
      effectiveFrom: "2024-01-01 00:00:00",
    },
    {
      code: "AML-007",
      name: "AML Exception Policy",
      description: "Governance for exceptions to standard AML monitoring rules and alert dispositions",
      thresholdAud: 0,
      requiredAuthority: "COMPLIANCE",
      effectiveFrom: "2024-01-01 00:00:00",
    },
    {
      code: "GOV-001",
      name: "Policy Change Governance",
      description: "Meta-policy governing changes to the authority matrix and policy definitions",
      thresholdAud: 0,
      requiredAuthority: "PLATFORM_ADMIN",
      effectiveFrom: "2024-01-01 00:00:00",
    },
    {
      code: "FX-001",
      name: "Foreign Exchange Policy",
      description: "Controls for FX transactions and currency conversion approvals",
      thresholdAud: 100000,
      requiredAuthority: "SUPERVISOR",
      effectiveFrom: "2024-02-01 00:00:00",
    },
    {
      code: "INT-001",
      name: "International Transfer Policy",
      description: "Enhanced due diligence requirements for cross-border transfers",
      thresholdAud: 25000,
      requiredAuthority: "SUPERVISOR",
      effectiveFrom: "2024-02-01 00:00:00",
    },
    {
      code: "VIP-001",
      name: "VIP Customer Policy",
      description: "Special handling procedures for high-net-worth and institutional clients",
      thresholdAud: 500000,
      requiredAuthority: "DUAL",
      effectiveFrom: "2024-03-01 00:00:00",
    },
  ];
}

// Main execution
async function main() {
  console.log("🚀 Starting comprehensive data seed...\n");
  
  const { decisions, evidencePacks } = await generateDecisions();
  const policies = generatePolicies();
  
  console.log(`📊 Generated ${decisions.length} decisions`);
  console.log(`📋 Generated ${evidencePacks.length} evidence packs`);
  console.log(`📜 Generated ${policies.length} policies`);
  
  // Output SQL statements
  console.log("\n-- DECISIONS INSERT STATEMENTS --\n");
  
  for (const d of decisions) {
    const contextEscaped = d.context.replace(/'/g, "''");
    const justificationEscaped = d.justification ? d.justification.replace(/'/g, "''") : null;
    
    console.log(`INSERT INTO decisions (decision_id, type, status, risk_level, context, policy_code, policy_text, sla_deadline, created_at, decided_at, decided_by, justification, execution_ref) VALUES ('${d.decisionId}', '${d.type}', '${d.status}', '${d.riskLevel}', '${contextEscaped}', '${d.policyCode}', '${d.policyText}', '${d.slaDeadline}', '${d.createdAt}', ${d.decidedAt ? `'${d.decidedAt}'` : 'NULL'}, ${d.decidedBy ? `'${d.decidedBy}'` : 'NULL'}, ${justificationEscaped ? `'${justificationEscaped}'` : 'NULL'}, ${d.executionRef ? `'${d.executionRef}'` : 'NULL'});`);
  }
  
  console.log("\n-- EVIDENCE PACKS INSERT STATEMENTS --\n");
  
  for (const e of evidencePacks) {
    const contextEscaped = e.contextSnapshot.replace(/'/g, "''");
    const policyEscaped = e.policySnapshot.replace(/'/g, "''");
    const justificationEscaped = e.justification ? e.justification.replace(/'/g, "''") : null;
    
    console.log(`INSERT INTO evidence_packs (evidence_id, decision_id, outcome, operator_id, justification, context_snapshot, policy_snapshot, evidence_hash, created_at, execution_ref) VALUES ('${e.evidenceId}', '${e.decisionId}', '${e.outcome}', '${e.operatorId}', ${justificationEscaped ? `'${justificationEscaped}'` : 'NULL'}, '${contextEscaped}', '${policyEscaped}', '${e.evidenceHash}', '${e.createdAt}', ${e.executionRef ? `'${e.executionRef}'` : 'NULL'});`);
  }
  
  console.log("\n-- POLICIES INSERT STATEMENTS --\n");
  
  for (const p of policies) {
    const descEscaped = p.description.replace(/'/g, "''");
    console.log(`INSERT INTO policies (code, name, description, threshold_aud, required_authority, effective_from) VALUES ('${p.code}', '${p.name}', '${descEscaped}', ${p.thresholdAud}, '${p.requiredAuthority}', '${p.effectiveFrom}') ON DUPLICATE KEY UPDATE name='${p.name}', description='${descEscaped}', threshold_aud=${p.thresholdAud}, required_authority='${p.requiredAuthority}';`);
  }
  
  console.log("\n✅ SQL statements generated. Copy and execute in your database.");
}

main().catch(console.error);
