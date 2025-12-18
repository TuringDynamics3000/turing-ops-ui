import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  listDecisions, getDecisionById, updateDecision, createDecision,
  listPolicies, getPolicyByCode, updatePolicy, createPolicy,
  listEvidencePacks, getEvidencePackById, getEvidencePackByDecisionId, createEvidencePack,
  listEntities, getEntityById, createEntity,
  listGroups, getGroupById, createGroup, getGroupMembershipsWithEntities,
  addEntityToGroup, activateGroupMembership, revokeGroupMembership,
  seedInitialData
} from "./db";
import { hasAuthority, normalizeRole, requiresDualControl, AUTHORITY_MATRIX, VISIBILITY_MATRIX, getAuthorityMatrixResponse } from "@shared/authority";

// Seed initial data on server start
seedInitialData().catch(console.error);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // DECISION ROUTES (OpenAPI-compliant)
  // No generic update endpoints.
  // State changes via explicit verbs only.
  // ============================================
  decisions: router({
    // GET /decisions?status=PENDING
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return listDecisions(input?.status);
      }),

    // POST /decisions - Create a new decision
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["PAYMENT", "LIMIT_OVERRIDE", "AML_EXCEPTION", "POLICY_CHANGE"]),
        subject: z.string().min(10, "Subject must be at least 10 characters"),
        policyCode: z.string(),
        risk: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        requiredAuthority: z.enum(["SUPERVISOR", "COMPLIANCE", "DUAL"]),
        slaMinutes: z.number().min(1).max(1440).default(60), // SLA in minutes, max 24 hours
        amount: z.string().optional(),
        beneficiary: z.string().optional(),
        context: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const slaDeadline = new Date(Date.now() + input.slaMinutes * 60 * 1000);
        
        const decision = await createDecision({
          type: input.type,
          subject: input.subject,
          policyCode: input.policyCode,
          risk: input.risk,
          requiredAuthority: input.requiredAuthority,
          status: "PENDING",
          slaDeadline,
          amount: input.amount,
          beneficiary: input.beneficiary,
          context: input.context,
        });
        
        return { success: true, decisionId: decision.decisionId };
      }),

    // GET /decisions/{id}
    get: publicProcedure
      .input(z.object({ decisionId: z.string() }))
      .query(async ({ input }) => {
        return getDecisionById(input.decisionId);
      }),

    // POST /decisions/{id}/approve
    approve: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
        justification: z.string().min(10, "Justification must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.decisionId);
        if (!decision) throw new Error("Decision not found");

        // Check authority using formal Authority Matrix
        const userRole = normalizeRole(ctx.user.role);
        const decisionType = decision.type;
        
        if (!hasAuthority(userRole, decisionType)) {
          throw new Error(`Insufficient authority. Your role (${userRole}) cannot approve ${decisionType} decisions.`);
        }

        // Check dual control requirement
        const needsDualControl = requiresDualControl(decisionType);
        // TODO: Implement dual control workflow

        // Generate execution reference
        const executionRef = `PAY-${Date.now().toString(36).toUpperCase()}`;

        // Update decision with outcome fields
        await updateDecision(input.decisionId, {
          status: "APPROVED",
          decidedAt: new Date(),
          decidedBy: ctx.user.email || ctx.user.name || "Unknown",
          justification: input.justification,
          executionRef,
        });

        // Create evidence pack
        const policy = await getPolicyByCode(decision.policyCode);
        const evidence = await createEvidencePack({
          decisionId: input.decisionId,
          actorId: ctx.user.id,
          actorName: ctx.user.name || "Unknown",
          actorRole: userRole,
          action: "APPROVED",
          justification: input.justification,
          policySnapshot: `${decision.policyCode} v${policy?.version || "1.0"}`,
          policyText: policy?.description || "",
          executionRef,
          executionChannel: decision.type === "PAYMENT" ? "Faster Payments" : "Internal",
          executionAmount: decision.amount || undefined,
          executionCurrency: "AUD",
          executionStatus: "POSTED",
          executionTimestamp: new Date(),
          dualControlRequired: needsDualControl ? 1 : 0,
          escalationTriggered: 0,
          overrideApplied: 0,
        });

        return { success: true, evidenceId: evidence.evidenceId, executionRef };
      }),

    // POST /decisions/{id}/reject
    reject: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
        justification: z.string().min(10, "Justification must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.decisionId);
        if (!decision) throw new Error("Decision not found");

        const userRole = normalizeRole(ctx.user.role);
        const decisionType = decision.type;
        
        if (!hasAuthority(userRole, decisionType)) {
          throw new Error(`Insufficient authority. Your role (${userRole}) cannot reject ${decisionType} decisions.`);
        }

        await updateDecision(input.decisionId, {
          status: "REJECTED",
          decidedAt: new Date(),
          decidedBy: ctx.user.email || ctx.user.name || "Unknown",
          justification: input.justification,
        });

        const policy = await getPolicyByCode(decision.policyCode);
        const evidence = await createEvidencePack({
          decisionId: input.decisionId,
          actorId: ctx.user.id,
          actorName: ctx.user.name || "Unknown",
          actorRole: userRole,
          action: "REJECTED",
          justification: input.justification,
          policySnapshot: `${decision.policyCode} v${policy?.version || "1.0"}`,
          policyText: policy?.description || "",
          dualControlRequired: requiresDualControl(decisionType) ? 1 : 0,
          escalationTriggered: 0,
          overrideApplied: 0,
        });

        return { success: true, evidenceId: evidence.evidenceId };
      }),

    // POST /decisions/{id}/escalate
    escalate: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
        justification: z.string().min(10, "Justification must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.decisionId);
        if (!decision) throw new Error("Decision not found");

        const userRole = normalizeRole(ctx.user.role);

        await updateDecision(input.decisionId, {
          status: "ESCALATED",
          decidedAt: new Date(),
          decidedBy: ctx.user.email || ctx.user.name || "Unknown",
          justification: input.justification,
        });

        const policy = await getPolicyByCode(decision.policyCode);
        const evidence = await createEvidencePack({
          decisionId: input.decisionId,
          actorId: ctx.user.id,
          actorName: ctx.user.name || "Unknown",
          actorRole: userRole,
          action: "ESCALATED",
          justification: input.justification,
          policySnapshot: `${decision.policyCode} v${policy?.version || "1.0"}`,
          policyText: policy?.description || "",
          dualControlRequired: requiresDualControl(decision.type) ? 1 : 0,
          escalationTriggered: 1,
          overrideApplied: 0,
        });

        return { success: true, evidenceId: evidence.evidenceId };
      }),
  }),

  // ============================================
  // POLICY ROUTES
  // ============================================
  policies: router({
    list: publicProcedure.query(async () => {
      return listPolicies();
    }),

    get: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return getPolicyByCode(input.code);
      }),

    update: adminProcedure
      .input(z.object({
        code: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        requiredAuthority: z.enum(["SUPERVISOR", "COMPLIANCE", "DUAL"]).optional(),
        riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { code, ...data } = input;
        await updatePolicy(code, data);
        return { success: true };
      }),

    create: adminProcedure
      .input(z.object({
        code: z.string(),
        name: z.string(),
        description: z.string().optional(),
        requiredAuthority: z.enum(["SUPERVISOR", "COMPLIANCE", "DUAL"]),
        riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const policy = await createPolicy(input);
        return policy;
      }),
  }),

  // ============================================
  // EVIDENCE ROUTES
  // GET /evidence/{decisionId}
  // ============================================
  evidence: router({
    list: publicProcedure.query(async () => {
      return listEvidencePacks();
    }),

    get: publicProcedure
      .input(z.object({ evidenceId: z.string() }))
      .query(async ({ input }) => {
        return getEvidencePackById(input.evidenceId);
      }),

    getByDecision: publicProcedure
      .input(z.object({ decisionId: z.string() }))
      .query(async ({ input }) => {
        return getEvidencePackByDecisionId(input.decisionId);
      }),
  }),

  // ============================================
  // AUTHORITY MATRIX ROUTES
  // Read-only access to the authority matrix
  // Changes require a POLICY_CHANGE decision
  // ============================================
  authority: router({
    // GET /system/authority-matrix
    // Returns the full authority matrix with version, hash, and rules
    // This is the authoritative source for the UI
    getMatrix: publicProcedure.query(async () => {
      // Get the matrix response from the shared authority module
      const matrixResponse = getAuthorityMatrixResponse();
      
      // Find the last POLICY_CHANGE decision that was approved
      const policyChangeDecisions = await listDecisions();
      const lastPolicyChange = policyChangeDecisions.find(
        d => d.type === "POLICY_CHANGE" && d.status === "APPROVED"
      );
      
      return {
        ...matrixResponse,
        lastChangeDecisionId: lastPolicyChange?.decisionId || null,
        lastChangeDate: lastPolicyChange?.decidedAt || null,
      };
    }),

    // GET /authority/visibility
    getVisibility: publicProcedure.query(() => {
      return VISIBILITY_MATRIX;
    }),

    // GET /authority/check
    checkAuthority: publicProcedure
      .input(z.object({
        role: z.string(),
        decisionType: z.string(),
      }))
      .query(({ input }) => {
        return {
          hasAuthority: hasAuthority(input.role, input.decisionType),
          requiresDualControl: requiresDualControl(input.decisionType),
        };
      }),

    // GET /authority/governance-history
    // Returns the history of POLICY_CHANGE decisions
    getGovernanceHistory: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
      .query(async ({ input }) => {
        const allDecisions = await listDecisions();
        const policyChanges = allDecisions
          .filter(d => d.type === "POLICY_CHANGE")
          .slice(0, input?.limit || 10);
        
        // Get evidence packs for each decision
        const history = await Promise.all(
          policyChanges.map(async (decision) => {
            const evidence = await getEvidencePackByDecisionId(decision.decisionId);
            return {
              decisionId: decision.decisionId,
              status: decision.status,
              subject: decision.subject,
              approvedBy: decision.decidedBy,
              approvedAt: decision.decidedAt,
              evidenceHash: evidence?.merkleHash || null,
              evidenceId: evidence?.evidenceId || null,
            };
          })
        );
        
        return history;
      }),
  }),

  // ============================================
  // ENTITY ROUTES
  // Multi-entity consolidation support
  // ============================================
  entities: router({
    // GET /entities - List all entities
    list: publicProcedure.query(async () => {
      return listEntities();
    }),

    // GET /entities/{id} - Get entity by ID
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getEntityById(input.id);
      }),

    // POST /entities - Create a new entity (admin only)
    create: adminProcedure
      .input(z.object({
        legalName: z.string().min(3, "Legal name must be at least 3 characters"),
        tradingName: z.string().optional(),
        abn: z.string().optional(),
        status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]).default("ACTIVE"),
      }))
      .mutation(async ({ input }) => {
        const entity = await createEntity(input);
        return { success: true, entityId: entity.entityId };
      }),
  }),

  // ============================================
  // GROUP ROUTES
  // Group = governed aggregation construct (NOT a legal entity)
  // Consolidation is read-only by default
  // Group scope NEVER implies entity authority
  // ============================================
  groups: router({
    // GET /groups - List all groups
    list: publicProcedure.query(async () => {
      return listGroups();
    }),

    // GET /groups/{id} - Get group by ID
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getGroupById(input.id);
      }),

    // GET /groups/{id}/members - Get group members with entity details
    getMembers: publicProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ input }) => {
        return getGroupMembershipsWithEntities(input.groupId);
      }),

    // POST /groups - Create a new group (admin only)
    // This creates a GROUP_CREATE decision that must be approved
    create: adminProcedure
      .input(z.object({
        name: z.string().min(3, "Group name must be at least 3 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create a GROUP_CREATE decision
        const decision = await createDecision({
          type: "GROUP_CREATE",
          subject: `Create Group: ${input.name}`,
          policyCode: "GRP-001",
          risk: "MEDIUM",
          requiredAuthority: "PLATFORM_ADMIN",
          status: "PENDING",
          slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          groupContext: JSON.stringify({ name: input.name }),
        });
        
        return { success: true, decisionId: decision.decisionId };
      }),

    // POST /groups/{id}/add-entity - Request to add entity to group
    // This creates a GROUP_ADD_ENTITY decision that must be approved
    addEntity: adminProcedure
      .input(z.object({
        groupId: z.number(),
        entityId: z.number(),
        reason: z.string().min(10, "Reason must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const group = await getGroupById(input.groupId);
        const entity = await getEntityById(input.entityId);
        
        if (!group) throw new Error("Group not found");
        if (!entity) throw new Error("Entity not found");
        
        // Create a GROUP_ADD_ENTITY decision
        const decision = await createDecision({
          type: "GROUP_ADD_ENTITY",
          subject: `Add ${entity.legalName} to ${group.name}`,
          policyCode: "GRP-002",
          risk: "MEDIUM",
          requiredAuthority: "PLATFORM_ADMIN",
          status: "PENDING",
          slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          groupId: input.groupId,
          entityId: input.entityId,
          groupContext: JSON.stringify({
            targetEntityId: input.entityId,
            targetEntityLegalName: entity.legalName,
            reason: input.reason,
          }),
        });
        
        return { success: true, decisionId: decision.decisionId };
      }),

    // POST /groups/{id}/remove-entity - Request to remove entity from group
    // This creates a GROUP_REMOVE_ENTITY decision that must be approved
    removeEntity: adminProcedure
      .input(z.object({
        groupId: z.number(),
        entityId: z.number(),
        reason: z.string().min(10, "Reason must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const group = await getGroupById(input.groupId);
        const entity = await getEntityById(input.entityId);
        
        if (!group) throw new Error("Group not found");
        if (!entity) throw new Error("Entity not found");
        
        // Create a GROUP_REMOVE_ENTITY decision
        const decision = await createDecision({
          type: "GROUP_REMOVE_ENTITY",
          subject: `Remove ${entity.legalName} from ${group.name}`,
          policyCode: "GRP-003",
          risk: "HIGH",
          requiredAuthority: "PLATFORM_ADMIN",
          status: "PENDING",
          slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          groupId: input.groupId,
          entityId: input.entityId,
          groupContext: JSON.stringify({
            targetEntityId: input.entityId,
            targetEntityLegalName: entity.legalName,
            reason: input.reason,
          }),
        });
        
        return { success: true, decisionId: decision.decisionId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
