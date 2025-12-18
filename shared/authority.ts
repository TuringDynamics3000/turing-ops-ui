/**
 * Turing Decision Governance - Authority Matrix
 * 
 * This is the backbone of trust.
 * It must be explicit, inspectable, versioned, and governed.
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
  escalationRoles?: Role[];
  description: string;
}

/**
 * The canonical Authority Matrix.
 * Changes to this matrix must:
 * 1. Create a Decision
 * 2. Require dual control
 * 3. Produce an Evidence Pack
 */
export const AUTHORITY_MATRIX: AuthorityRule[] = [
  {
    decisionType: "PAYMENT",
    allowedRoles: ["SUPERVISOR", "PLATFORM_ADMIN"],
    dualControl: false,
    description: "Standard and high-value payment approvals"
  },
  {
    decisionType: "LIMIT_OVERRIDE",
    allowedRoles: ["COMPLIANCE", "PLATFORM_ADMIN"],
    dualControl: true,
    escalationRoles: ["PLATFORM_ADMIN"],
    description: "Daily/transaction limit overrides"
  },
  {
    decisionType: "AML_EXCEPTION",
    allowedRoles: ["COMPLIANCE"],
    dualControl: true,
    escalationRoles: ["PLATFORM_ADMIN"],
    description: "AML flag exceptions and reviews"
  },
  {
    decisionType: "POLICY_CHANGE",
    allowedRoles: ["PLATFORM_ADMIN"],
    dualControl: true,
    description: "Policy and authority matrix modifications"
  }
];

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
