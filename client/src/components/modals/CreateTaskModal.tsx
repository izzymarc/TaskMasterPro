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

// Define the task schema
const taskSchema = insertTaskSchema.extend({
  columnId: z.coerce.number(),
  order: z.coerce.number(),
  assigneeId: z.coerce.number().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, "Category is required"),
  dueDate: z.date().optional().nullable(),
});

const CreateTaskModal = ({ isOpen, onClose, columnId, editTask }: CreateTaskModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const columns = useSelector((state: RootState) => state.board.columns);
  const tasks = useSelector((state: RootState) => state.board.tasks);
  
  // In a real app, this would come from the user state
  const users = [
    { id: 1, username: 'Alex Johnson' },
    { id: 2, username: 'Sarah Miller' },
    { id: 3, username: 'Michael Chen' },
    { id: 4, username: 'Olivia Taylor' },
  ];

  // Set initial form values
  const defaultValues = {
    title: editTask?.title || '',
    description: editTask?.description || '',
    columnId: columnId || editTask?.columnId || columns[0]?.id || 0,
    order: editTask?.order || 0,
    assigneeId: editTask?.assigneeId || null,
    priority: (editTask?.priority as 'low' | 'medium' | 'high') || 'medium',
    category: editTask?.category || 'feature',
    dueDate: editTask?.dueDate ? new Date(editTask.dueDate) : null,
    isCompleted: editTask?.isCompleted || false,
  };

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  // Make sure form is reset when modal is opened/closed or props change
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, editTask, columnId, columns, form]);

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    if (editTask) {
      // Handle task update
      const updatedTask = {
        ...editTask,
        ...data,
        updatedAt: new Date()
      };
      
      dispatch(updateTask(updatedTask));
      
      toast({
        title: 'Task updated',
        description: data.title,
      });
    } else {
      // Handle new task creation
      const tasksInColumn = tasks[data.columnId] || [];
      
      const newTask = {
        ...data,
        id: Date.now(), // Generate a unique id
        order: tasksInColumn.length,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      dispatch(createTask(newTask));
      
      toast({
        title: 'Task created',
        description: data.title,
      });
    }
    
    onClose();
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                      value={field.value || ''}
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {columns.length > 0 ? (
                        columns.map(column => (
                          <SelectItem key={column.id} value={column.id.toString()}>
                            {column.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0">No columns available</SelectItem>
                      )}
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
