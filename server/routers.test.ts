import { describe, it, expect, beforeAll } from "vitest";
import { listDecisions, listPolicies, listEvidencePacks, getDecisionById, getPolicyByCode } from "./db";

describe("Decisions API", () => {
  it("should list all decisions", async () => {
    const decisions = await listDecisions();
    expect(Array.isArray(decisions)).toBe(true);
  });

  it("should list pending decisions", async () => {
    const decisions = await listDecisions("PENDING");
    expect(Array.isArray(decisions)).toBe(true);
    decisions.forEach(d => {
      expect(d.status).toBe("PENDING");
    });
  });

  it("should get a decision by ID if it exists", async () => {
    const decisions = await listDecisions();
    if (decisions.length > 0) {
      const decision = await getDecisionById(decisions[0].decisionId);
      expect(decision).toBeDefined();
      expect(decision?.decisionId).toBe(decisions[0].decisionId);
    }
  });

  it("should return undefined for non-existent decision", async () => {
    const decision = await getDecisionById("NON-EXISTENT-ID");
    expect(decision).toBeUndefined();
  });
});

describe("Policies API", () => {
  it("should list all policies", async () => {
    const policies = await listPolicies();
    expect(Array.isArray(policies)).toBe(true);
  });

  it("should get a policy by code if it exists", async () => {
    const policies = await listPolicies();
    if (policies.length > 0) {
      const policy = await getPolicyByCode(policies[0].code);
      expect(policy).toBeDefined();
      expect(policy?.code).toBe(policies[0].code);
    }
  });

  it("should return undefined for non-existent policy", async () => {
    const policy = await getPolicyByCode("NON-EXISTENT-CODE");
    expect(policy).toBeUndefined();
  });
});

describe("Evidence API", () => {
  it("should list all evidence packs", async () => {
    const evidence = await listEvidencePacks();
    expect(Array.isArray(evidence)).toBe(true);
  });
});
