/**
 * Seed Multi-Entity Consolidation Demo Data
 * 
 * Creates:
 * - 4 Australian entities (legal companies)
 * - 1 group (Coastal Group)
 * - Group memberships
 * - Decisions with entity_id populated
 */

import { getDb } from "./db";
import { entities, groups, groupMemberships, decisions } from "../drizzle/schema";
import { nanoid } from "nanoid";

export async function seedMultiEntityData(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[Seed] Database not available, skipping multi-entity seed");
    return;
  }

  // Check if entities already exist
  const existingEntities = await db.select().from(entities);
  if (existingEntities.length > 0) {
    console.log("[Seed] Entities already exist, skipping multi-entity seed");
    return;
  }

  console.log("[Seed] Creating demo entities...");

  // Create 4 Australian entities
  const entityData = [
    {
      entityId: "ENT-BHPGRP",
      legalName: "BHP Group Limited",
      tradingName: "BHP",
      abn: "49004028077",
      status: "ACTIVE" as const,
    },
    {
      entityId: "ENT-RIOTNT",
      legalName: "Rio Tinto Limited",
      tradingName: "Rio Tinto",
      abn: "96004458404",
      status: "ACTIVE" as const,
    },
    {
      entityId: "ENT-WOOLW",
      legalName: "Woolworths Group Limited",
      tradingName: "Woolworths",
      abn: "88000014675",
      status: "ACTIVE" as const,
    },
    {
      entityId: "ENT-TELST",
      legalName: "Telstra Corporation Limited",
      tradingName: "Telstra",
      abn: "33051775556",
      status: "ACTIVE" as const,
    },
  ];

  for (const entity of entityData) {
    await db.insert(entities).values(entity);
  }
  console.log("[Seed] Created 4 demo entities");

  // Get inserted entity IDs
  const insertedEntities = await db.select().from(entities);
  const entityMap = new Map(insertedEntities.map(e => [e.entityId, e.id]));

  // Create a group
  console.log("[Seed] Creating demo group...");
  await db.insert(groups).values({
    groupId: "GRP-COASTAL",
    name: "Coastal Mining Group",
    status: "ACTIVE",
    createdBy: 1, // Admin user
  });

  const insertedGroups = await db.select().from(groups);
  const coastalGroup = insertedGroups.find(g => g.groupId === "GRP-COASTAL");
  
  if (coastalGroup) {
    // Add BHP and Rio Tinto to the group
    const bhpId = entityMap.get("ENT-BHPGRP");
    const rioId = entityMap.get("ENT-RIOTNT");

    if (bhpId) {
      await db.insert(groupMemberships).values({
        groupId: coastalGroup.id,
        entityId: bhpId,
        status: "ACTIVE",
        activatedAt: new Date(),
      });
    }

    if (rioId) {
      await db.insert(groupMemberships).values({
        groupId: coastalGroup.id,
        entityId: rioId,
        status: "ACTIVE",
        activatedAt: new Date(),
      });
    }

    console.log("[Seed] Created group with 2 member entities");
  }

  // Create decisions with entity_id populated
  console.log("[Seed] Creating entity-scoped decisions...");
  const now = new Date();

  const entityDecisions = [
    {
      decisionId: `DEC-${new Date().getFullYear()}-ENT001`,
      entityId: entityMap.get("ENT-BHPGRP"),
      type: "PAYMENT" as const,
      subject: "Payment Approval: $2.5M AUD → Caterpillar Inc.",
      policyCode: "PAY-004",
      risk: "HIGH" as const,
      requiredAuthority: "DUAL" as const,
      status: "PENDING" as const,
      slaDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      amount: "$2,500,000 AUD",
      beneficiary: "Caterpillar Inc.",
      context: "Mining equipment procurement payment. Large value requires dual control approval.",
    },
    {
      decisionId: `DEC-${new Date().getFullYear()}-ENT002`,
      entityId: entityMap.get("ENT-RIOTNT"),
      type: "PAYMENT" as const,
      subject: "Payment Approval: $850,000 AUD → Port Hedland Authority",
      policyCode: "PAY-004",
      risk: "MEDIUM" as const,
      requiredAuthority: "SUPERVISOR" as const,
      status: "PENDING" as const,
      slaDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      amount: "$850,000 AUD",
      beneficiary: "Port Hedland Authority",
      context: "Port usage fees for Q4 2024. Standard recurring payment.",
    },
    {
      decisionId: `DEC-${new Date().getFullYear()}-ENT003`,
      entityId: entityMap.get("ENT-WOOLW"),
      type: "LIMIT_OVERRIDE" as const,
      subject: "Limit Override: Daily payment limit exceeded",
      policyCode: "LIM-001",
      risk: "HIGH" as const,
      requiredAuthority: "DUAL" as const,
      status: "PENDING" as const,
      slaDeadline: new Date(now.getTime() + 1 * 60 * 60 * 1000),
      context: "Daily outgoing limit of $5M AUD exceeded. Current total: $6.2M AUD. Override requested for supplier payments.",
    },
    {
      decisionId: `DEC-${new Date().getFullYear()}-ENT004`,
      entityId: entityMap.get("ENT-TELST"),
      type: "AML_EXCEPTION" as const,
      subject: "AML Flag: Unusual transaction pattern detected",
      policyCode: "AML-009",
      risk: "CRITICAL" as const,
      requiredAuthority: "COMPLIANCE" as const,
      status: "PENDING" as const,
      slaDeadline: new Date(now.getTime() + 30 * 60 * 1000),
      context: "Multiple high-value transactions to new beneficiaries in short timeframe. Compliance review required.",
    },
  ];

  for (const decision of entityDecisions) {
    await db.insert(decisions).values(decision);
  }

  console.log("[Seed] Created 4 entity-scoped decisions");
  console.log("[Seed] Multi-entity seed complete!");
}
