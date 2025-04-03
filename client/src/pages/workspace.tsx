import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useLocation } from 'wouter';
import type { AppDispatch } from '@/store';
import { RootState } from '@/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useMobile } from '@/hooks/use-mobile';
import { setCurrentBoard } from '@/store/slices/boardSlice';
import { Layers, Plus, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Workspace = () => {
  const { workspaceId } = useParams();
  const parsedWorkspaceId = workspaceId ? parseInt(workspaceId, 10) : null;
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const workspaces = useSelector((state: RootState) => state.user.workspaces);
  const currentWorkspace = workspaces.find(w => w.id === parsedWorkspaceId);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  if (!currentWorkspace) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Workspace not found</h1>
        <p className="mb-4">The workspace you're looking for doesn't exist or you don't have access to it.</p>
        <Link href="/">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    </div>;
  }
  
  // Mock data for boards - in a real app, this would come from the API or Redux store
  const boards = [
    { id: 1, name: 'Project Alpha', description: 'Main development board' },
    { id: 2, name: 'Marketing Q3', description: 'Q3 marketing campaigns' },
    { id: 3, name: 'Roadmap 2025', description: 'Long-term product planning' }
  ];
  
  const handleCreateBoard = () => {
    // In a real app, we would create a board in Firebase
    const newBoardId = Date.now();
    const newBoard = {
      id: newBoardId,
      name: `New Board ${boards.length + 1}`,
      workspaceId: parsedWorkspaceId || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Update the Redux state with the new board
    dispatch(setCurrentBoard(newBoard));
    
    // Show a success toast
    toast({
      title: "Board created",
      description: `Successfully created "${newBoard.name}"`,
    });
    
    // Redirect to the new board
    setLocation(`/board/${newBoardId}`);
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{currentWorkspace.name}</h1>
              <p className="text-neutral-500">
                Created on {currentWorkspace.createdAt ? new Date(currentWorkspace.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <Button 
              className="flex items-center"
              onClick={handleCreateBoard}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Board
            </Button>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Boards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map(board => (
                <Card key={board.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>{board.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <CardDescription>{board.description}</CardDescription>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;