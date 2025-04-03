import { useDragLayer } from 'react-dnd';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import type { Task } from '@shared/schema';

const TaskDragPreview = ({ taskId }: { taskId: number }) => {
  // Find the task in all columns
  const allTasks = useSelector((state: RootState) => {
    return Object.values(state.board.tasks).flat();
  });
  
  const task = allTasks.find(t => t.id === taskId);

  if (!task) return null;

  return (
    <Card className="task-card bg-white rounded-md shadow p-3 w-[300px] opacity-90">
      <div className="mb-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {task.category}
        </span>
      </div>
      <h4 className="font-medium text-neutral-800 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-neutral-600 mb-2 truncate">{task.description}</p>
      )}
    </Card>
  );
};

const DragLayer = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: 0,
        top: 0,
        transform
      }}
    >
      {itemType === 'TASK' && <TaskDragPreview taskId={item.id} />}
    </div>
  );
};

export default DragLayer;
