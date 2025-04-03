import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { createColumn, updateColumn } from '@/store/slices/boardSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertColumnSchema } from '@shared/schema';
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
import { Button } from '@/components/ui/button';
import type { Column } from '@shared/schema';

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  editColumn?: Column;
}

const columnSchema = insertColumnSchema.extend({
  boardId: z.number(),
  order: z.number(),
});

const CreateColumnModal = ({ isOpen, onClose, editColumn }: CreateColumnModalProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const currentBoard = useSelector((state: RootState) => state.board.currentBoard);
  const columns = useSelector((state: RootState) => state.board.columns);

  const form = useForm<z.infer<typeof columnSchema>>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: '',
      boardId: currentBoard?.id || 0,
      order: columns.length,
    },
  });

  // Update form when editing a column
  useEffect(() => {
    if (editColumn) {
      form.reset({
        name: editColumn.name,
        boardId: editColumn.boardId,
        order: editColumn.order,
      });
    } else {
      form.reset({
        name: '',
        boardId: currentBoard?.id || 0,
        order: columns.length,
      });
    }
  }, [editColumn, currentBoard, columns, form]);

  const onSubmit = (data: z.infer<typeof columnSchema>) => {
    if (editColumn) {
      dispatch(updateColumn({
        id: editColumn.id,
        data
      }));
      
      toast({
        title: 'Column updated',
        description: data.name,
      });
    } else {
      dispatch(createColumn(data));
      
      toast({
        title: 'Column created',
        description: data.name,
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editColumn ? 'Edit Column' : 'Create New Column'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Column name" {...field} />
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
                {editColumn ? 'Update Column' : 'Create Column'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateColumnModal;
