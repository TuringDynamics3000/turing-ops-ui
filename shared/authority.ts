/**
 * Turing Decision Governance - Authority Matrix
 * 
 * This is the backbone of trust.
 * It must be explicit, inspectable, versioned, and governed.
 * 
 * IMPORTANT: This file is the SINGLE SOURCE OF TRUTH for authority rules.
 * - Runtime enforcement uses this
 * - Decision API validates against this
 * - UI renders based on this
 * 
 * Any change to this matrix MUST go through a POLICY_CHANGE decision.
 */

export type Role =
  | "OPERATOR"
  | "SUPERVISOR"
  | "COMPLIANCE"
  | "PLATFORM_ADMIN";

export type DecisionType =
  | "PAYMENT"
  | "LIMIT_OVERRIDE"
  | "AML_EXCEPTION"
  | "POLICY_CHANGE";

export interface AuthorityRule {
  decisionType: DecisionType;
  allowedRoles: Role[];
  dualControl: boolean;
  escalationRoles: Role[];
  description: string;
  policyCode: string; // Reference to governing policy
}

/**
 * Authority Matrix Metadata
 * This metadata is included in Evidence Packs to prove which version
 * of the matrix was in effect when a decision was made.
 */
export const AUTHORITY_MATRIX_VERSION = "2025-02-18";
export const AUTHORITY_MATRIX_EFFECTIVE_FROM = "2025-02-18T00:00:00Z";

/**
 * The canonical Authority Matrix.
 * Changes to this matrix must:
 * 1. Create a POLICY_CHANGE Decision
 * 2. Require dual control
 * 3. Produce an Evidence Pack
 * 4. Update the version and hash
 */
export const AUTHORITY_MATRIX: AuthorityRule[] = [
  {
    decisionType: "PAYMENT",
    allowedRoles: ["SUPERVISOR", "PLATFORM_ADMIN"],
    dualControl: false,
    escalationRoles: [],
    description: "Standard and high-value payment approvals",
    policyCode: "PAY-004"
  },
  {
    decisionType: "LIMIT_OVERRIDE",
    allowedRoles: ["COMPLIANCE", "PLATFORM_ADMIN"],
    dualControl: true,
    escalationRoles: ["PLATFORM_ADMIN"],
    description: "Daily/transaction limit overrides",
    policyCode: "LIM-002"
  },
  {
    decisionType: "AML_EXCEPTION",
    allowedRoles: ["COMPLIANCE"],
    dualControl: true,
    escalationRoles: ["PLATFORM_ADMIN"],
    description: "AML flag exceptions and reviews",
    policyCode: "AML-007"
  },
  {
    decisionType: "POLICY_CHANGE",
    allowedRoles: ["PLATFORM_ADMIN"],
    dualControl: true,
    escalationRoles: [],
    description: "Policy and authority matrix modifications",
    policyCode: "GOV-001"
  }
];

/**
 * Generate a deterministic hash of the Authority Matrix.
 * This hash is used in Evidence Packs to prove which version
 * of the matrix was in effect when a decision was made.
 * 
 * Note: In production, this would use a proper cryptographic hash.
 * For the frontend, we use a simple deterministic string hash.
 */
export function getAuthorityMatrixHash(): string {
  const content = JSON.stringify({
    version: AUTHORITY_MATRIX_VERSION,
    rules: AUTHORITY_MATRIX.map(r => ({
      decisionType: r.decisionType,
      allowedRoles: r.allowedRoles.sort(),
      dualControl: r.dualControl,
      escalationRoles: r.escalationRoles.sort()
    }))
  });
  
  // Simple hash function for frontend (production would use SHA-256)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + 
         'ab' + 
         Math.abs(hash >> 8).toString(16).padStart(6, '0');
}

/**
 * Get the full Authority Matrix response for the API.
 * This is the authoritative source for the UI.
 */
export interface AuthorityMatrixResponse {
  version: string;
  effectiveFrom: string;
  hash: string;
  rules: AuthorityRule[];
}

export function getAuthorityMatrixResponse(): AuthorityMatrixResponse {
  return {
    version: AUTHORITY_MATRIX_VERSION,
    effectiveFrom: AUTHORITY_MATRIX_EFFECTIVE_FROM,
    hash: getAuthorityMatrixHash(),
    rules: AUTHORITY_MATRIX
  };
}

/**
 * Runtime authority enforcement.
 * This function is the single source of truth for access control.
 */
export function hasAuthority(
  role: Role | string,
  decisionType: DecisionType | string
): boolean {
  const rule = AUTHORITY_MATRIX.find(
    r => r.decisionType === decisionType
  );
  return rule ? rule.allowedRoles.includes(role as Role) : false;
}

/**
 * Check if a decision type requires dual control.
 */
export function requiresDualControl(decisionType: DecisionType | string): boolean {
  const rule = AUTHORITY_MATRIX.find(
    r => r.decisionType === decisionType
  );
  return rule?.dualControl ?? false;
}

/**
 * Get escalation roles for a decision type.
 */
export function getEscalationRoles(decisionType: DecisionType | string): Role[] {
  const rule = AUTHORITY_MATRIX.find(
    r => r.decisionType === decisionType
  );
  return rule?.escalationRoles ?? [];
}

/**
 * Get the authority rule for a decision type.
 */
export function getAuthorityRule(decisionType: DecisionType | string): AuthorityRule | undefined {
  return AUTHORITY_MATRIX.find(r => r.decisionType === decisionType);
}

/**
 * Role-based visibility matrix for UI components.
 * No hidden functionality. No "trust the user".
 */
export const VISIBILITY_MATRIX: Record<string, Record<Role, boolean>> = {
  "Decision Inbox": {
    OPERATOR: true,
    SUPERVISOR: true,
    COMPLIANCE: true,
    PLATFORM_ADMIN: true
  },
  "Decision Actions": {
    OPERATOR: false,
    SUPERVISOR: true,
    COMPLIANCE: true,
    PLATFORM_ADMIN: true
  },
  "Payments Ledger": {
    OPERATOR: true,
    SUPERVISOR: true,
    COMPLIANCE: true,
    PLATFORM_ADMIN: true
  },
  "Evidence Packs": {
    OPERATOR: false,
    SUPERVISOR: true,
    COMPLIANCE: true,
    PLATFORM_ADMIN: true
  },
  "Limits & Overrides": {
    OPERATOR: false,
    SUPERVISOR: false,
    COMPLIANCE: true,
    PLATFORM_ADMIN: true
  },
  "Configuration": {
    OPERATOR: false,
    SUPERVISOR: false,
    COMPLIANCE: false,
    PLATFORM_ADMIN: true
  }
};

/**
 * Check if a role has visibility to a UI area.
 */
export function hasVisibility(role: Role | string, area: string): boolean {
  const areaVisibility = VISIBILITY_MATRIX[area];
  if (!areaVisibility) return false;
  return areaVisibility[role as Role] ?? false;
}

/**
 * Map legacy role names to formal Role type.
 */
export function normalizeRole(role: string): Role {
  const roleMap: Record<string, Role> = {
    "admin": "PLATFORM_ADMIN",
    "supervisor": "SUPERVISOR",
    "compliance": "COMPLIANCE",
    "operator": "OPERATOR",
    "user": "OPERATOR",
    "ADMIN": "PLATFORM_ADMIN",
    "SUPERVISOR": "SUPERVISOR",
    "COMPLIANCE": "COMPLIANCE",
    "OPERATOR": "OPERATOR",
    "PLATFORM_ADMIN": "PLATFORM_ADMIN"
  };
  return roleMap[role] || "OPERATOR";
}

/**
 * Format role for display (human-readable).
 */
export function formatRole(role: Role): string {
  const roleNames: Record<Role, string> = {
    OPERATOR: "Operator",
    SUPERVISOR: "Supervisor",
    COMPLIANCE: "Compliance",
    PLATFORM_ADMIN: "Admin"
  };
  return roleNames[role] || role;
}

/**
 * Format decision type for display (human-readable).
 */
export function formatDecisionType(type: DecisionType): string {
  const typeNames: Record<DecisionType, string> = {
    PAYMENT: "Payment",
    LIMIT_OVERRIDE: "Limit Override",
    AML_EXCEPTION: "AML Exception",
    POLICY_CHANGE: "Policy Change"
  };
  return typeNames[type] || type;
}
