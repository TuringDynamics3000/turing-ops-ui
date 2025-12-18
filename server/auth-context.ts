/**
 * Auth Context Middleware
 * 
 * Implements scope-aware authorization per Production Build Pack:
 * - entityScopes: list of entities user has authority over
 * - groupScopes: list of groups user has visibility into
 * - entityRoles: role per entity
 * - groupRoles: role per group
 * 
 * CRITICAL INVARIANT: Group scope never implies entity authority.
 * Group roles grant visibility, not action authority.
 */

import { getDb } from "./db";
import { users, entities, entityUserRoles, groups, groupUserRoles, groupMemberships } from "../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

// Entity scope with role
export interface EntityScope {
  entityId: number;
  entityDbId: string; // e.g., "ENT-001"
  legalName: string;
  role: "ENTITY_ADMIN" | "ENTITY_FINANCE" | "ENTITY_VIEWER" | "ENTITY_APPROVER";
}

// Group scope with role
export interface GroupScope {
  groupId: number;
  groupDbId: string; // e.g., "GRP-001"
  name: string;
  role: "GROUP_ADMIN" | "GROUP_FINANCE" | "GROUP_VIEWER";
  memberEntityIds: number[]; // Entities in this group
}

// Full auth context
export interface AuthContext {
  userId: number;
  userName: string;
  userEmail: string | null;
  platformRole: string;
  
  // Entity-level scopes (grants action authority)
  entityScopes: EntityScope[];
  
  // Group-level scopes (grants visibility only, NOT authority)
  groupScopes: GroupScope[];
  
  // Quick lookup maps
  entityRoles: Map<number, EntityScope["role"]>;
  groupRoles: Map<number, GroupScope["role"]>;
  
  // Current active scope (for UI context)
  activeScope: {
    type: "entity" | "group" | "platform";
    entityId?: number;
    groupId?: number;
  };
}

/**
 * Resolve full auth context for a user.
 * This is called on every request to build the authorization context.
 */
export async function resolveAuthContext(userId: number): Promise<AuthContext | null> {
  const db = await getDb();
  if (!db) return null;

  // Get user
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userResult.length === 0) return null;
  const user = userResult[0];

  // Get entity roles for this user
  const entityRolesResult = await db
    .select({
      entityId: entityUserRoles.entityId,
      role: entityUserRoles.role,
      entityDbId: entities.entityId,
      legalName: entities.legalName,
    })
    .from(entityUserRoles)
    .innerJoin(entities, eq(entityUserRoles.entityId, entities.id))
    .where(eq(entityUserRoles.userId, userId));

  const entityScopes: EntityScope[] = entityRolesResult.map(r => ({
    entityId: r.entityId,
    entityDbId: r.entityDbId,
    legalName: r.legalName,
    role: r.role,
  }));

  // Get group roles for this user
  const groupRolesResult = await db
    .select({
      groupId: groupUserRoles.groupId,
      role: groupUserRoles.role,
      groupDbId: groups.groupId,
      name: groups.name,
    })
    .from(groupUserRoles)
    .innerJoin(groups, eq(groupUserRoles.groupId, groups.id))
    .where(eq(groupUserRoles.userId, userId));

  // For each group, get member entities
  const groupScopes: GroupScope[] = [];
  for (const g of groupRolesResult) {
    const memberships = await db
      .select({ entityId: groupMemberships.entityId })
      .from(groupMemberships)
      .where(and(
        eq(groupMemberships.groupId, g.groupId),
        eq(groupMemberships.status, "ACTIVE")
      ));

    groupScopes.push({
      groupId: g.groupId,
      groupDbId: g.groupDbId,
      name: g.name,
      role: g.role,
      memberEntityIds: memberships.map(m => m.entityId),
    });
  }

  // Build quick lookup maps
  const entityRolesMap = new Map<number, EntityScope["role"]>();
  entityScopes.forEach(e => entityRolesMap.set(e.entityId, e.role));

  const groupRolesMap = new Map<number, GroupScope["role"]>();
  groupScopes.forEach(g => groupRolesMap.set(g.groupId, g.role));

  return {
    userId,
    userName: user.name || "Unknown",
    userEmail: user.email,
    platformRole: user.role,
    entityScopes,
    groupScopes,
    entityRoles: entityRolesMap,
    groupRoles: groupRolesMap,
    activeScope: { type: "platform" }, // Default to platform view
  };
}

/**
 * Check if user has authority to act on a specific entity.
 * CRITICAL: Group scope does NOT grant entity authority.
 */
export function hasEntityAuthority(
  authContext: AuthContext,
  entityId: number,
  requiredRoles: EntityScope["role"][] = ["ENTITY_ADMIN", "ENTITY_APPROVER"]
): boolean {
  const entityRole = authContext.entityRoles.get(entityId);
  if (!entityRole) return false;
  return requiredRoles.includes(entityRole);
}

/**
 * Check if user has visibility into a group.
 * Group visibility is for consolidated views only.
 */
export function hasGroupVisibility(
  authContext: AuthContext,
  groupId: number
): boolean {
  return authContext.groupRoles.has(groupId);
}

/**
 * Get all entity IDs the user can see (directly or via groups).
 * This is for filtering decision lists.
 */
export function getVisibleEntityIds(authContext: AuthContext): number[] {
  const entityIds = new Set<number>();
  
  // Direct entity access
  authContext.entityScopes.forEach(e => entityIds.add(e.entityId));
  
  // Entities visible via groups
  authContext.groupScopes.forEach(g => {
    g.memberEntityIds.forEach(id => entityIds.add(id));
  });
  
  return Array.from(entityIds);
}

/**
 * Get all entity IDs the user can ACT on (not just view).
 * This is stricter than visibility - requires entity-level authority.
 */
export function getActionableEntityIds(
  authContext: AuthContext,
  requiredRoles: EntityScope["role"][] = ["ENTITY_ADMIN", "ENTITY_APPROVER"]
): number[] {
  return authContext.entityScopes
    .filter(e => requiredRoles.includes(e.role))
    .map(e => e.entityId);
}

/**
 * Validate that a decision can be acted upon by the user.
 * Returns error message if not authorized, null if authorized.
 */
export function validateDecisionAuthority(
  authContext: AuthContext,
  decisionEntityId: number | null,
  decisionType: string
): string | null {
  // Platform admin can act on platform-level decisions
  if (authContext.platformRole === "admin") {
    return null;
  }

  // GROUP_* decisions require PLATFORM_ADMIN
  if (decisionType.startsWith("GROUP_")) {
    if (authContext.platformRole !== "admin") {
      return "Group governance decisions require PLATFORM_ADMIN authority.";
    }
    return null;
  }

  // Entity-scoped decisions require entity authority
  if (decisionEntityId !== null) {
    if (!hasEntityAuthority(authContext, decisionEntityId)) {
      return `You do not have authority over entity ${decisionEntityId}. Group scope does not grant entity authority.`;
    }
  }

  return null;
}

/**
 * Get entity legal name by ID.
 */
export async function getEntityLegalName(entityId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({ legalName: entities.legalName })
    .from(entities)
    .where(eq(entities.id, entityId))
    .limit(1);

  return result.length > 0 ? result[0].legalName : null;
}

/**
 * Get group name by ID.
 */
export async function getGroupName(groupId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({ name: groups.name })
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);

  return result.length > 0 ? result[0].name : null;
}
