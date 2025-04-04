import { Switch, Route } from "wouter";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthRedirectHandler from "@/components/auth/AuthRedirectHandler";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Board from "@/pages/board";
import Workspace from "@/pages/workspace";

function Router() {
  return (
    <Switch>
      {/* Home page - publicly accessible */}
      <Route path="/" component={Home} />
      
      {/* Protected routes requiring authentication */}
      <Route path="/workspace/:workspaceId">
        {() => (
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/board/:boardId">
        {() => (
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Fallback route for 404 errors */}
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthRedirectHandler />
            <Router />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </DndProvider>
    </Provider>
  );
}

export default App;
