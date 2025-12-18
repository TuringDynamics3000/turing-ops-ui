import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "operator", "supervisor", "compliance"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Policies define the rules that trigger decisions.
 */
export const policies = mysqlTable("policies", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(), // e.g., "PAY-004"
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  requiredAuthority: mysqlEnum("requiredAuthority", ["SUPERVISOR", "COMPLIANCE", "DUAL"]).notNull(),
  riskLevel: mysqlEnum("riskLevel", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM").notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  version: varchar("version", { length: 16 }).default("1.0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = typeof policies.$inferInsert;

/**
 * Decisions are the core entity requiring human authority.
 * Decisions are immutable once taken.
 * All state changes are via explicit verbs (approve/reject/escalate).
 */
export const decisions = mysqlTable("decisions", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: varchar("decisionId", { length: 32 }).notNull().unique(), // e.g., "DEC-2024-001"
  type: mysqlEnum("type", ["PAYMENT", "LIMIT_OVERRIDE", "AML_EXCEPTION", "POLICY_CHANGE"]).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  policyCode: varchar("policyCode", { length: 32 }).notNull(), // FK to policies.code
  risk: mysqlEnum("risk", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).notNull(),
  requiredAuthority: mysqlEnum("requiredAuthority", ["SUPERVISOR", "COMPLIANCE", "DUAL"]).notNull(),
  status: mysqlEnum("status", ["PENDING", "APPROVED", "REJECTED", "ESCALATED", "EXECUTED"]).default("PENDING").notNull(),
  slaDeadline: timestamp("slaDeadline").notNull(), // When the SLA expires
  amount: varchar("amount", { length: 64 }),
  beneficiary: varchar("beneficiary", { length: 256 }),
  context: text("context"), // Additional context for the decision
  
  // Decision outcome fields (populated when decision is taken)
  decidedAt: timestamp("decidedAt"), // When the decision was made
  decidedBy: varchar("decidedBy", { length: 256 }), // Who made the decision (email/name)
  justification: text("justification"), // Required justification for the action
  executionRef: varchar("executionRef", { length: 64 }), // Reference to downstream execution (e.g., "PAY-84F3A19C")
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = typeof decisions.$inferInsert;

/**
 * Evidence packs are immutable records of decisions taken.
 * This is a formal decision artefact, not a report.
 */
export const evidencePacks = mysqlTable("evidence_packs", {
  id: int("id").autoincrement().primaryKey(),
  evidenceId: varchar("evidenceId", { length: 32 }).notNull().unique(), // e.g., "EVD-2024-001"
  decisionId: varchar("decisionId", { length: 32 }).notNull(), // FK to decisions.decisionId
  
  // Authority chain
  actorId: int("actorId").notNull(), // FK to users.id
  actorName: varchar("actorName", { length: 256 }).notNull(),
  actorRole: varchar("actorRole", { length: 64 }).notNull(),
  action: mysqlEnum("action", ["APPROVED", "REJECTED", "ESCALATED"]).notNull(),
  justification: text("justification").notNull(),
  
  // Policy snapshot (versioned)
  policySnapshot: varchar("policySnapshot", { length: 64 }).notNull(), // e.g., "PAY-004 v2.1"
  policyText: text("policyText"), // Full policy text at time of decision
  
  // Execution record
  executionRef: varchar("executionRef", { length: 64 }), // Reference to external ledger
  executionChannel: varchar("executionChannel", { length: 64 }), // e.g., "Faster Payments"
  executionAmount: varchar("executionAmount", { length: 64 }),
  executionCurrency: varchar("executionCurrency", { length: 8 }),
  executionStatus: varchar("executionStatus", { length: 32 }), // e.g., "POSTED"
  executionTimestamp: timestamp("executionTimestamp"),
  
  // Integrity verification
  merkleHash: varchar("merkleHash", { length: 128 }).notNull(), // SHA-256 hash
  
  // Decision controls
  dualControlRequired: int("dualControlRequired").default(0), // 1 = required, 0 = not required
  escalationTriggered: int("escalationTriggered").default(0), // 1 = triggered, 0 = not triggered
  overrideApplied: int("overrideApplied").default(0), // 1 = override, 0 = no override
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EvidencePack = typeof evidencePacks.$inferSelect;
export type InsertEvidencePack = typeof evidencePacks.$inferInsert;

/**
 * Authority matrix changes audit log.
 * Every change to the authority matrix creates a decision.
 */
export const authorityMatrixAudit = mysqlTable("authority_matrix_audit", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: varchar("decisionId", { length: 32 }).notNull(), // FK to decisions.decisionId
  changeType: mysqlEnum("changeType", ["ADD_ROLE", "REMOVE_ROLE", "MODIFY_DUAL_CONTROL", "ADD_ESCALATION"]).notNull(),
  targetDecisionType: varchar("targetDecisionType", { length: 32 }).notNull(),
  previousValue: text("previousValue"), // JSON snapshot of previous state
  newValue: text("newValue"), // JSON snapshot of new state
  approvedBy: varchar("approvedBy", { length: 256 }).notNull(),
  secondApprover: varchar("secondApprover", { length: 256 }), // For dual control
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuthorityMatrixAudit = typeof authorityMatrixAudit.$inferSelect;
export type InsertAuthorityMatrixAudit = typeof authorityMatrixAudit.$inferInsert;
