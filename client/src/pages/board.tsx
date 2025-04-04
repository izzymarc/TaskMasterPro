import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute } from 'wouter';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchBoard, 
  fetchColumns, 
  fetchTasks, 
  clearBoard, 
  setCurrentBoard 
} from '@/store/slices/boardSlice';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import KanbanBoard from '@/components/board/KanbanBoard';
import DragLayer from '@/components/board/DragLayer';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import EditableTitle from '@/components/board/EditableTitle';
import { useMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@shared/schema';

const Board = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [match, params] = useRoute('/board/:boardId');
  const boardId = params?.boardId ? parseInt(params.boardId) : 0;
  
  const currentBoard = useSelector((state: RootState) => state.board.currentBoard);
  const columns = useSelector((state: RootState) => state.board.columns);
  const loading = useSelector((state: RootState) => state.board.loading);
  const error = useSelector((state: RootState) => state.board.error);
  
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  
  // Handle board title change
  const handleBoardTitleChange = (newTitle: string) => {
    if (currentBoard) {
      const updatedBoard = {
        ...currentBoard,
        name: newTitle,
        updatedAt: new Date()
      };
      
      dispatch(setCurrentBoard(updatedBoard));
      
      // In a real app, we would also update the board on the server
      toast({
        title: "Board updated",
        description: "Board name successfully changed",
      });
    }
  };

  // Fetch board data on mount
  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
    
    // Clean up on unmount
    return () => {
      dispatch(clearBoard());
    };
  }, [boardId, dispatch]);

  // Show toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Mock team members data (would come from the API in a real app)
  const teamMembers: User[] = [
    {
      id: 1,
      username: 'Alex Johnson',
      email: 'alex@example.com',
      password: '',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      createdAt: new Date()
    },
    {
      id: 2,
      username: 'Sarah Miller',
      email: 'sarah@example.com',
      password: '',
      avatarUrl: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      createdAt: new Date()
    },
    {
      id: 3,
      username: 'Michael Chen',
      email: 'michael@example.com',
      password: '',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
      createdAt: new Date()
    },
    {
      id: 4,
      username: 'Olivia Taylor',
      email: 'olivia@example.com',
      password: '',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      createdAt: new Date()
    }
  ];

  if (loading && !currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!match || !currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Board not found</h1>
          <p className="text-neutral-600 mb-4">The board you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

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
          onNewTask={() => {
            console.log('New Task button clicked, current modal state:', isTaskModalOpen);
            setTaskModalOpen(true);
            console.log('Modal state after setting:', true);
          }} 
          board={currentBoard}
          lastUpdated={currentBoard.updatedAt ? new Date(currentBoard.updatedAt) : undefined}
          teamMembers={teamMembers}
          onTitleChange={handleBoardTitleChange}
        />
        
        <KanbanBoard boardId={boardId} users={teamMembers} />
        
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          columnId={columns.length > 0 ? columns[0].id : undefined}
        />
        
        <DragLayer />
      </div>
    </div>
  );
};

export default Board;
