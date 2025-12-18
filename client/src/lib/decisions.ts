export type DecisionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ESCALATED"
  | "EXECUTING"
  | "COMPLETED";

export type DecisionType = "PAYMENT" | "LIMIT_OVERRIDE" | "AML_EXCEPTION";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RequiredAuthority = "SUPERVISOR" | "COMPLIANCE" | "DUAL";

export interface Decision {
  id: string;
  type: DecisionType;
  subject: string;
  policy: string;
  risk: RiskLevel;
  requiredAuthority: RequiredAuthority;
  status: DecisionStatus;
  slaSecondsRemaining: number;
  amount?: string;
  beneficiary?: string;
  created_at: string;
}

export const MOCK_DECISIONS: Decision[] = [
  {
    id: "DEC-2024-001",
    type: "PAYMENT",
    subject: "Payment Approval: £40,000 → External Beneficiary",
    policy: "PAY-004",
    risk: "MEDIUM",
    requiredAuthority: "SUPERVISOR",
    status: "PENDING",
    slaSecondsRemaining: 72,
    amount: "£40,000",
    beneficiary: "Acme Corp Ltd.",
    created_at: "2024-12-19T10:00:00Z",
  },
  {
    id: "DEC-2024-002",
    type: "LIMIT_OVERRIDE",
    subject: "Limit Override: Daily outgoing exceeded",
    policy: "LIM-001",
    risk: "HIGH",
    requiredAuthority: "DUAL",
    status: "PENDING",
    slaSecondsRemaining: 22,
    created_at: "2024-12-19T10:05:00Z",
  },
  {
    id: "DEC-2024-003",
    type: "AML_EXCEPTION",
    subject: "AML Flag: High velocity transaction pattern",
    policy: "AML-009",
    risk: "CRITICAL",
    requiredAuthority: "COMPLIANCE",
    status: "PENDING",
    slaSecondsRemaining: 300,
    created_at: "2024-12-19T09:45:00Z",
  },
];
