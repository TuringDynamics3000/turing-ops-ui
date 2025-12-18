import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  decisions, Decision, InsertDecision,
  policies, Policy, InsertPolicy,
  evidencePacks, EvidencePack, InsertEvidencePack,
  entities, Entity, InsertEntity,
  groups, Group, InsertGroup,
  groupMemberships, GroupMembership, InsertGroupMembership,
  entityUserRoles, EntityUserRole, InsertEntityUserRole,
  groupUserRoles, GroupUserRole, InsertGroupUserRole
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";
import crypto from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// DECISION QUERIES
// ============================================

export async function listDecisions(status?: string): Promise<Decision[]> {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db.select().from(decisions)
      .where(eq(decisions.status, status as Decision["status"]))
      .orderBy(desc(decisions.createdAt));
  }
  return db.select().from(decisions).orderBy(desc(decisions.createdAt));
}

export async function getDecisionById(decisionId: string): Promise<Decision | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(decisions)
    .where(eq(decisions.decisionId, decisionId))
    .limit(1);
  return result[0];
}

export async function createDecision(data: Omit<InsertDecision, "decisionId">): Promise<Decision> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const year = new Date().getFullYear();
  const decisionId = `DEC-${year}-${nanoid(6).toUpperCase()}`;

  await db.insert(decisions).values({
    ...data,
    decisionId,
  });

  const result = await getDecisionById(decisionId);
  if (!result) throw new Error("Failed to create decision");
  return result;
}

/**
 * Update a decision with new values.
 * This is used for explicit state changes (approve/reject/escalate).
 */
export async function updateDecision(
  decisionId: string, 
  data: Partial<Pick<Decision, "status" | "decidedAt" | "decidedBy" | "justification" | "executionRef">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(decisions)
    .set(data)
    .where(eq(decisions.decisionId, decisionId));
}

// Legacy function for backward compatibility
export async function updateDecisionStatus(
  decisionId: string, 
  status: Decision["status"]
): Promise<void> {
  await updateDecision(decisionId, { status });
}

// ============================================
// POLICY QUERIES
// ============================================

export async function listPolicies(): Promise<Policy[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(policies).orderBy(policies.code);
}

export async function getPolicyByCode(code: string): Promise<Policy | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(policies)
    .where(eq(policies.code, code))
    .limit(1);
  return result[0];
}

export async function createPolicy(data: InsertPolicy): Promise<Policy> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(policies).values(data);
  const result = await getPolicyByCode(data.code);
  if (!result) throw new Error("Failed to create policy");
  return result;
}

export async function updatePolicy(code: string, data: Partial<InsertPolicy>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(policies)
    .set(data)
    .where(eq(policies.code, code));
}

// ============================================
// EVIDENCE PACK QUERIES
// ============================================

export async function listEvidencePacks(): Promise<EvidencePack[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(evidencePacks).orderBy(desc(evidencePacks.createdAt));
}

export async function getEvidencePackById(evidenceId: string): Promise<EvidencePack | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(evidencePacks)
    .where(eq(evidencePacks.evidenceId, evidenceId))
    .limit(1);
  return result[0];
}

export async function getEvidencePackByDecisionId(decisionId: string): Promise<EvidencePack | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(evidencePacks)
    .where(eq(evidencePacks.decisionId, decisionId))
    .limit(1);
  return result[0];
}

export async function createEvidencePack(
  data: Omit<InsertEvidencePack, "evidenceId" | "merkleHash">
): Promise<EvidencePack> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const year = new Date().getFullYear();
  const evidenceId = `EVD-${year}-${nanoid(6).toUpperCase()}`;
  
  // Generate a SHA-256 hash from the evidence data
  const hashInput = JSON.stringify({
    decisionId: data.decisionId,
    actorId: data.actorId,
    action: data.action,
    justification: data.justification,
    policySnapshot: data.policySnapshot,
    timestamp: new Date().toISOString(),
  });
  const merkleHash = `0x${crypto.createHash("sha256").update(hashInput).digest("hex")}`;

  await db.insert(evidencePacks).values({
    ...data,
    evidenceId,
    merkleHash,
  });

  const result = await getEvidencePackById(evidenceId);
  if (!result) throw new Error("Failed to create evidence pack");
  return result;
}

// ============================================
// SEED DATA
// ============================================

// Import multi-entity seed
import { seedMultiEntityData } from "./seed-multi-entity";

export async function seedInitialData(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if policies exist
  const existingPolicies = await listPolicies();
  if (existingPolicies.length === 0) {
    // Seed policies
    const seedPolicies: InsertPolicy[] = [
      { code: "PAY-001", name: "Standard Payment Approval", description: "Payments under $10,000 AUD to known beneficiaries", requiredAuthority: "SUPERVISOR", riskLevel: "LOW" },
      { code: "PAY-004", name: "High Value Payment Approval", description: "Payments over $25,000 AUD to any beneficiary", requiredAuthority: "SUPERVISOR", riskLevel: "MEDIUM" },
      { code: "LIM-001", name: "Daily Limit Override", description: "Override for daily outgoing transaction limits", requiredAuthority: "DUAL", riskLevel: "HIGH" },
      { code: "AML-009", name: "AML Exception Review", description: "High velocity transaction pattern review", requiredAuthority: "COMPLIANCE", riskLevel: "CRITICAL" },
    ];

    for (const policy of seedPolicies) {
      await db.insert(policies).values(policy);
    }
    console.log("[Database] Seeded initial policies");
  }

  // Check if decisions exist
  const existingDecisions = await listDecisions();
  if (existingDecisions.length === 0) {
    // Seed decisions
    const now = new Date();
    const seedDecisions: InsertDecision[] = [
      {
        decisionId: "DEC-2024-001",
        type: "PAYMENT",
        subject: "Payment Approval: $40,000 AUD → External Beneficiary",
        policyCode: "PAY-004",
        risk: "MEDIUM",
        requiredAuthority: "SUPERVISOR",
        status: "PENDING",
        slaDeadline: new Date(now.getTime() + 72 * 1000),
        amount: "$40,000 AUD",
        beneficiary: "Acme Corp Ltd.",
        context: "Transaction flagged by rule PAY-004. Velocity check indicates 30% deviation from standard pattern. Beneficiary is a known entity but amount exceeds daily auto-approval limit.",
      },
      {
        decisionId: "DEC-2024-002",
        type: "LIMIT_OVERRIDE",
        subject: "Limit Override: Daily outgoing exceeded",
        policyCode: "LIM-001",
        risk: "HIGH",
        requiredAuthority: "DUAL",
        status: "PENDING",
        slaDeadline: new Date(now.getTime() + 22 * 1000),
        context: "Daily outgoing limit of $100,000 AUD has been exceeded. Current total: $127,500 AUD. Override requested for additional $50,000 AUD transfer.",
      },
      {
        decisionId: "DEC-2024-003",
        type: "AML_EXCEPTION",
        subject: "AML Flag: High velocity transaction pattern",
        policyCode: "AML-009",
        risk: "CRITICAL",
        requiredAuthority: "COMPLIANCE",
        status: "PENDING",
        slaDeadline: new Date(now.getTime() + 300 * 1000),
        context: "Multiple rapid transactions detected within 15-minute window. Total volume: $85,000 AUD across 12 transactions. Pattern matches known structuring behavior.",
      },
    ];

    for (const decision of seedDecisions) {
      await db.insert(decisions).values(decision);
    }
    console.log("[Database] Seeded initial decisions");
  }

  // Seed multi-entity data
  await seedMultiEntityData();
}


// ============================================
// ENTITY QUERIES
// ============================================

export async function listEntities(): Promise<Entity[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(entities).orderBy(entities.legalName);
}

export async function getEntityById(id: number): Promise<Entity | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(entities)
    .where(eq(entities.id, id))
    .limit(1);
  return result[0];
}

export async function getEntityByEntityId(entityId: string): Promise<Entity | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(entities)
    .where(eq(entities.entityId, entityId))
    .limit(1);
  return result[0];
}

export async function createEntity(data: Omit<InsertEntity, "entityId">): Promise<Entity> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const entityId = `ENT-${nanoid(6).toUpperCase()}`;

  await db.insert(entities).values({
    ...data,
    entityId,
  });

  const result = await getEntityByEntityId(entityId);
  if (!result) throw new Error("Failed to create entity");
  return result;
}

// ============================================
// GROUP QUERIES
// ============================================

export async function listGroups(): Promise<Group[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(groups).orderBy(groups.name);
}

export async function getGroupById(id: number): Promise<Group | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(groups)
    .where(eq(groups.id, id))
    .limit(1);
  return result[0];
}

export async function getGroupByGroupId(groupId: string): Promise<Group | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(groups)
    .where(eq(groups.groupId, groupId))
    .limit(1);
  return result[0];
}

export async function createGroup(data: Omit<InsertGroup, "groupId">): Promise<Group> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const groupId = `GRP-${nanoid(6).toUpperCase()}`;

  await db.insert(groups).values({
    ...data,
    groupId,
  });

  const result = await getGroupByGroupId(groupId);
  if (!result) throw new Error("Failed to create group");
  return result;
}

// ============================================
// GROUP MEMBERSHIP QUERIES
// ============================================

export async function listGroupMemberships(groupId: number): Promise<GroupMembership[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(groupMemberships)
    .where(eq(groupMemberships.groupId, groupId));
}

export async function getGroupMembershipsWithEntities(groupId: number): Promise<(GroupMembership & { entity: Entity })[]> {
  const db = await getDb();
  if (!db) return [];

  const memberships = await db
    .select()
    .from(groupMemberships)
    .innerJoin(entities, eq(groupMemberships.entityId, entities.id))
    .where(eq(groupMemberships.groupId, groupId));

  return memberships.map(m => ({
    ...m.group_memberships,
    entity: m.entities,
  }));
}

export async function addEntityToGroup(groupId: number, entityId: number): Promise<GroupMembership> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(groupMemberships).values({
    groupId,
    entityId,
    status: "PENDING",
  });

  const result = await db.select().from(groupMemberships)
    .where(and(
      eq(groupMemberships.groupId, groupId),
      eq(groupMemberships.entityId, entityId)
    ))
    .limit(1);

  if (!result[0]) throw new Error("Failed to add entity to group");
  return result[0];
}

export async function activateGroupMembership(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(groupMemberships)
    .set({ status: "ACTIVE", activatedAt: new Date() })
    .where(eq(groupMemberships.id, id));
}

export async function revokeGroupMembership(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(groupMemberships)
    .set({ status: "REVOKED", revokedAt: new Date() })
    .where(eq(groupMemberships.id, id));
}

// ============================================
// ENTITY USER ROLE QUERIES
// ============================================

export async function assignEntityRole(
  entityId: number, 
  userId: number, 
  role: EntityUserRole["role"]
): Promise<EntityUserRole> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(entityUserRoles).values({
    entityId,
    userId,
    role,
  });

  const result = await db.select().from(entityUserRoles)
    .where(and(
      eq(entityUserRoles.entityId, entityId),
      eq(entityUserRoles.userId, userId)
    ))
    .limit(1);

  if (!result[0]) throw new Error("Failed to assign entity role");
  return result[0];
}

export async function getEntityUserRoles(entityId: number): Promise<EntityUserRole[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(entityUserRoles)
    .where(eq(entityUserRoles.entityId, entityId));
}

// ============================================
// GROUP USER ROLE QUERIES
// ============================================

export async function assignGroupRole(
  groupId: number, 
  userId: number, 
  role: GroupUserRole["role"]
): Promise<GroupUserRole> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(groupUserRoles).values({
    groupId,
    userId,
    role,
  });

  const result = await db.select().from(groupUserRoles)
    .where(and(
      eq(groupUserRoles.groupId, groupId),
      eq(groupUserRoles.userId, userId)
    ))
    .limit(1);

  if (!result[0]) throw new Error("Failed to assign group role");
  return result[0];
}

export async function getGroupUserRoles(groupId: number): Promise<GroupUserRole[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(groupUserRoles)
    .where(eq(groupUserRoles.groupId, groupId));
}
