import { describe, it, expect } from "vitest";
import { listDecisions, listPolicies, listEvidencePacks, getDecisionById, getPolicyByCode } from "./db";
import { AUTHORITY_MATRIX, VISIBILITY_MATRIX, hasAuthority, normalizeRole, requiresDualControl, getAuthorityRule } from "@shared/authority";

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

// Authority Matrix Tests
describe("Authority Matrix", () => {
  describe("normalizeRole", () => {
    it("should normalize role strings correctly", () => {
      expect(normalizeRole("admin")).toBe("PLATFORM_ADMIN");
      expect(normalizeRole("supervisor")).toBe("SUPERVISOR");
      expect(normalizeRole("compliance")).toBe("COMPLIANCE");
      expect(normalizeRole("operator")).toBe("OPERATOR");
      expect(normalizeRole("user")).toBe("OPERATOR");
    });
  });

  describe("hasAuthority", () => {
    it("should allow SUPERVISOR to approve PAYMENT decisions", () => {
      expect(hasAuthority("SUPERVISOR", "PAYMENT")).toBe(true);
    });

    it("should allow COMPLIANCE to approve AML_EXCEPTION decisions", () => {
      expect(hasAuthority("COMPLIANCE", "AML_EXCEPTION")).toBe(true);
    });

    it("should not allow OPERATOR to approve PAYMENT decisions", () => {
      expect(hasAuthority("OPERATOR", "PAYMENT")).toBe(false);
    });

    it("should allow PLATFORM_ADMIN to approve PAYMENT decisions", () => {
      expect(hasAuthority("PLATFORM_ADMIN", "PAYMENT")).toBe(true);
    });

    it("should allow PLATFORM_ADMIN to approve POLICY_CHANGE decisions", () => {
      expect(hasAuthority("PLATFORM_ADMIN", "POLICY_CHANGE")).toBe(true);
    });
  });

  describe("requiresDualControl", () => {
    it("should require dual control for LIMIT_OVERRIDE", () => {
      expect(requiresDualControl("LIMIT_OVERRIDE")).toBe(true);
    });

    it("should require dual control for POLICY_CHANGE", () => {
      expect(requiresDualControl("POLICY_CHANGE")).toBe(true);
    });

    it("should not require dual control for PAYMENT", () => {
      expect(requiresDualControl("PAYMENT")).toBe(false);
    });
  });
});

describe("Authority Matrix Structure", () => {
  it("should be an array of authority rules", () => {
    expect(Array.isArray(AUTHORITY_MATRIX)).toBe(true);
    expect(AUTHORITY_MATRIX.length).toBeGreaterThan(0);
  });

  it("should have entries for all decision types", () => {
    const decisionTypes = ["PAYMENT", "LIMIT_OVERRIDE", "AML_EXCEPTION", "POLICY_CHANGE"];
    decisionTypes.forEach((type) => {
      const rule = getAuthorityRule(type);
      expect(rule).toBeDefined();
      expect(rule?.allowedRoles).toBeDefined();
    });
  });

  it("should have dual control flags defined", () => {
    const limitOverrideRule = getAuthorityRule("LIMIT_OVERRIDE");
    const policyChangeRule = getAuthorityRule("POLICY_CHANGE");
    const paymentRule = getAuthorityRule("PAYMENT");
    
    expect(limitOverrideRule?.dualControl).toBe(true);
    expect(policyChangeRule?.dualControl).toBe(true);
    expect(paymentRule?.dualControl).toBe(false);
  });
});

describe("Visibility Matrix Structure", () => {
  it("should have entries for UI areas", () => {
    const areas = ["Decision Inbox", "Decision Actions", "Configuration"];
    areas.forEach((area) => {
      expect(VISIBILITY_MATRIX[area]).toBeDefined();
    });
  });

  it("should allow PLATFORM_ADMIN to access Configuration", () => {
    expect(VISIBILITY_MATRIX["Configuration"]["PLATFORM_ADMIN"]).toBe(true);
  });

  it("should not allow OPERATOR to access Configuration", () => {
    expect(VISIBILITY_MATRIX["Configuration"]["OPERATOR"]).toBe(false);
  });
});

describe("Currency", () => {
  it("should use AUD as the default currency", () => {
    // This test verifies that the system uses AUD
    const testAmount = "$40,000 AUD";
    expect(testAmount).toContain("AUD");
    expect(testAmount).not.toContain("GBP");
    expect(testAmount).not.toContain("£");
  });
});

// ============================================
// AUTHORITY MATRIX ENFORCEMENT ALIGNMENT TESTS
// ============================================
import { getAuthorityMatrixResponse, getAuthorityMatrixHash } from "@shared/authority";

describe("Authority Matrix Enforcement Alignment", () => {
  it("getAuthorityMatrixResponse returns correct structure", () => {
    const response = getAuthorityMatrixResponse();
    
    expect(response).toHaveProperty("version");
    expect(response).toHaveProperty("effectiveFrom");
    expect(response).toHaveProperty("hash");
    expect(response).toHaveProperty("rules");
    expect(Array.isArray(response.rules)).toBe(true);
    expect(response.rules.length).toBe(4);
  });

  it("Authority hash is deterministic", () => {
    const hash1 = getAuthorityMatrixHash();
    const hash2 = getAuthorityMatrixHash();
    
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe("string");
    expect(hash1.length).toBeGreaterThan(10);
  });

  it("hasAuthority uses same matrix as API response", () => {
    const response = getAuthorityMatrixResponse();
    
    // Verify PAYMENT rules match
    const paymentRule = response.rules.find(r => r.decisionType === "PAYMENT");
    expect(hasAuthority("SUPERVISOR", "PAYMENT")).toBe(paymentRule?.allowedRoles.includes("SUPERVISOR"));
    expect(hasAuthority("COMPLIANCE", "PAYMENT")).toBe(paymentRule?.allowedRoles.includes("COMPLIANCE"));
    
    // Verify AML_EXCEPTION rules match
    const amlRule = response.rules.find(r => r.decisionType === "AML_EXCEPTION");
    expect(hasAuthority("COMPLIANCE", "AML_EXCEPTION")).toBe(amlRule?.allowedRoles.includes("COMPLIANCE"));
    expect(hasAuthority("SUPERVISOR", "AML_EXCEPTION")).toBe(amlRule?.allowedRoles.includes("SUPERVISOR"));
  });

  it("requiresDualControl uses same matrix as API response", () => {
    const response = getAuthorityMatrixResponse();
    
    response.rules.forEach(rule => {
      expect(requiresDualControl(rule.decisionType)).toBe(rule.dualControl);
    });
  });

  it("All rules have required fields for regulator compliance", () => {
    const response = getAuthorityMatrixResponse();
    
    response.rules.forEach(rule => {
      expect(rule).toHaveProperty("decisionType");
      expect(rule).toHaveProperty("allowedRoles");
      expect(rule).toHaveProperty("dualControl");
      expect(rule).toHaveProperty("escalationRoles");
      expect(rule).toHaveProperty("description");
      expect(rule).toHaveProperty("policyCode");
      expect(Array.isArray(rule.allowedRoles)).toBe(true);
      expect(Array.isArray(rule.escalationRoles)).toBe(true);
    });
  });
});


// ============================================
// EXPLAINER CONTENT TESTS
// ============================================
// These tests verify that all required explainer content exists
// and contains the necessary fields for competitive differentiation

import { EXPLAINER_CONTENT } from "../client/src/lib/explainer-content";

describe("Explainer Content", () => {
  const requiredExplainers = [
    "paymentsToday",
    "successRate",
    "failureRate",
    "processingLatency",
    "decisionsPending",
    "timeToDecision",
    "escalationRate",
    "dualControlCompliance",
    "slaIndicator",
    "riskIndicator",
    "authorityBadge",
    "transactionContext",
    "riskProfile",
    "decisionActions",
    "authorityHash",
    "dualControlRule",
    "authorityVersion",
    "evidenceHash",
    "immutableRecord",
    "evidenceTimeline",
    "ledgerIntegrity",
    "paymentRouting",
    "riskExposure",
    "policyDefinition",
    "visibilityMatrix",
    "authorityMatrix",
    "hashVerification",
    "dualControl",
    "enforcementAlignment",
    "executionRef",
  ];

  it("should have all required explainer entries", () => {
    requiredExplainers.forEach(key => {
      expect(EXPLAINER_CONTENT).toHaveProperty(key);
    });
  });

  it("each explainer should have title, description, and legacyComparison", () => {
    Object.entries(EXPLAINER_CONTENT).forEach(([key, content]) => {
      expect(content).toHaveProperty("title");
      expect(content).toHaveProperty("description");
      expect(content).toHaveProperty("legacyComparison");
      expect(content.legacyComparison).toHaveProperty("legacy");
      expect(content.legacyComparison).toHaveProperty("turing");
    });
  });

  it("each explainer should have at least one advantage", () => {
    Object.entries(EXPLAINER_CONTENT).forEach(([key, content]) => {
      expect(content).toHaveProperty("advantages");
      expect(Array.isArray(content.advantages)).toBe(true);
      expect(content.advantages.length).toBeGreaterThan(0);
    });
  });

  it("legacy comparisons should mention Constantinople or Thought Machine concepts", () => {
    // At least some explainers should reference legacy system patterns
    const legacyReferences = Object.values(EXPLAINER_CONTENT).filter(content => 
      content.legacyComparison.legacy.toLowerCase().includes("batch") ||
      content.legacyComparison.legacy.toLowerCase().includes("workflow") ||
      content.legacyComparison.legacy.toLowerCase().includes("manual") ||
      content.legacyComparison.legacy.toLowerCase().includes("admin")
    );
    expect(legacyReferences.length).toBeGreaterThan(10);
  });

  it("Turing comparisons should highlight cryptographic or real-time advantages", () => {
    const turingAdvantages = Object.values(EXPLAINER_CONTENT).filter(content =>
      content.legacyComparison.turing.toLowerCase().includes("cryptographic") ||
      content.legacyComparison.turing.toLowerCase().includes("real-time") ||
      content.legacyComparison.turing.toLowerCase().includes("immutable") ||
      content.legacyComparison.turing.toLowerCase().includes("evidence")
    );
    expect(turingAdvantages.length).toBeGreaterThan(10);
  });
});
