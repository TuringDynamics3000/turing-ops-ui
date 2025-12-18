/**
 * Shared Decision Types
 * Single source of truth for decision-related types across client and server.
 */

// Decision types including group governance decisions
export type DecisionType = 
  | "PAYMENT" 
  | "LIMIT_OVERRIDE" 
  | "AML_EXCEPTION" 
  | "POLICY_CHANGE"
  | "GROUP_CREATE"
  | "GROUP_ADD_ENTITY"
  | "GROUP_REMOVE_ENTITY"
  | "GROUP_ROLE_ASSIGN";

// Authority levels including platform admin for group operations
export type AuthorityLevel = "SUPERVISOR" | "COMPLIANCE" | "DUAL" | "PLATFORM_ADMIN";

// Risk levels
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Decision status
export type DecisionStatus = "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED" | "EXECUTED";

// Database Decision type from API
export interface DbDecision {
  id: number;
  decisionId: string;
  entityId: number | null;
  groupId: number | null;
  type: DecisionType;
  subject: string;
  policyCode: string;
  risk: RiskLevel;
  requiredAuthority: AuthorityLevel;
  status: DecisionStatus;
  slaDeadline: Date;
  amount: string | null;
  beneficiary: string | null;
  context: string | null;
  groupContext: string | null;
  decidedAt: Date | null;
  decidedBy: string | null;
  justification: string | null;
  executionRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Group context for GROUP_* decision types
export interface GroupContext {
  name?: string;
  targetEntityId?: number;
  targetEntityLegalName?: string;
  targetUserId?: number;
  targetUserName?: string;
  targetRole?: string;
  reason?: string;
}

// Entity scope for auth context
export interface EntityScope {
  entityId: number;
  entityLegalName: string;
  role: string;
}

// Group scope for auth context
export interface GroupScope {
  groupId: number;
  groupName: string;
  role: string;
}

// Auth context with entity and group scopes
export interface AuthContext {
  userId: number;
  userName: string;
  platformRole: string;
  entityScopes: EntityScope[];
  groupScopes: GroupScope[];
}

// Helper to check if decision type is group-related
export function isGroupDecisionType(type: DecisionType): boolean {
  return type.startsWith("GROUP_");
}

// Helper to get display name for decision type
export function getDecisionTypeDisplayName(type: DecisionType): string {
  const names: Record<DecisionType, string> = {
    PAYMENT: "Payment",
    LIMIT_OVERRIDE: "Limit Override",
    AML_EXCEPTION: "AML Exception",
    POLICY_CHANGE: "Policy Change",
    GROUP_CREATE: "Group Creation",
    GROUP_ADD_ENTITY: "Add Entity to Group",
    GROUP_REMOVE_ENTITY: "Remove Entity from Group",
    GROUP_ROLE_ASSIGN: "Assign Group Role",
  };
  return names[type] || type;
}
