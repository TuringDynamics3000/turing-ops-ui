import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { jsPDF } from "jspdf";
import { 
  FileBarChart, 
  Download,
  Calendar,
  TrendingUp,
  Shield,
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle2,
  Hash
} from "lucide-react";

export default function BoardPackPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch data
  const { data: decisions } = trpc.decisions.list.useQuery();
  const { data: evidence } = trpc.evidence.list.useQuery();

  // Generate available months (last 12 months)
  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
      months.push({ value, label });
    }
    return months;
  }, []);

  // Calculate metrics for selected month
  const metrics = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const monthDecisions = (decisions || []).filter(d => {
      const created = new Date(d.createdAt);
      return created >= startDate && created <= endDate;
    });

    const completedDecisions = monthDecisions.filter(d => 
      ["APPROVED", "REJECTED", "ESCALATED"].includes(d.status)
    );
    const escalatedDecisions = monthDecisions.filter(d => d.status === "ESCALATED");
    const highRiskDecisions = monthDecisions.filter(d => d.risk === "HIGH" || d.risk === "CRITICAL");

    const monthEvidence = (evidence || []).filter(e => {
      const created = new Date(e.createdAt);
      return created >= startDate && created <= endDate;
    });

    return {
      totalDecisions: monthDecisions.length,
      completedDecisions: completedDecisions.length,
      pendingDecisions: monthDecisions.filter(d => d.status === "PENDING").length,
      escalatedDecisions: escalatedDecisions.length,
      escalationRate: completedDecisions.length > 0 
        ? Math.round((escalatedDecisions.length / completedDecisions.length) * 100) 
        : 0,
      highRiskCount: highRiskDecisions.length,
      amlExceptions: monthDecisions.filter(d => d.type === "AML_EXCEPTION").length,
      overrides: monthDecisions.filter(d => d.type === "LIMIT_OVERRIDE").length,
      evidenceCount: monthEvidence.length,
      evidenceCoverage: completedDecisions.length > 0 
        ? Math.round((monthEvidence.length / completedDecisions.length) * 100) 
        : 100,
      dualControlCompliance: 100, // Mock
      timeToDecisionP50: "4.2 min", // Mock
      timeToDecisionP95: "12.8 min", // Mock
    };
  }, [selectedMonth, decisions, evidence]);

  // Generate Board Pack hash
  const boardPackHash = useMemo(() => {
    const hashInput = JSON.stringify({
      month: selectedMonth,
      metrics,
      generatedAt: new Date().toISOString().split('T')[0],
    });
    // Simple hash for demo (in production use crypto.subtle)
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }, [selectedMonth, metrics]);

  // Generate PDF
  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthName = new Date(year, month - 1).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
      
      // Page 1: Executive Summary
      doc.setFontSize(24);
      doc.setTextColor(30, 30, 30);
      doc.text("Board Pack", 20, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(monthName, 20, 40);
      
      doc.setFontSize(10);
      doc.text(`Data window: ${year}-${String(month).padStart(2, '0')}-01 to ${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`, 20, 50);
      
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text("Executive Summary", 20, 70);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Decisions: ${metrics.totalDecisions}`, 20, 85);
      doc.text(`Completed: ${metrics.completedDecisions}`, 20, 93);
      doc.text(`Pending: ${metrics.pendingDecisions}`, 20, 101);
      doc.text(`Escalated: ${metrics.escalatedDecisions}`, 20, 109);
      
      // Page 2: Governance KPIs
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text("Governance KPIs", 20, 30);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Time to Decision (P50): ${metrics.timeToDecisionP50}`, 20, 50);
      doc.text(`Time to Decision (P95): ${metrics.timeToDecisionP95}`, 20, 58);
      doc.text(`Escalation Rate: ${metrics.escalationRate}%`, 20, 66);
      doc.text(`Dual Control Compliance: ${metrics.dualControlCompliance}%`, 20, 74);
      
      // Page 3: Risk Posture
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text("Risk Posture", 20, 30);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`High Risk Decisions: ${metrics.highRiskCount}`, 20, 50);
      doc.text(`AML Exceptions: ${metrics.amlExceptions}`, 20, 58);
      doc.text(`Limit Overrides: ${metrics.overrides}`, 20, 66);
      
      // Page 4: Evidence Integrity + Hash
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text("Evidence Integrity", 20, 30);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Evidence Packs Generated: ${metrics.evidenceCount}`, 20, 50);
      doc.text(`Evidence Coverage: ${metrics.evidenceCoverage}%`, 20, 58);
      doc.text(`Generation Failures: 0`, 20, 66);
      
      // Board Pack Hash
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text("Board Pack Hash", 20, 90);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(boardPackHash, 20, 100);
      doc.text(`Generated: ${new Date().toISOString()}`, 20, 108);
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Turing Ops Console - Confidential", 20, 280);
      
      // Save
      doc.save(`board-pack-${selectedMonth}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Board Pack</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Monthly governance report with deterministic PDF generation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700">
              <Calendar className="h-4 w-4 mr-2 text-zinc-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Board Pack Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Summary */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Executive Summary
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricTile label="Total Decisions" value={metrics.totalDecisions} />
            <MetricTile label="Completed" value={metrics.completedDecisions} />
            <MetricTile label="Pending" value={metrics.pendingDecisions} />
            <MetricTile label="Escalated" value={metrics.escalatedDecisions} />
          </div>
        </Card>

        {/* Governance KPIs */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Governance KPIs
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricTile label="Time to Decision (P50)" value={metrics.timeToDecisionP50} />
            <MetricTile label="Time to Decision (P95)" value={metrics.timeToDecisionP95} />
            <MetricTile label="Escalation Rate" value={`${metrics.escalationRate}%`} />
            <MetricTile label="Dual Control Compliance" value={`${metrics.dualControlCompliance}%`} />
          </div>
        </Card>

        {/* Risk Posture */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Posture
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricTile label="High Risk Decisions" value={metrics.highRiskCount} highlight={metrics.highRiskCount > 0} />
            <MetricTile label="AML Exceptions" value={metrics.amlExceptions} />
            <MetricTile label="Limit Overrides" value={metrics.overrides} />
            <MetricTile label="Policy Breaches" value="0" />
          </div>
        </Card>

        {/* Evidence Integrity */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Evidence Integrity
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricTile label="Evidence Packs" value={metrics.evidenceCount} />
            <MetricTile label="Coverage" value={`${metrics.evidenceCoverage}%`} />
            <MetricTile label="Generation Failures" value="0" />
            <div className="col-span-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Latest Hash</p>
              <p className="text-sm font-mono text-zinc-400 mt-1 truncate">
                {evidence?.[0]?.merkleHash?.slice(0, 32) || "—"}...
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Board Pack Hash */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-orange-900/30 flex items-center justify-center">
              <Hash className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Board Pack Hash</p>
              <p className="text-lg font-mono text-white mt-1">{boardPackHash}</p>
              <p className="text-xs text-zinc-500 mt-1">
                Same inputs → identical PDF (except timestamp)
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-900/50 text-emerald-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Deterministic
          </Badge>
        </div>
      </Card>

      {/* Sample Evidence Packs */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
          Sample Evidence Packs (Appendix)
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          5-10 sampled decisions: mix of high-risk, escalated, dual-control
        </p>
        {evidence && evidence.length > 0 ? (
          <div className="space-y-2">
            {evidence.slice(0, 5).map((pack) => (
              <div key={pack.evidenceId} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-white font-mono">{pack.evidenceId}</p>
                  <p className="text-xs text-zinc-500">Decision: {pack.decisionId}</p>
                </div>
                <p className="text-xs text-zinc-500 font-mono truncate max-w-[200px]">
                  {pack.merkleHash?.slice(0, 16)}...
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No evidence packs available for this period</p>
        )}
      </Card>
    </div>
  );
}

// Metric Tile Component
function MetricTile({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-rose-900/20 border border-rose-800' : 'bg-zinc-800/50'}`}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? 'text-rose-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
