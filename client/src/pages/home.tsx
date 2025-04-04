import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'wouter';
import { RootState } from '@/store';
import { setUser, setWorkspaces } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoginButton } from '@/components/auth/LoginButton';
import { Layers, Plus, ArrowRight } from 'lucide-react';

// Helper function to convert Date objects to strings before dispatching
const serializeDates = (obj: any): any => {
  if (!obj) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item));
  }
  
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Date) {
      result[key] = result[key].toISOString();
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = serializeDates(result[key]);
    }
  });
  
  return result;
};

// Component for welcome screen when user is not logged in
const WelcomeScreen = () => {
  // Use the Firebase auth
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
      <div className="text-center max-w-xl">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Welcome to TaskFlow</h1>
        <p className="text-neutral-600 mb-8">
          A collaborative task management application with drag-and-drop functionality, real-time updates, and team collaboration features.
        </p>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <LoginButton className="px-6 py-2" />
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard view when user is logged in
const Dashboard = () => {
  const dispatch = useDispatch();
  const workspaces = useSelector((state: RootState) => state.user.workspaces);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  // Create some demo boards for display
  const [boards, setBoards] = useState([
    { 
      id: 1, 
      name: 'Product Development', 
      workspaceId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Main product roadmap and feature planning board'
    },
    { 
      id: 2, 
      name: 'Marketing Campaign Q2', 
      workspaceId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Q2 marketing strategy and campaign planning'
    },
    { 
      id: 3, 
      name: 'Website Redesign', 
      workspaceId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Planning and tasks for the website overhaul project'
    }
  ]);
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Workspace cards
  const WorkspaceList = () => {
    // Add a handler for creating a new workspace (in a real app this would add to Firebase)
    const handleNewWorkspace = () => {
      const newWorkspaceId = Date.now();
      const newWorkspace = {
        id: newWorkspaceId,
        name: `New Workspace ${workspaces.length + 1}`,
        ownerId: currentUser?.id || 1,
        createdAt: new Date()
      };
      
      // Properly serialize dates before dispatch
      dispatch(setWorkspaces(serializeDates([...workspaces, newWorkspace])));
    };
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Workspaces</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleNewWorkspace}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Workspace
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(workspace => (
            <Card key={workspace.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-primary" />
                  {workspace.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <CardDescription>
                  Workspace created on {workspace.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : 'N/A'}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href={`/workspace/${workspace.id}`}>
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    Open Workspace
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Recent boards
  const RecentBoards = () => {
    // Assuming the first workspace is the default one for new boards
    const defaultWorkspaceId = workspaces.length > 0 ? workspaces[0].id : 1;
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Boards</h2>
          <Link href={`/workspace/${defaultWorkspaceId}`}>
            <Button variant="outline" size="sm" className="flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              New Board
            </Button>
          </Link>
        </div>
        
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <Card key={board.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{board.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardDescription>{board.description}</CardDescription>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(board.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/board/${board.id}`}>
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      Open Board
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-neutral-50 border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-neutral-500 mb-4">You don't have any boards yet</p>
              <Link href={`/workspace/${defaultWorkspaceId}`}>
                <Button>Create Your First Board</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobile={isMobile} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          onNewTask={() => {}} 
          board={null}
          showFilters={false}
        />
        
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <WorkspaceList />
          <RecentBoards />
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const loading = useSelector((state: RootState) => state.user.loading);
  const [, setLocation] = useLocation();

  // Get workspaces from Redux store
  const workspaces = useSelector((state: RootState) => state.user.workspaces);
  
  useEffect(() => {
    // This effect would fetch user-specific data once authenticated
    if (isAuthenticated && currentUser) {
      // Here we would typically fetch user-specific data from the backend
      console.log('User is authenticated, fetching user data');
      
      // For demo purposes, add some workspaces if none exist in Redux store
      if (!workspaces || workspaces.length === 0) {
        const demoWorkspaces = [
          {
            id: 1,
            name: 'Product Team',
            ownerId: currentUser.id,
            createdAt: new Date()
          },
          {
            id: 2,
            name: 'Marketing',
            ownerId: currentUser.id,
            createdAt: new Date()
          }
        ];
        
        // Properly serialize dates before dispatch
        dispatch(setWorkspaces(serializeDates(demoWorkspaces)));
      }
    }
  // We're removing workspaces from the dependency array to prevent an infinite loop
  // since we're potentially updating workspaces in the effect
  }, [isAuthenticated, currentUser, dispatch]);

  // Loading state for the entire app
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return currentUser ? <Dashboard /> : <WelcomeScreen />;
};

export default Home;
