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
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Board from "@/pages/board";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/board/:boardId">
        {(params) => (
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </DndProvider>
    </Provider>
  );
}

export default App;
