import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Lock, Plus, Edit2, Loader2, AlertTriangle, CheckCircle2, XCircle, Users } from "lucide-react";
import { toast } from "sonner";

export default function ConfigPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: policies, isLoading: policiesLoading } = trpc.policies.list.useQuery();
  const { data: authorityMatrix } = trpc.authority.getMatrix.useQuery();
  const { data: visibilityMatrix } = trpc.authority.getVisibility.useQuery();
  const utils = trpc.useUtils();
  
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [newPolicyOpen, setNewPolicyOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const updatePolicyMutation = trpc.policies.update.useMutation({
    onSuccess: () => {
      toast.success("Policy Updated");
      utils.policies.list.invalidate();
      setEditingPolicy(null);
    },
    onError: (error) => {
      toast.error("Update Failed", { description: error.message });
    }
  });

  const createPolicyMutation = trpc.policies.create.useMutation({
    onSuccess: () => {
      toast.success("Policy Created");
      utils.policies.list.invalidate();
      setNewPolicyOpen(false);
    },
    onError: (error) => {
      toast.error("Creation Failed", { description: error.message });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
        <Lock className="h-12 w-12 text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
        <p>Please log in to access system configuration.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p>Only Platform Administrators can access system configuration.</p>
        <p className="text-sm mt-2">Your current role: <span className="font-mono text-white">{user?.role}</span></p>
      </div>
    );
  }

  if (policiesLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const riskColors: Record<string, string> = {
    LOW: "bg-emerald-900/50 text-emerald-400",
    MEDIUM: "bg-amber-900/50 text-amber-400",
    HIGH: "bg-orange-900/50 text-orange-400",
    CRITICAL: "bg-rose-900/50 text-rose-400",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="h-6 w-6 text-zinc-400" />
            System Configuration
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage policies, authority matrices, and system parameters.
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-700 text-emerald-400">
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="policies" className="data-[state=active]:bg-zinc-800">
            <Shield className="mr-2 h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="authority" className="data-[state=active]:bg-zinc-800">
            <Lock className="mr-2 h-4 w-4" />
            Authority Matrix
          </TabsTrigger>
          <TabsTrigger value="visibility" className="data-[state=active]:bg-zinc-800">
            <Users className="mr-2 h-4 w-4" />
            Visibility
          </TabsTrigger>
        </TabsList>

        {/* POLICIES TAB */}
        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Policy Definitions</h2>
            <Dialog open={newPolicyOpen} onOpenChange={setNewPolicyOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-500">
                  <Plus className="mr-2 h-4 w-4" />
                  New Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Policy</DialogTitle>
                </DialogHeader>
                <NewPolicyForm 
                  onSubmit={(data) => createPolicyMutation.mutate(data)}
                  isLoading={createPolicyMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {policies?.map((policy) => (
              <Card key={policy.id} className="bg-zinc-900/50 border-zinc-800 p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-white">{policy.code}</span>
                      <Badge className={riskColors[policy.riskLevel]}>
                        {policy.riskLevel}
                      </Badge>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                        v{policy.version}
                      </Badge>
                      {!policy.isActive && (
                        <Badge variant="outline" className="border-rose-700 text-rose-400">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-white font-medium">{policy.name}</h3>
                    <p className="text-sm text-zinc-400">{policy.description}</p>
                    <div className="text-xs text-zinc-500 font-mono">
                      Required Authority: <span className="text-zinc-300">{policy.requiredAuthority}</span>
                    </div>
                  </div>
                  
                  <Dialog open={editingPolicy === policy.code} onOpenChange={(open) => setEditingPolicy(open ? policy.code : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Policy: {policy.code}</DialogTitle>
                      </DialogHeader>
                      <EditPolicyForm 
                        policy={policy}
                        onSubmit={(data) => updatePolicyMutation.mutate({ code: policy.code, ...data })}
                        isLoading={updatePolicyMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AUTHORITY MATRIX TAB */}
        <TabsContent value="authority" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Authority Matrix</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Defines which roles can approve which decision types. This is the backbone of trust.
            </p>
          </div>
          
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Decision Type</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">OPERATOR</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">SUPERVISOR</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">COMPLIANCE</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">PLATFORM_ADMIN</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">Dual Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {authorityMatrix?.map((rule) => (
                  <tr key={rule.decisionType}>
                    <td className="px-4 py-3 font-mono text-white font-medium">{rule.decisionType}</td>
                    <td className="px-4 py-3 text-center">
                      {rule.allowedRoles.includes("OPERATOR") ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rule.allowedRoles.includes("SUPERVISOR") ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rule.allowedRoles.includes("COMPLIANCE") ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rule.allowedRoles.includes("PLATFORM_ADMIN") ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rule.dualControl ? (
                        <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">Required</Badge>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Authority Rules</h3>
            <div className="space-y-3">
              {authorityMatrix?.map((rule) => (
                <div key={rule.decisionType} className="flex items-start gap-4 p-3 bg-zinc-950/50 rounded border border-zinc-800">
                  <div className="flex-1">
                    <div className="font-mono text-white font-medium">{rule.decisionType}</div>
                    <div className="text-xs text-zinc-400 mt-1">{rule.description}</div>
                    <div className="flex gap-2 mt-2">
                      {rule.allowedRoles.map((role) => (
                        <Badge key={role} variant="outline" className="border-zinc-700 text-zinc-300 text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {rule.escalationRoles && rule.escalationRoles.length > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Escalation Path</div>
                      <div className="text-xs text-orange-400 font-mono mt-1">
                        {rule.escalationRoles.join(" → ")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
          
          <div className="text-xs text-zinc-500 space-y-1 bg-zinc-900/30 p-4 rounded border border-zinc-800">
            <p className="font-bold text-zinc-400 mb-2">Legend</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Full authority to approve</p>
            <p className="flex items-center gap-2"><XCircle className="h-3 w-3 text-zinc-600" /> No authority</p>
            <p className="flex items-center gap-2"><Badge className="bg-amber-900/50 text-amber-400 border-amber-800 text-[10px]">Required</Badge> Dual control required (two approvers)</p>
          </div>
        </TabsContent>

        {/* VISIBILITY MATRIX TAB */}
        <TabsContent value="visibility" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Visibility Matrix</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Defines what each role can see in the system. No hidden functionality.
            </p>
          </div>
          
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">UI Area</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">OPERATOR</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">SUPERVISOR</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">COMPLIANCE</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">PLATFORM_ADMIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {visibilityMatrix && Object.entries(visibilityMatrix).map(([area, roles]) => (
                  <tr key={area}>
                    <td className="px-4 py-3 text-white">{area}</td>
                    <td className="px-4 py-3 text-center">
                      {(roles as Record<string, boolean>)["OPERATOR"] ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(roles as Record<string, boolean>)["SUPERVISOR"] ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(roles as Record<string, boolean>)["COMPLIANCE"] ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(roles as Record<string, boolean>)["PLATFORM_ADMIN"] ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// New Policy Form Component
function NewPolicyForm({ onSubmit, isLoading }: { 
  onSubmit: (data: { code: string; name: string; description?: string; requiredAuthority: "SUPERVISOR" | "COMPLIANCE" | "DUAL"; riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }) => void;
  isLoading: boolean;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredAuthority, setRequiredAuthority] = useState<"SUPERVISOR" | "COMPLIANCE" | "DUAL">("SUPERVISOR");
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ code, name, description: description || undefined, requiredAuthority, riskLevel });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-zinc-400">Policy Code</label>
        <Input 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          placeholder="e.g., PAY-005"
          className="bg-zinc-950 border-zinc-800 mt-1"
          required
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400">Policy Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g., High Value Payment Approval"
          className="bg-zinc-950 border-zinc-800 mt-1"
          required
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400">Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Describe when this policy applies..."
          className="bg-zinc-950 border-zinc-800 mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-400">Required Authority</label>
          <Select value={requiredAuthority} onValueChange={(v) => setRequiredAuthority(v as typeof requiredAuthority)}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
              <SelectItem value="COMPLIANCE">COMPLIANCE</SelectItem>
              <SelectItem value="DUAL">DUAL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-zinc-400">Risk Level</label>
          <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as typeof riskLevel)}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="LOW">LOW</SelectItem>
              <SelectItem value="MEDIUM">MEDIUM</SelectItem>
              <SelectItem value="HIGH">HIGH</SelectItem>
              <SelectItem value="CRITICAL">CRITICAL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Create Policy
      </Button>
    </form>
  );
}

// Edit Policy Form Component
function EditPolicyForm({ policy, onSubmit, isLoading }: { 
  policy: { code: string; name: string; description: string | null; requiredAuthority: string; riskLevel: string; isActive: number };
  onSubmit: (data: { name?: string; description?: string; requiredAuthority?: "SUPERVISOR" | "COMPLIANCE" | "DUAL"; riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; isActive?: number }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(policy.name);
  const [description, setDescription] = useState(policy.description || "");
  const [requiredAuthority, setRequiredAuthority] = useState(policy.requiredAuthority);
  const [riskLevel, setRiskLevel] = useState(policy.riskLevel);
  const [isActive, setIsActive] = useState(policy.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      name, 
      description: description || undefined, 
      requiredAuthority: requiredAuthority as "SUPERVISOR" | "COMPLIANCE" | "DUAL", 
      riskLevel: riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-zinc-400">Policy Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="bg-zinc-950 border-zinc-800 mt-1"
          required
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400">Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="bg-zinc-950 border-zinc-800 mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-400">Required Authority</label>
          <Select value={requiredAuthority} onValueChange={setRequiredAuthority}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
              <SelectItem value="COMPLIANCE">COMPLIANCE</SelectItem>
              <SelectItem value="DUAL">DUAL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-zinc-400">Risk Level</label>
          <Select value={riskLevel} onValueChange={setRiskLevel}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="LOW">LOW</SelectItem>
              <SelectItem value="MEDIUM">MEDIUM</SelectItem>
              <SelectItem value="HIGH">HIGH</SelectItem>
              <SelectItem value="CRITICAL">CRITICAL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm text-zinc-400">Status</label>
        <Select value={String(isActive)} onValueChange={(v) => setIsActive(Number(v))}>
          <SelectTrigger className="bg-zinc-950 border-zinc-800 mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit2 className="mr-2 h-4 w-4" />}
        Update Policy
      </Button>
    </form>
  );
}
