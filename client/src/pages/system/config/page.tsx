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
import { Settings, Shield, Lock, Plus, Edit2, Loader2, AlertTriangle, CheckCircle2, XCircle, Users, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import type { Role } from "@shared/authority";

// Policy type from database
interface DbPolicy {
  id: number;
  code: string;
  name: string;
  description: string | null;
  version: string;
  requiredAuthority: string;
  riskLevel: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ConfigPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: policies, isLoading: policiesLoading } = trpc.policies.list.useQuery();
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

  const roles: Role[] = ["OPERATOR", "SUPERVISOR", "COMPLIANCE", "PLATFORM_ADMIN"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="h-6 w-6 text-zinc-400" />
            System Configuration
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage policies and view role visibility settings.
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
          <TabsTrigger value="visibility" className="data-[state=active]:bg-zinc-800">
            <Users className="mr-2 h-4 w-4" />
            Visibility
          </TabsTrigger>
        </TabsList>

        {/* POLICIES TAB */}
        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Policy Definitions</h2>
            <div className="flex gap-2">
              <Link href="/system/authority">
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  <Lock className="mr-2 h-4 w-4" />
                  View Authority Matrix
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </Link>
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
          </div>

          <div className="space-y-3">
            {policies?.map((policy: DbPolicy) => (
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

        {/* VISIBILITY TAB */}
        <TabsContent value="visibility" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Role Visibility Matrix</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Defines which UI areas each role can access. No hidden functionality.
            </p>
          </div>
          
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">UI Area</th>
                  {roles.map((role) => (
                    <th key={role} className="px-4 py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {visibilityMatrix && Object.entries(visibilityMatrix).map(([area, roleAccess]) => (
                  <tr key={area}>
                    <td className="px-4 py-3 font-medium text-white">{area}</td>
                    {roles.map((role) => (
                      <td key={role} className="px-4 py-3 text-center">
                        {(roleAccess as Record<Role, boolean>)[role] ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />
                        )}
                      </td>
                    ))}
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
function NewPolicyForm({ 
  onSubmit, 
  isLoading 
}: { 
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
    onSubmit({ code, name, description, requiredAuthority, riskLevel });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-zinc-300">Policy Code</label>
        <Input 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g., PAY-005"
          className="bg-zinc-800 border-zinc-700 text-white mt-1"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300">Name</label>
        <Input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Policy name"
          className="bg-zinc-800 border-zinc-700 text-white mt-1"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300">Description</label>
        <Textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Policy description"
          className="bg-zinc-800 border-zinc-700 text-white mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300">Required Authority</label>
          <Select value={requiredAuthority} onValueChange={(v) => setRequiredAuthority(v as "SUPERVISOR" | "COMPLIANCE" | "DUAL")}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              <SelectItem value="COMPLIANCE">Compliance</SelectItem>
              <SelectItem value="DUAL">Dual Control</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300">Risk Level</label>
          <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Create Policy
      </Button>
    </form>
  );
}

// Edit Policy Form Component
function EditPolicyForm({ 
  policy,
  onSubmit, 
  isLoading 
}: { 
  policy: DbPolicy;
  onSubmit: (data: { name?: string; description?: string; requiredAuthority?: "SUPERVISOR" | "COMPLIANCE" | "DUAL"; riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; isActive?: number }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(policy.name);
  const [description, setDescription] = useState(policy.description || "");
  const [requiredAuthority, setRequiredAuthority] = useState<"SUPERVISOR" | "COMPLIANCE" | "DUAL">(policy.requiredAuthority as "SUPERVISOR" | "COMPLIANCE" | "DUAL");
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">(policy.riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL");
  const [isActive, setIsActive] = useState(policy.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, requiredAuthority, riskLevel, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-zinc-300">Name</label>
        <Input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white mt-1"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300">Description</label>
        <Textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300">Required Authority</label>
          <Select value={requiredAuthority} onValueChange={(v) => setRequiredAuthority(v as "SUPERVISOR" | "COMPLIANCE" | "DUAL")}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              <SelectItem value="COMPLIANCE">Compliance</SelectItem>
              <SelectItem value="DUAL">Dual Control</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300">Risk Level</label>
          <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={isActive === 1}
          onChange={(e) => setIsActive(e.target.checked ? 1 : 0)}
          className="rounded border-zinc-700 bg-zinc-800"
        />
        <label className="text-sm text-zinc-300">Active</label>
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Update Policy
      </Button>
    </form>
  );
}
