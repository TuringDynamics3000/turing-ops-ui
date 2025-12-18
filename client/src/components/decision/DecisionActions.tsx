import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canApprove } from "@/lib/permissions";
import { Decision } from "@/lib/decisions";
import { CheckCircle2, XCircle, AlertOctagon, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface DecisionActionsProps {
  decision: Decision;
}

export function DecisionActions({ decision }: DecisionActionsProps) {
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const hasAuthority = canApprove(decision);

  const handleAction = async (action: "APPROVE" | "REJECT" | "ESCALATE") => {
    if (!justification.trim()) {
      toast.error("Justification Required", {
        description: "You must provide a reason for this decision to generate the evidence pack."
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Decision ${action}D`, {
      description: `Evidence pack generated. Hash: ${Math.random().toString(36).substring(7).toUpperCase()}`
    });
    
    setIsSubmitting(false);
    setLocation("/decisions/inbox");
  };

  if (!hasAuthority) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex items-center gap-4 text-zinc-400">
        <Lock className="h-5 w-5 text-zinc-500" />
        <div>
          <h4 className="font-medium text-zinc-300">Authority Restricted</h4>
          <p className="text-sm mt-1">
            This decision requires <span className="text-white font-mono">{decision.requiredAuthority}</span> authority. 
            You do not have permission to act on this item.
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
        placeholder="Enter justification for audit log (Required)..."
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
          <CheckCircle2 className="mr-2 h-4 w-4" />
          APPROVE
        </Button>
        
        <Button 
          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold tracking-wide"
          onClick={() => handleAction("REJECT")}
          disabled={isSubmitting}
        >
          <XCircle className="mr-2 h-4 w-4" />
          REJECT
        </Button>
        
        <Button 
          variant="outline"
          className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white font-medium"
          onClick={() => handleAction("ESCALATE")}
          disabled={isSubmitting}
        >
          <AlertOctagon className="mr-2 h-4 w-4" />
          ESCALATE
        </Button>
      </div>
      
      <p className="text-[10px] text-zinc-500 text-center font-mono">
        By acting, you cryptographically sign this decision with your key ID.
      </p>
    </div>
  );
}
