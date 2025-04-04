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
  console.log('CreateTaskModal rendered with props:', { isOpen, columnId, editTaskId: editTask?.id });
  
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

  // Ensure we have at least a default value for columnId
  const getDefaultColumnId = () => {
    console.log('Getting default columnId. Provided columnId:', columnId);
    console.log('Available columns for form:', columns);
    
    // First priority: use the explicitly provided columnId
    if (columnId !== undefined) {
      console.log('Using explicitly provided columnId:', columnId);
      return columnId;
    }
    
    // Second priority: use the column ID from the task being edited
    if (editTask?.columnId) {
      console.log('Using columnId from editTask:', editTask.columnId);
      return editTask.columnId;
    }
    
    // Third priority: use the first available column
    if (columns.length > 0) {
      console.log('Using first column as default:', columns[0].id);
      return columns[0].id;
    }
    
    // Fallback: use 0 (this should never happen in practice as we should always have columns)
    console.log('No columns available, using default columnId: 0');
    return 0;
  };
  
  // Set initial form values with guaranteed columnId
  const getDefaultValues = () => {
    // Get the best columnId based on priorities
    const defaultColumnId = getDefaultColumnId();
    
    console.log('Setting form default values with columnId:', defaultColumnId);
    
    return {
      title: editTask?.title || '',
      description: editTask?.description || '',
      columnId: defaultColumnId,
      order: editTask?.order || 0,
      assigneeId: editTask?.assigneeId || null,
      priority: (editTask?.priority as 'low' | 'medium' | 'high') || 'medium',
      category: editTask?.category || 'feature',
      dueDate: editTask?.dueDate ? new Date(editTask.dueDate) : null,
      isCompleted: editTask?.isCompleted || false,
    };
  };

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: getDefaultValues(),
  });

  // Make sure form is reset when modal is opened/closed or props change
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, editTask, columnId, columns]);

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

  console.log('Modal rendering decision, isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('Modal not rendering because isOpen is false');
    return null;
  }
  
  console.log('Rendering modal with columns:', columns);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={onClose}
          >
            ×
          </Button>
        </div>
        
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
                    onValueChange={(value) => {
                      console.log('Column selection changed to:', value);
                      field.onChange(parseInt(value));
                    }}
                    value={field.value?.toString() || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status">
                          {field.value !== undefined && columns.length > 0 ? (
                            columns.find(col => col.id === field.value)?.name || 'Select status'
                          ) : (
                            'Select status'
                          )}
                        </SelectValue>
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
                    onValueChange={(value) => {
                      console.log('Assignee selection changed to:', value);
                      field.onChange(value !== "unassigned" ? parseInt(value) : null);
                    }}
                    value={field.value?.toString() || 'unassigned'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned">
                          {field.value ? 
                            users.find(user => user.id === field.value)?.username || 'Unassigned' 
                            : 'Unassigned'}
                        </SelectValue>
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
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateTaskModal;