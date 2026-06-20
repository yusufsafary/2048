import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/NavBar";
import NotFound from "@/pages/not-found";
import Game from "@/pages/Game";
import About from "@/pages/About";
import HowToPlay from "@/pages/HowToPlay";
import Login from "@/pages/Login";
import Demo from "@/pages/Demo";

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <NavBar />
      <Switch>
        <Route path="/" component={Game} />
        <Route path="/demo" component={Demo} />
        <Route path="/about" component={About} />
        <Route path="/how-to-play" component={HowToPlay} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
