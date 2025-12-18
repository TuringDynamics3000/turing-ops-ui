import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, XCircle, AlertOctagon, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

import type { DbDecision } from "@shared/decision-types";

interface DecisionActionsProps {
  decision: DbDecision;
}

export function DecisionActions({ decision }: DecisionActionsProps) {
  const [justification, setJustification] = useState("");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const approveMutation = trpc.decisions.approve.useMutation({
    onSuccess: (data) => {
      toast.success("Decision APPROVED", {
        description: `Evidence pack generated: ${data.evidenceId}`
      });
      utils.decisions.list.invalidate();
      setLocation("/decisions/inbox");
    },
    onError: (error) => {
      toast.error("Action Failed", { description: error.message });
    }
  });

  const rejectMutation = trpc.decisions.reject.useMutation({
    onSuccess: (data) => {
      toast.success("Decision REJECTED", {
        description: `Evidence pack generated: ${data.evidenceId}`
      });
      utils.decisions.list.invalidate();
      setLocation("/decisions/inbox");
    },
    onError: (error) => {
      toast.error("Action Failed", { description: error.message });
    }
  });

  const escalateMutation = trpc.decisions.escalate.useMutation({
    onSuccess: (data) => {
      toast.success("Decision ESCALATED", {
        description: `Evidence pack generated: ${data.evidenceId}`
      });
      utils.decisions.list.invalidate();
      setLocation("/decisions/inbox");
    },
    onError: (error) => {
      toast.error("Action Failed", { description: error.message });
    }
  });

  const isSubmitting = approveMutation.isPending || rejectMutation.isPending || escalateMutation.isPending;

  // Check if user has authority
  const hasAuthority = checkAuthority(user?.role || "user", decision.requiredAuthority);

  const handleAction = async (action: "APPROVE" | "REJECT" | "ESCALATE") => {
    if (!justification.trim() || justification.length < 10) {
      toast.error("Justification Required", {
        description: "You must provide at least 10 characters of justification for the audit log."
      });
      return;
    }

    const payload = { decisionId: decision.decisionId, justification };

    if (action === "APPROVE") {
      approveMutation.mutate(payload);
    } else if (action === "REJECT") {
      rejectMutation.mutate(payload);
    } else {
      escalateMutation.mutate(payload);
    }
  };

  if (!isAuthenticated) {
    return (
      <Explainer
        title="Authentication Required"
        description="You must be authenticated to take action on decisions. Authentication provides the cryptographic identity used to sign decision outcomes."
        advantages={[
          "Every action is cryptographically signed with your identity",
          "Authentication state is verified at action time, not just login",
          "Session tokens cannot be used to forge decision signatures",
        ]}
        legacyComparison={{
          legacy: "Actions often attributed to session user without cryptographic proof. Shared accounts can obscure true actor.",
          turing: "Every action is cryptographically bound to the authenticated principal. No shared accounts, no ambiguity.",
        }}
        side="top"
        showIcon={false}
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex items-center gap-4 text-zinc-400">
          <Lock className="h-5 w-5 text-zinc-500" />
          <div>
            <h4 className="font-medium text-zinc-300">Authentication Required</h4>
            <p className="text-sm mt-1">
              Please log in to take action on this decision.
            </p>
          </div>
        </div>
      </Explainer>
    );
  }

  if (!hasAuthority) {
    return (
      <Explainer
        title="Authority Enforcement"
        description={`This decision requires ${decision.requiredAuthority} authority. The Authority Matrix defines which roles can act on each decision type.`}
        advantages={[
          "Authority is checked at action time, not just UI rendering",
          "Authority requirements are cryptographically enforced",
          "Unauthorized attempts are logged as governance events",
        ]}
        legacyComparison={{
          legacy: "Authority often enforced only at UI level. Backend may accept actions from any authenticated user.",
          turing: "Authority is enforced at the cryptographic layer. The Evidence Pack is invalid without proper authority signature.",
        }}
        side="top"
        showIcon={false}
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex items-center gap-4 text-zinc-400">
          <Lock className="h-5 w-5 text-zinc-500" />
          <div>
            <h4 className="font-medium text-zinc-300">Authority Restricted</h4>
            <p className="text-sm mt-1">
              This decision requires <span className="text-white font-mono">{decision.requiredAuthority}</span> authority. 
              Your role (<span className="text-white font-mono">{user?.role}</span>) does not have permission to act on this item.
            </p>
          </div>
        </div>
      </Explainer>
    );
  }

  return (
    <Explainer {...EXPLAINER_CONTENT.decisionActions} side="top" showIcon={false}>
      <div className="space-y-4 bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          Decision Authority
        </h3>
        
        <Explainer
          title="Justification Requirement"
          description="Every decision action requires a justification that becomes part of the immutable Evidence Pack. This is not optional - it's a regulatory requirement."
          advantages={[
            "Justification is cryptographically sealed with the decision",
            "Cannot be modified or deleted after submission",
            "Minimum length enforced to prevent empty justifications",
          ]}
          legacyComparison={{
            legacy: "Justification often optional or stored in separate comment fields. May be edited or deleted after the fact.",
            turing: "Justification is a required, immutable part of the Evidence Pack. Regulators see exactly what the approver wrote.",
          }}
          side="top"
          showIcon={false}
        >
          <Textarea
            placeholder="Enter justification for audit log (Required, min 10 characters)..."
            className="bg-zinc-950 border-zinc-800 focus:border-orange-500/50 min-h-[100px] font-mono text-sm resize-none"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
          />
        </Explainer>

        <div className="flex items-center gap-3 pt-2">
          <Explainer
            title="APPROVE Action"
            description="Approving this decision authorizes the underlying transaction or change. Your approval signature is cryptographically sealed into the Evidence Pack."
            advantages={[
              "Approval produces immediate Evidence Pack",
              "Your identity is cryptographically bound to the outcome",
              "Approval cannot be revoked - only new decisions can reverse",
            ]}
            legacyComparison={{
              legacy: "Approvals can often be revoked or modified by administrators. Audit trail may not capture the original approver.",
              turing: "Approval is final and cryptographically sealed. The original approver is permanently recorded in evidence.",
            }}
            side="top"
            showIcon={false}
          >
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide"
              onClick={() => handleAction("APPROVE")}
              disabled={isSubmitting}
            >
              {approveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              APPROVE
            </Button>
          </Explainer>
          
          <Explainer
            title="REJECT Action"
            description="Rejecting this decision denies the underlying transaction or change. Your rejection signature is cryptographically sealed into the Evidence Pack."
            advantages={[
              "Rejection produces Evidence Pack with denial reason",
              "Rejected decisions cannot be re-approved - must create new decision",
              "Rejection patterns are tracked for policy optimization",
            ]}
            legacyComparison={{
              legacy: "Rejections often allow re-submission without new decision. Rejection reasons may be editable.",
              turing: "Rejection is final for this decision ID. Re-submission requires a new decision with new evidence chain.",
            }}
            side="top"
            showIcon={false}
          >
            <Button 
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold tracking-wide"
              onClick={() => handleAction("REJECT")}
              disabled={isSubmitting}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              REJECT
            </Button>
          </Explainer>
          
          <Explainer
            title="ESCALATE Action"
            description="Escalating this decision transfers it to a higher authority level. Your escalation signature and reason are cryptographically sealed."
            advantages={[
              "Escalation preserves full decision context",
              "Escalation reason becomes part of evidence chain",
              "Escalation patterns inform authority matrix optimization",
            ]}
            legacyComparison={{
              legacy: "Escalation often via email or chat with context loss. No structured record of why escalation occurred.",
              turing: "Escalation is a governed event. Full context preserved, reason recorded, and target authority notified.",
            }}
            side="top"
            showIcon={false}
          >
            <Button 
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white font-medium"
              onClick={() => handleAction("ESCALATE")}
              disabled={isSubmitting}
            >
              {escalateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertOctagon className="mr-2 h-4 w-4" />
              )}
              ESCALATE
            </Button>
          </Explainer>
        </div>
        
        <Explainer
          title="Cryptographic Signature"
          description="When you act on this decision, your action is cryptographically signed with your key ID. This signature proves you authorized the action and cannot be forged."
          advantages={[
            "SHA-256 signature bound to your identity",
            "Signature includes decision ID, action, timestamp, and justification",
            "Signature can be independently verified without system access",
          ]}
          legacyComparison={{
            legacy: "Actions attributed to usernames without cryptographic proof. Signatures, if present, often stored separately from audit logs.",
            turing: "Cryptographic signature is embedded in the Evidence Pack. Any auditor can verify the signature without trusting the system.",
          }}
          side="top"
          showIcon={false}
        >
          <p className="text-[10px] text-zinc-500 text-center font-mono cursor-help">
            By acting, you cryptographically sign this decision with your key ID ({user?.openId?.slice(0, 8)}...).
          </p>
        </Explainer>
      </div>
    </Explainer>
  );
}

// Helper function to check authority
function checkAuthority(userRole: string, requiredAuthority: string): boolean {
  const authorityMap: Record<string, string[]> = {
    "admin": ["SUPERVISOR", "COMPLIANCE", "DUAL", "PLATFORM_ADMIN"],
    "supervisor": ["SUPERVISOR"],
    "compliance": ["COMPLIANCE"],
    "operator": [],
    "user": [],
  };

  const userAuthorities = authorityMap[userRole] || [];
  
  if (requiredAuthority === "DUAL") {
    return userAuthorities.includes("SUPERVISOR") || userAuthorities.includes("COMPLIANCE");
  }

  return userAuthorities.includes(requiredAuthority);
}
