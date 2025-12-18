import { useRoute } from "wouter";
import { DecisionCard } from "@/components/decision/DecisionCard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function DecisionDetailPage() {
  const [match, params] = useRoute("/decisions/:id");
  
  const { data: decision, isLoading, error } = trpc.decisions.get.useQuery(
    { decisionId: params?.id || "" },
    { enabled: !!params?.id }
  );

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
        <h2 className="text-xl font-bold text-white mb-2">Decision Not Found</h2>
        <p>The requested decision ID does not exist or you do not have access.</p>
        <Link href="/decisions/inbox">
          <Button variant="link" className="mt-4 text-orange-500">Return to Inbox</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/decisions/inbox">
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white pl-0 hover:bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inbox
        </Button>
      </Link>
      
      <DecisionCard decision={decision} />
    </div>
  );
}
