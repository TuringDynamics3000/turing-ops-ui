import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Shell } from "./components/shell/Shell";

// Page imports
import OverviewPage from "./pages/overview/page";
import InboxPage from "./pages/decisions/inbox/page";
import DecisionDetailPage from "./pages/decisions/[id]/page";
import PaymentsExplorerPage from "./pages/state/payments/page";
import LedgerExplorerPage from "./pages/state/ledger/page";
import RiskExplorerPage from "./pages/state/risk/page";
import EvidencePage from "./pages/evidence/page";
import ConfigPage from "./pages/system/config/page";
import AuthorityMatrixPage from "./pages/system/authority/page";
import SearchPage from "./pages/search/page";
import BoardPackPage from "./pages/board-pack/page";

function Router() {
  return (
    <Shell>
      <Switch>
        {/* Default redirect to Overview */}
        <Route path="/" component={() => <Redirect to="/overview" />} />
        
        {/* Executive Overview */}
        <Route path="/overview" component={OverviewPage} />
        
        {/* Decision Inbox (authoritative workflow) */}
        <Route path="/inbox" component={InboxPage} />
        <Route path="/decisions/inbox" component={() => <Redirect to="/inbox" />} />
        <Route path="/decisions/:id" component={DecisionDetailPage} />
        
        {/* State Explorers (read-only derived state) */}
        <Route path="/state/payments" component={PaymentsExplorerPage} />
        <Route path="/state/ledger" component={LedgerExplorerPage} />
        <Route path="/state/risk" component={RiskExplorerPage} />
        
        {/* Evidence Library */}
        <Route path="/evidence" component={EvidencePage} />
        
        {/* Global Search */}
        <Route path="/search" component={SearchPage} />
        
        {/* Board Pack */}
        <Route path="/board-pack" component={BoardPackPage} />
        
        {/* System Configuration */}
        <Route path="/system/config" component={ConfigPage} />
        <Route path="/system/authority" component={AuthorityMatrixPage} />
        
        {/* Legacy routes - redirect to new structure */}
        <Route path="/decisions/active" component={() => <Redirect to="/inbox" />} />
        <Route path="/decisions/completed" component={() => <Redirect to="/evidence" />} />
        <Route path="/ledger/payments" component={() => <Redirect to="/state/payments" />} />
        <Route path="/ledger/journals" component={() => <Redirect to="/state/ledger" />} />
        <Route path="/limits" component={() => <Redirect to="/state/risk" />} />
        <Route path="/risk" component={() => <Redirect to="/state/risk" />} />
        <Route path="/audit" component={() => <Redirect to="/evidence" />} />
        <Route path="/system/health" component={() => <Redirect to="/overview" />} />
        
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
