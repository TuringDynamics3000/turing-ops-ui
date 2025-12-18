import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, json } from "drizzle-orm/mysql-core";

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
 */
export const decisions = mysqlTable("decisions", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: varchar("decisionId", { length: 32 }).notNull().unique(), // e.g., "DEC-2024-001"
  type: mysqlEnum("type", ["PAYMENT", "LIMIT_OVERRIDE", "AML_EXCEPTION"]).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  policyCode: varchar("policyCode", { length: 32 }).notNull(), // FK to policies.code
  risk: mysqlEnum("risk", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).notNull(),
  requiredAuthority: mysqlEnum("requiredAuthority", ["SUPERVISOR", "COMPLIANCE", "DUAL"]).notNull(),
  status: mysqlEnum("status", ["PENDING", "APPROVED", "REJECTED", "ESCALATED", "EXECUTING", "COMPLETED"]).default("PENDING").notNull(),
  slaDeadline: timestamp("slaDeadline").notNull(), // When the SLA expires
  amount: varchar("amount", { length: 64 }),
  beneficiary: varchar("beneficiary", { length: 256 }),
  context: text("context"), // Additional context for the decision
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = typeof decisions.$inferInsert;

/**
 * Evidence packs are immutable records of decisions taken.
 */
export const evidencePacks = mysqlTable("evidence_packs", {
  id: int("id").autoincrement().primaryKey(),
  evidenceId: varchar("evidenceId", { length: 32 }).notNull().unique(), // e.g., "EVD-2024-001"
  decisionId: varchar("decisionId", { length: 32 }).notNull(), // FK to decisions.decisionId
  actorId: int("actorId").notNull(), // FK to users.id
  actorName: varchar("actorName", { length: 256 }).notNull(),
  actorRole: varchar("actorRole", { length: 64 }).notNull(),
  action: mysqlEnum("action", ["APPROVED", "REJECTED", "ESCALATED"]).notNull(),
  justification: text("justification").notNull(),
  policySnapshot: varchar("policySnapshot", { length: 64 }).notNull(), // e.g., "PAY-004 v2.1"
  merkleHash: varchar("merkleHash", { length: 128 }).notNull(), // Cryptographic proof
  ledgerId: varchar("ledgerId", { length: 64 }), // Reference to external ledger
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EvidencePack = typeof evidencePacks.$inferSelect;
export type InsertEvidencePack = typeof evidencePacks.$inferInsert;
