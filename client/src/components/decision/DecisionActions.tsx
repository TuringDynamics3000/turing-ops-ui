import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, XCircle, AlertOctagon, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// Database Decision type from API
interface DbDecision {
  id: number;
  decisionId: string;
  type: "PAYMENT" | "LIMIT_OVERRIDE" | "AML_EXCEPTION" | "POLICY_CHANGE";
  subject: string;
  policyCode: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiredAuthority: "SUPERVISOR" | "COMPLIANCE" | "DUAL";
  status: "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED" | "EXECUTED";
  slaDeadline: Date;
  amount: string | null;
  beneficiary: string | null;
  context: string | null;
  decidedAt: Date | null;
  decidedBy: string | null;
  justification: string | null;
  executionRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex items-center gap-4 text-zinc-400">
        <Lock className="h-5 w-5 text-zinc-500" />
        <div>
          <h4 className="font-medium text-zinc-300">Authentication Required</h4>
          <p className="text-sm mt-1">
            Please log in to take action on this decision.
          </p>
        </div>
      </div>
    );
  }

  if (!hasAuthority) {
    return (
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
    );
  }

  return (
    <div className="space-y-4 bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
        Decision Authority
      </h3>
      
      <Textarea
        placeholder="Enter justification for audit log (Required, min 10 characters)..."
        className="bg-zinc-950 border-zinc-800 focus:border-orange-500/50 min-h-[100px] font-mono text-sm resize-none"
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
      />

      <div className="flex items-center gap-3 pt-2">
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
      </div>
      
      <p className="text-[10px] text-zinc-500 text-center font-mono">
        By acting, you cryptographically sign this decision with your key ID ({user?.openId?.slice(0, 8)}...).
      </p>
    </div>
  );
}

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
    return userAuthorities.includes("SUPERVISOR") || userAuthorities.includes("COMPLIANCE");
  }

  return userAuthorities.includes(requiredAuthority);
}
