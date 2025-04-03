import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  fetchColumns, 
  fetchTasks, 
  createColumn
} from '@/store/slices/boardSlice';
import { Button } from '@/components/ui/button';
import TaskColumn from '@/components/ui/column';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import CreateColumnModal from '@/components/modals/CreateColumnModal';
import { Plus } from 'lucide-react';
import type { Column, Task, User } from '@shared/schema';

interface KanbanBoardProps {
  boardId: number;
  users: User[];
}

const KanbanBoard = ({ boardId, users }: KanbanBoardProps) => {
  const dispatch = useDispatch();
  const columns = useSelector((state: RootState) => state.board.columns);
  const tasks = useSelector((state: RootState) => state.board.tasks);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingColumn, setEditingColumn] = useState<Column | undefined>(undefined);

  // Load columns on mount
  useEffect(() => {
    if (boardId) {
      dispatch(fetchColumns(boardId));
    }
  }, [boardId, dispatch]);

  // Load tasks for each column
  useEffect(() => {
    columns.forEach(column => {
      dispatch(fetchTasks(column.id));
    });
  }, [columns, dispatch]);

  const handleCreateTask = (columnId?: number) => {
    setSelectedColumn(columnId);
    setEditingTask(undefined);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleCreateColumn = () => {
    setEditingColumn(undefined);
    setColumnModalOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setColumnModalOpen(true);
  };

  const getColumnTasks = (columnId: number): Task[] => {
    return tasks[columnId] || [];
  };

  return (
    <div className="flex-1 overflow-auto bg-neutral-100 p-4 lg:p-6">
      <div className="flex space-x-4 h-full overflow-x-auto pb-4 scrollbar-hide">
        {columns.map(column => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={getColumnTasks(column.id)}
            users={users}
            onCreateTask={handleCreateTask}
            onEditColumn={handleEditColumn}
          />
        ))}

        {/* Add Column Button */}
        <div className="flex-shrink-0 w-80 h-full flex items-start">
          <Button
            variant="outline"
            className="mt-0 px-4 py-2 bg-white border border-dashed border-neutral-300 rounded-md text-neutral-600 hover:text-neutral-800 hover:border-neutral-400 shadow-sm transition-colors flex items-center justify-center"
            onClick={handleCreateColumn}
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Column
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        columnId={selectedColumn}
        editTask={editingTask}
      />

      <CreateColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        editColumn={editingColumn}
      />
    </div>
  );
};

export default KanbanBoard;
