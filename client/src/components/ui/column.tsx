import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from '@/components/ui/dialog';
import { createTask, deleteColumnAction, moveTaskAction } from '@/store/slices/boardSlice';
import TaskCard from './task-card';
import type { Column, Task, User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface ColumnProps {
  column: Column;
  tasks: Task[];
  users: User[];
  onCreateTask: (columnId: number) => void;
  onEditColumn: (column: Column) => void;
}

const TaskColumn = ({ column, tasks, users, onCreateTask, onEditColumn }: ColumnProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const findAssignee = (assigneeId?: number | null) => {
    if (!assigneeId) return undefined;
    return users.find(user => user.id === assigneeId);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: number, columnId: number, order: number }) => {
      if (item.columnId !== column.id) {
        // Calculate new order - add to the end of the column
        const newOrder = tasks.length;
        dispatch(moveTaskAction({ 
          id: item.id, 
          columnId: column.id, 
          order: newOrder 
        }));
        
        toast({
          title: 'Task moved',
          description: `Task moved to ${column.name}`,
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleDeleteColumn = () => {
    dispatch(deleteColumnAction(column.id));
    setIsDialogOpen(false);
    
    toast({
      title: 'Column deleted',
      description: column.name,
      variant: 'destructive',
    });
  };

  return (
    <div
      ref={drop}
      className={`task-column bg-neutral-50 rounded-md shadow flex flex-col flex-shrink-0 ${
        isOver ? 'bg-neutral-100' : ''
      }`}
    >
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-medium text-neutral-800">{column.name}</h3>
          <span className="ml-2 bg-neutral-200 text-neutral-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditColumn(column)}>Edit Column</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500"
              onClick={() => setIsDialogOpen(true)}
            >
              Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-3 flex-1 overflow-y-auto scrollbar-hide">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            assignee={findAssignee(task.assigneeId)}
            commentCount={0} // This would need to be populated from comments data
          />
        ))}

        <Button
          variant="ghost" 
          className="w-full flex items-center justify-center p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md text-sm"
          onClick={() => onCreateTask(column.id)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this column?</p>
            <p className="font-medium mt-2">{column.name}</p>
            <p className="text-red-500 text-sm mt-2">All tasks in this column will also be deleted.</p>
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteColumn}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskColumn;
