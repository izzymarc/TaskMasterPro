import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, PenLine } from 'lucide-react';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
  isEditing?: boolean;
}

const EditableTitle = ({
  title,
  onSave,
  className = '',
  isEditing: initialEditingState = false
}: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(initialEditingState);
  const [inputValue, setInputValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    // Don't save empty titles
    if (inputValue.trim() === '') {
      setInputValue(title);
      setIsEditing(false);
      return;
    }
    
    // Only save if the title has changed
    if (inputValue !== title) {
      onSave(inputValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {isEditing ? (
        <div className="flex items-center space-x-1">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="font-medium py-1 px-2"
          />
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleSave}
              title="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleCancel}
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <h2 className={className}>{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            onClick={() => setIsEditing(true)}
            title="Edit title"
          >
            <PenLine className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditableTitle;