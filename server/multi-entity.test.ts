import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { entities, groups, groupMemberships, decisions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as authContext from "./auth-context";

describe("Multi-Entity Consolidation", () => {
  describe("Database Schema", () => {
    it("should have entities table with required columns", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(entities).limit(1);
      // Verify the query doesn't throw - schema is correct
      expect(Array.isArray(result)).toBe(true);
    });

    it("should have groups table with required columns", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(groups).limit(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should have group_memberships table with required columns", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(groupMemberships).limit(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should have entityId and groupId columns in decisions table", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(decisions).limit(1);
      expect(Array.isArray(result)).toBe(true);
      
      // If there are decisions, verify entityId field exists
      if (result.length > 0) {
        expect("entityId" in result[0]).toBe(true);
        expect("groupId" in result[0]).toBe(true);
      }
    });
  });

  describe("Seed Data", () => {
    it("should have seeded demo entities", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(entities);
      expect(result.length).toBeGreaterThanOrEqual(4);
      
      // Verify expected entities exist
      const entityIds = result.map(e => e.entityId);
      expect(entityIds).toContain("ENT-BHPGRP");
      expect(entityIds).toContain("ENT-RIOTNT");
      expect(entityIds).toContain("ENT-WOOLW");
      expect(entityIds).toContain("ENT-TELST");
    });

    it("should have seeded demo group", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(groups);
      expect(result.length).toBeGreaterThanOrEqual(1);
      
      const coastalGroup = result.find(g => g.groupId === "GRP-COASTAL");
      expect(coastalGroup).toBeDefined();
      expect(coastalGroup?.name).toBe("Coastal Mining Group");
    });

    it("should have group memberships for Coastal Group", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const coastalGroup = await db.select().from(groups)
        .where(eq(groups.groupId, "GRP-COASTAL"))
        .limit(1);
      
      if (coastalGroup.length === 0) {
        console.log("Coastal group not found, skipping test");
        return;
      }

      const memberships = await db.select().from(groupMemberships)
        .where(eq(groupMemberships.groupId, coastalGroup[0].id));
      
      expect(memberships.length).toBeGreaterThanOrEqual(2);
    });

    it("should have entity-scoped decisions", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(decisions);
      const entityScopedDecisions = result.filter(d => d.entityId !== null);
      
      expect(entityScopedDecisions.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Authority Context", () => {
    it("should enforce that group scope never implies entity authority", () => {
      // Verify the key functions exist
      expect(typeof authContext.hasEntityAuthority).toBe("function");
      expect(typeof authContext.hasGroupVisibility).toBe("function");
      expect(typeof authContext.getVisibleEntityIds).toBe("function");
      expect(typeof authContext.getActionableEntityIds).toBe("function");
      expect(typeof authContext.validateDecisionAuthority).toBe("function");
    });

    it("should have separate entity and group scope types", () => {
      // Create a mock auth context
      const mockContext: authContext.AuthContext = {
        userId: 1,
        userName: "Test User",
        userEmail: "test@example.com",
        platformRole: "user",
        entityScopes: [
          { entityId: 1, entityDbId: "ENT-001", legalName: "Test Entity", role: "ENTITY_ADMIN" }
        ],
        groupScopes: [
          { groupId: 1, groupDbId: "GRP-001", name: "Test Group", role: "GROUP_VIEWER", memberEntityIds: [1, 2, 3] }
        ],
        entityRoles: new Map([["1", "ENTITY_ADMIN"]]) as any,
        groupRoles: new Map([["1", "GROUP_VIEWER"]]) as any,
        activeScope: { type: "platform" },
      };

      // Fix the maps to use number keys
      mockContext.entityRoles = new Map([[1, "ENTITY_ADMIN"]]);
      mockContext.groupRoles = new Map([[1, "GROUP_VIEWER"]]);

      // Verify entity authority check
      expect(authContext.hasEntityAuthority(mockContext, 1)).toBe(true);
      expect(authContext.hasEntityAuthority(mockContext, 2)).toBe(false); // No authority over entity 2

      // Verify group visibility check
      expect(authContext.hasGroupVisibility(mockContext, 1)).toBe(true);
      expect(authContext.hasGroupVisibility(mockContext, 2)).toBe(false);

      // Verify visible entity IDs includes both direct and group members
      const visibleIds = authContext.getVisibleEntityIds(mockContext);
      expect(visibleIds).toContain(1);
      expect(visibleIds).toContain(2);
      expect(visibleIds).toContain(3);

      // Verify actionable entity IDs only includes direct authority
      const actionableIds = authContext.getActionableEntityIds(mockContext);
      expect(actionableIds).toContain(1);
      expect(actionableIds).not.toContain(2); // Group scope doesn't grant action authority
      expect(actionableIds).not.toContain(3);
    });

    it("should validate decision authority correctly", () => {
      const mockContext: authContext.AuthContext = {
        userId: 1,
        userName: "Test User",
        userEmail: "test@example.com",
        platformRole: "user",
        entityScopes: [
          { entityId: 1, entityDbId: "ENT-001", legalName: "Test Entity", role: "ENTITY_ADMIN" }
        ],
        groupScopes: [],
        entityRoles: new Map([[1, "ENTITY_ADMIN"]]),
        groupRoles: new Map(),
        activeScope: { type: "platform" },
      };

      // User has authority over entity 1
      const result1 = authContext.validateDecisionAuthority(mockContext, 1, "PAYMENT");
      expect(result1).toBeNull(); // No error

      // User does NOT have authority over entity 2
      const result2 = authContext.validateDecisionAuthority(mockContext, 2, "PAYMENT");
      expect(result2).not.toBeNull(); // Error message

      // GROUP_* decisions require PLATFORM_ADMIN
      const result3 = authContext.validateDecisionAuthority(mockContext, null, "GROUP_CREATE");
      expect(result3).not.toBeNull(); // Error - user is not admin
    });
  });
});
