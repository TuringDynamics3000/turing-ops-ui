import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  listDecisions, getDecisionById, updateDecisionStatus, createDecision,
  listPolicies, getPolicyByCode, updatePolicy, createPolicy,
  listEvidencePacks, getEvidencePackById, getEvidencePackByDecisionId, createEvidencePack,
  seedInitialData
} from "./db";

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
  // DECISION ROUTES
  // ============================================
  decisions: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return listDecisions(input?.status);
      }),

    get: publicProcedure
      .input(z.object({ decisionId: z.string() }))
      .query(async ({ input }) => {
        return getDecisionById(input.decisionId);
      }),

    approve: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
        justification: z.string().min(10, "Justification must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.decisionId);
        if (!decision) throw new Error("Decision not found");

        // Check authority
        const userRole = ctx.user.role;
        const hasAuthority = checkAuthority(userRole, decision.requiredAuthority);
        if (!hasAuthority) {
          throw new Error(`Insufficient authority. Required: ${decision.requiredAuthority}`);
        }

        // Update decision status
        await updateDecisionStatus(input.decisionId, "APPROVED");

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
          ledgerId: `TXN-${Date.now()}-X`,
        });

        return { success: true, evidenceId: evidence.evidenceId };
      }),

    reject: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
        justification: z.string().min(10, "Justification must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.decisionId);
        if (!decision) throw new Error("Decision not found");

        const userRole = ctx.user.role;
        const hasAuthority = checkAuthority(userRole, decision.requiredAuthority);
        if (!hasAuthority) {
          throw new Error(`Insufficient authority. Required: ${decision.requiredAuthority}`);
        }

        await updateDecisionStatus(input.decisionId, "REJECTED");

        const policy = await getPolicyByCode(decision.policyCode);
        const evidence = await createEvidencePack({
          decisionId: input.decisionId,
          actorId: ctx.user.id,
          actorName: ctx.user.name || "Unknown",
          actorRole: userRole,
          action: "REJECTED",
          justification: input.justification,
          policySnapshot: `${decision.policyCode} v${policy?.version || "1.0"}`,
        });

        return { success: true, evidenceId: evidence.evidenceId };
      }),

    escalate: protectedProcedure
      .input(z.object({
        decisionId: z.string(),
        justification: z.string().min(10, "Justification must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.decisionId);
        if (!decision) throw new Error("Decision not found");

        await updateDecisionStatus(input.decisionId, "ESCALATED");

        const policy = await getPolicyByCode(decision.policyCode);
        const evidence = await createEvidencePack({
          decisionId: input.decisionId,
          actorId: ctx.user.id,
          actorName: ctx.user.name || "Unknown",
          actorRole: ctx.user.role,
          action: "ESCALATED",
          justification: input.justification,
          policySnapshot: `${decision.policyCode} v${policy?.version || "1.0"}`,
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
});

// Helper function to check authority
function checkAuthority(userRole: string, requiredAuthority: string): boolean {
  const authorityMap: Record<string, string[]> = {
    "admin": ["SUPERVISOR", "COMPLIANCE", "DUAL"],
    "supervisor": ["SUPERVISOR"],
    "compliance": ["COMPLIANCE"],
    "operator": [],
    "user": [],
  };

  const userAuthorities = authorityMap[userRole] || [];
  
  if (requiredAuthority === "DUAL") {
    // For DUAL, we'd need two approvals - simplified here
    return userAuthorities.includes("SUPERVISOR") || userAuthorities.includes("COMPLIANCE");
  }

  return userAuthorities.includes(requiredAuthority);
}

export type AppRouter = typeof appRouter;
