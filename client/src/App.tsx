import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Shell } from "./components/shell/Shell";

// Page imports
import InboxPage from "./pages/decisions/inbox/page";
import DecisionDetailPage from "./pages/decisions/[id]/page";
import EvidencePage from "./pages/evidence/page";

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={() => <Redirect to="/decisions/inbox" />} />
        <Route path="/decisions/inbox" component={InboxPage} />
        <Route path="/decisions/:id" component={DecisionDetailPage} />
        <Route path="/evidence" component={EvidencePage} />
        
        {/* Placeholder routes for other sections */}
        <Route path="/decisions/active" component={() => <div className="text-zinc-500 font-mono">/decisions/active - Coming Soon</div>} />
        <Route path="/decisions/completed" component={() => <div className="text-zinc-500 font-mono">/decisions/completed - Coming Soon</div>} />
        <Route path="/ledger/payments" component={() => <div className="text-zinc-500 font-mono">/ledger/payments - Coming Soon</div>} />
        <Route path="/ledger/journals" component={() => <div className="text-zinc-500 font-mono">/ledger/journals - Coming Soon</div>} />
        <Route path="/limits" component={() => <div className="text-zinc-500 font-mono">/limits - Coming Soon</div>} />
        <Route path="/risk" component={() => <div className="text-zinc-500 font-mono">/risk - Coming Soon</div>} />
        <Route path="/audit" component={() => <div className="text-zinc-500 font-mono">/audit - Coming Soon</div>} />
        <Route path="/system/health" component={() => <div className="text-zinc-500 font-mono">/system/health - Coming Soon</div>} />
        <Route path="/system/config" component={() => <div className="text-zinc-500 font-mono">/system/config - Coming Soon</div>} />
        
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
