import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { RootState } from '@/store';
import { createTask, updateTask } from '@/store/slices/boardSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertTaskSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task } from '@shared/schema';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId?: number;
  editTask?: Task;
}

const taskSchema = insertTaskSchema.extend({
  columnId: z.number(),
  order: z.number(),
  assigneeId: z.number().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, "Category is required"),
  dueDate: z.date().optional().nullable(),
});

const CreateTaskModal = ({ isOpen, onClose, columnId, editTask }: CreateTaskModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const columns = useSelector((state: RootState) => state.board.columns);
  const tasks = useSelector((state: RootState) => state.board.tasks);
  const users = useSelector((state: RootState) => [
    // In a real app, this would come from the user state
    { id: 1, username: 'Alex Johnson' },
    { id: 2, username: 'Sarah Miller' },
    { id: 3, username: 'Michael Chen' },
    { id: 4, username: 'Olivia Taylor' },
  ]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      columnId: columnId || columns[0]?.id || 0,
      order: 0, // This will be calculated on the server
      assigneeId: null,
      priority: 'medium',
      category: 'feature',
      dueDate: null,
      isCompleted: false,
    },
  });

  // Update form when editing a task
  useEffect(() => {
    console.log('CreateTaskModal props', { isOpen, columnId, editTask });
    console.log('Columns available:', columns);
    
    if (editTask) {
      form.reset({
        title: editTask.title,
        description: editTask.description || '',
        columnId: editTask.columnId,
        order: editTask.order,
        assigneeId: editTask.assigneeId || null,
        priority: editTask.priority as 'low' | 'medium' | 'high',
        category: editTask.category,
        dueDate: editTask.dueDate ? new Date(editTask.dueDate) : null,
        isCompleted: editTask.isCompleted,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        columnId: columnId || columns[0]?.id || 0,
        order: 0,
        assigneeId: null,
        priority: 'medium',
        category: 'feature',
        dueDate: null,
        isCompleted: false,
      });
    }
  }, [editTask, columnId, columns, form, isOpen]);

  // Set column if columnId is provided
  useEffect(() => {
    if (columnId) {
      form.setValue('columnId', columnId);
    }
  }, [columnId, form]);

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    if (editTask) {
      // Create an updated task with all existing properties plus the changes
      const updatedTask = {
        ...editTask,
        ...data,
        // Convert date to ISO string for storage
        dueDate: data.dueDate ? data.dueDate : null,
        updatedAt: new Date()
      };
      
      dispatch(updateTask(updatedTask));
      
      toast({
        title: 'Task updated',
        description: data.title,
      });
    } else {
      // For new tasks, calculate order (add to end of column)
      const tasksInColumn = tasks[data.columnId] || [];
      
      const newData = {
        ...data,
        order: tasksInColumn.length,
        // Convert date to ISO string for storage
        dueDate: data.dueDate ? data.dueDate : null,
      };
      
      // Use the thunk action creator with proper dispatch casting
      // @ts-ignore - The thunk action is correctly typed in the store
      dispatch(createTask(newData));
      
      toast({
        title: 'Task created',
        description: data.title,
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog onOpenChange:', open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description"
                      rows={3}
                      value={typeof field.value === 'string' ? field.value : ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="ui">UI</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="frontend">Frontend</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="columnId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {columns.map(column => (
                        <SelectItem key={column.id} value={column.id.toString()}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    onValueChange={(value) => 
                      field.onChange(value !== "unassigned" ? parseInt(value) : null)
                    }
                    defaultValue={field.value?.toString() || 'unassigned'}
                    value={field.value?.toString() || 'unassigned'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editTask ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
