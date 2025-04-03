import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useDrag } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { updateTask, deleteTask } from '@/store/slices/boardSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Check, AlertCircle } from 'lucide-react';
import type { Task, User } from '@shared/schema';

const getCategoryStyle = (category: string) => {
  const styles: Record<string, { bg: string; text: string }> = {
    feature: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    bug: { bg: 'bg-red-100', text: 'text-red-800' },
    ui: { bg: 'bg-blue-100', text: 'text-blue-800' },
    api: { bg: 'bg-teal-100', text: 'text-teal-800' },
    research: { bg: 'bg-purple-100', text: 'text-purple-800' },
    backend: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    frontend: { bg: 'bg-green-100', text: 'text-green-800' },
  };

  return styles[category.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
};

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onEdit?: (task: Task) => void;
  commentCount?: number;
}

const TaskCard = ({ task, assignee, onEdit, commentCount = 0 }: TaskCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const categoryStyle = getCategoryStyle(task.category);
  const priorityColor = getPriorityColor(task.priority);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'No date';
    if (task.isCompleted) return `Completed ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return `Due ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, columnId: task.columnId, order: task.order },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleToggleComplete = () => {
    dispatch(updateTask({
      id: task.id,
      data: { isCompleted: !task.isCompleted }
    }));
    
    toast({
      title: task.isCompleted ? 'Task marked as incomplete' : 'Task marked as complete',
      description: task.title,
    });
  };

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
    setIsDialogOpen(false);
    
    toast({
      title: 'Task deleted',
      description: task.title,
      variant: 'destructive',
    });
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="task-card bg-white rounded-md shadow mb-3 hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className={`${categoryStyle.bg} ${categoryStyle.text} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
              {task.category}
            </Badge>
            <div className="flex">
              {task.isCompleted ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={`${priorityColor} w-2 h-2 rounded-full mt-1`} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          <h4 className="font-medium text-neutral-800 mb-2">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-neutral-600 mb-3">{task.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {assignee && assignee.avatarUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <img 
                        src={assignee.avatarUrl} 
                        alt={`Assigned to ${assignee.username}`} 
                        className="h-6 w-6 rounded-full object-cover" 
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assigned to {assignee.username}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {commentCount > 0 && (
                <div className="flex ml-1 text-neutral-400">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs ml-1">{commentCount}</span>
                </div>
              )}
            </div>
            
            <span className="text-xs text-neutral-500">
              {formatDate(task.dueDate ? new Date(task.dueDate) : null)}
            </span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-neutral-500 hover:text-neutral-700"
              onClick={handleToggleComplete}
            >
              {task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Confirm Deletion
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>Are you sure you want to delete this task?</p>
                  <p className="font-medium mt-2">{task.title}</p>
                </div>
                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-neutral-500 hover:text-neutral-700"
                onClick={() => onEdit(task)}
              >
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCard;
