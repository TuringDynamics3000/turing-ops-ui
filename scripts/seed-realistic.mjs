/**
 * Realistic Seed Data for TuringDynamics Core
 * Generates SQL that matches the actual database schema
 */

import crypto from "crypto";

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

function formatDate(d) {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function generateHash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex").slice(0, 16);
}

// Realistic Australian counterparties
const counterparties = [
  "Meridian Capital Partners", "Pacific Rim Holdings", "Westfield Property Trust",
  "Northern Star Resources", "BHP Group Limited", "Commonwealth Bank",
  "Telstra Corporation", "Woolworths Group", "Qantas Airways", "Rio Tinto Limited",
  "Macquarie Group", "CSL Limited", "Fortescue Metals", "Wesfarmers Limited",
  "ANZ Banking Group", "National Australia Bank", "Woodside Energy", "Santos Limited",
  "Transurban Group", "Brambles Limited", "Sonic Healthcare", "Aristocrat Leisure",
  "Cochlear Limited", "Goodman Group", "Scentre Group", "Mirvac Group",
  "Origin Energy", "AGL Energy", "Medibank Private", "Insurance Australia Group",
  "QBE Insurance", "Suncorp Group", "AMP Limited", "Challenger Limited",
  "Magellan Financial", "Treasury Wine Estates", "Coles Group", "Stockland",
  "Dexus Property", "GPT Group", "Lendlease Group", "South32 Limited"
];

const operators = [
  "Sarah Mitchell", "James Wong", "Emma Thompson", "Michael Chen",
  "Lisa Anderson", "David Kim", "Rachel Green", "Alex Chen",
  "Jennifer Liu", "Robert Taylor", "Amanda Foster", "Chris Martinez"
];

const riskSignals = [
  "Velocity check: 3 payments in 24h", "New counterparty relationship",
  "Amount exceeds 90-day average by 2.3x", "Cross-border transaction",
  "Beneficiary name mismatch", "Unusual payment timing",
  "Multiple failed auth attempts", "IP geolocation anomaly",
  "Device fingerprint changed", "Transaction pattern deviation",
  "Sanctions screening: partial match", "PEP association detected",
  "Adverse media flag", "Unusual account activity",
  "Large round amount", "First transaction to jurisdiction",
  "Dormant account reactivation", "Rapid succession of transactions"
];

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
  "Supporting invoice and contract documentation verified."
];

const rejectionJustifications = [
  "Unable to verify beneficiary identity. Transaction blocked pending investigation.",
  "Sanctions screening returned positive match. Escalated to compliance.",
  "Customer failed to provide documentation within SLA window.",
  "Transaction purpose inconsistent with declared business activity.",
  "Risk score exceeds threshold. Insufficient mitigating factors.",
  "Duplicate payment detected. Original transaction already processed.",
  "Beneficiary account flagged for suspicious activity.",
  "Amount exceeds approved limit. Customer must submit limit increase."
];

const escalationJustifications = [
  "Complex transaction requiring senior review. Multiple risk factors present.",
  "Policy exception required. Escalating to compliance for determination.",
  "Unusual pattern detected. Requires enhanced due diligence review.",
  "Cross-border complexity requires additional verification.",
  "High-value transaction exceeds supervisor authority.",
  "Potential regulatory reporting requirement. Compliance review needed."
];

// Generate decisions
const decisions = [];
const evidencePacks = [];

// Status distribution: 18 PENDING, 35 APPROVED, 10 REJECTED, 5 ESCALATED, 2 EXECUTED
const statuses = [
  ...Array(18).fill("PENDING"),
  ...Array(35).fill("APPROVED"),
  ...Array(10).fill("REJECTED"),
  ...Array(5).fill("ESCALATED"),
  ...Array(2).fill("EXECUTED")
];

for (let i = 0; i < 70; i++) {
  const status = statuses[i] || randomChoice(["PENDING", "APPROVED"]);
  const type = randomChoice(["PAYMENT", "PAYMENT", "PAYMENT", "PAYMENT", "LIMIT_OVERRIDE", "AML_EXCEPTION"]);
  const beneficiary = randomChoice(counterparties);
  const operator = randomChoice(operators);
  const createdAt = randomDate(30);
  
  // Determine amount and risk
  let amount, risk, slaMinutes, requiredAuthority;
  if (type === "PAYMENT") {
    amount = randomAmount(5000, 500000);
    if (amount > 250000) {
      risk = "CRITICAL"; slaMinutes = 15; requiredAuthority = "DUAL";
    } else if (amount > 100000) {
      risk = "HIGH"; slaMinutes = 30; requiredAuthority = "SUPERVISOR";
    } else if (amount > 50000) {
      risk = "MEDIUM"; slaMinutes = 60; requiredAuthority = "SUPERVISOR";
    } else {
      risk = "LOW"; slaMinutes = 120; requiredAuthority = "SUPERVISOR";
    }
  } else if (type === "LIMIT_OVERRIDE") {
    amount = randomAmount(100000, 2000000);
    risk = amount > 1000000 ? "CRITICAL" : "HIGH";
    slaMinutes = 30;
    requiredAuthority = "DUAL";
  } else {
    amount = randomAmount(50000, 500000);
    risk = "CRITICAL";
    slaMinutes = 15;
    requiredAuthority = "COMPLIANCE";
  }
  
  const slaDeadline = new Date(createdAt.getTime() + slaMinutes * 60 * 1000);
  const numSignals = Math.floor(Math.random() * 3) + 1;
  const signals = [];
  for (let j = 0; j < numSignals; j++) {
    const s = randomChoice(riskSignals);
    if (!signals.includes(s)) signals.push(s);
  }
  
  const decisionId = `DEC-2024-${String(i + 100).padStart(3, "0")}`;
  const policyCode = type === "PAYMENT" ? "PAY-004" : type === "LIMIT_OVERRIDE" ? "LIM-002" : "AML-007";
  
  const subject = type === "PAYMENT" 
    ? `Payment of $${amount.toLocaleString()} AUD to ${beneficiary}`
    : type === "LIMIT_OVERRIDE"
    ? `Limit override request for ${beneficiary} to $${amount.toLocaleString()} AUD`
    : `AML exception review for ${beneficiary}`;
  
  const context = JSON.stringify({
    amount, currency: "AUD", beneficiary,
    purpose: randomChoice(["Invoice payment", "Trade settlement", "Dividend", "Capital call", "Loan repayment"]),
    reference: `INV-${randomAmount(100000, 999999)}`,
    riskSignals: signals
  });
  
  let decidedAt = null, decidedBy = null, justification = null, executionRef = null;
  
  if (status !== "PENDING") {
    decidedAt = new Date(createdAt.getTime() + randomAmount(5, slaMinutes) * 60 * 1000);
    decidedBy = operator;
    if (status === "APPROVED" || status === "EXECUTED") {
      justification = randomChoice(approvalJustifications);
      if (status === "EXECUTED") executionRef = `EXE-${randomAmount(100000, 999999)}`;
    } else if (status === "REJECTED") {
      justification = randomChoice(rejectionJustifications);
    } else {
      justification = randomChoice(escalationJustifications);
    }
  }
  
  decisions.push({
    decisionId, type, subject, policyCode, risk, requiredAuthority, status,
    slaDeadline: formatDate(slaDeadline), amount: String(amount), beneficiary,
    context, decidedAt: decidedAt ? formatDate(decidedAt) : null,
    decidedBy, justification, executionRef,
    createdAt: formatDate(createdAt)
  });
  
  if (status === "APPROVED" || status === "REJECTED" || status === "EXECUTED") {
    evidencePacks.push({
      evidenceId: `EVD-${decisionId.split("-")[2]}`,
      decisionId, outcome: status === "EXECUTED" ? "APPROVED" : status,
      operatorId: decidedBy, justification,
      contextSnapshot: context,
      policySnapshot: JSON.stringify({ code: policyCode }),
      evidenceHash: generateHash({ decisionId, status, decidedAt }),
      createdAt: decidedAt ? formatDate(decidedAt) : formatDate(createdAt),
      executionRef
    });
  }
}

// Output SQL
console.log("-- DECISIONS --");
for (const d of decisions) {
  const ctx = d.context.replace(/'/g, "''");
  const just = d.justification ? d.justification.replace(/'/g, "''") : null;
  console.log(`INSERT INTO decisions (decisionId, type, subject, policyCode, risk, requiredAuthority, status, slaDeadline, amount, beneficiary, context, decidedAt, decidedBy, justification, executionRef, createdAt) VALUES ('${d.decisionId}', '${d.type}', '${d.subject.replace(/'/g, "''")}', '${d.policyCode}', '${d.risk}', '${d.requiredAuthority}', '${d.status}', '${d.slaDeadline}', '${d.amount}', '${d.beneficiary}', '${ctx}', ${d.decidedAt ? `'${d.decidedAt}'` : 'NULL'}, ${d.decidedBy ? `'${d.decidedBy}'` : 'NULL'}, ${just ? `'${just}'` : 'NULL'}, ${d.executionRef ? `'${d.executionRef}'` : 'NULL'}, '${d.createdAt}');`);
}

console.log("\n-- EVIDENCE PACKS --");
for (const e of evidencePacks) {
  const ctx = e.contextSnapshot.replace(/'/g, "''");
  const pol = e.policySnapshot.replace(/'/g, "''");
  const just = e.justification ? e.justification.replace(/'/g, "''") : null;
  console.log(`INSERT INTO evidence_packs (evidenceId, decisionId, outcome, operatorId, justification, contextSnapshot, policySnapshot, evidenceHash, createdAt, executionRef) VALUES ('${e.evidenceId}', '${e.decisionId}', '${e.outcome}', '${e.operatorId}', ${just ? `'${just}'` : 'NULL'}, '${ctx}', '${pol}', '${e.evidenceHash}', '${e.createdAt}', ${e.executionRef ? `'${e.executionRef}'` : 'NULL'});`);
}

console.log(`\n-- Generated ${decisions.length} decisions and ${evidencePacks.length} evidence packs --`);
