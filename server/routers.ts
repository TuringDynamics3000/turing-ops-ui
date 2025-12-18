import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  listDecisions, getDecisionById, updateDecision, createDecision,
  listPolicies, getPolicyByCode, updatePolicy, createPolicy,
  listEvidencePacks, getEvidencePackById, getEvidencePackByDecisionId, createEvidencePack,
  seedInitialData
} from "./db";
import { hasAuthority, normalizeRole, requiresDualControl, AUTHORITY_MATRIX, VISIBILITY_MATRIX } from "@shared/authority";

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
    getMatrix: publicProcedure.query(() => {
      return AUTHORITY_MATRIX;
    }),

    getVisibility: publicProcedure.query(() => {
      return VISIBILITY_MATRIX;
    }),

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
  }),
});

export type AppRouter = typeof appRouter;
