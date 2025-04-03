import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Search, Bell, Plus, SlidersHorizontal, Download, HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import EditableTitle from '@/components/board/EditableTitle';
import type { Board } from '@shared/schema';

interface TopbarProps {
  onMenuClick: () => void;
  onNewTask: () => void;
  board: Board | null;
  lastUpdated?: Date;
  teamMembers?: any[];
  showFilters?: boolean;
  onTitleChange?: (newTitle: string) => void;
}

const Topbar = ({
  onMenuClick,
  onNewTask,
  board,
  lastUpdated,
  teamMembers = [],
  showFilters = true,
  onTitleChange
}: TopbarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const formatLastUpdated = (date?: Date) => {
    if (!date) return '';
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    
    if (minutes < 1) return 'Updated just now';
    if (minutes === 1) return 'Updated 1 minute ago';
    if (minutes < 60) return `Updated ${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Updated 1 hour ago';
    if (hours < 24) return `Updated ${hours} hours ago`;
    
    return `Updated on ${new Date(date).toLocaleDateString()}`;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-3 text-neutral-600"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div>
            {board ? (
              <EditableTitle 
                title={board.name} 
                onSave={(newTitle) => {
                  if (onTitleChange) {
                    onTitleChange(newTitle);
                  }
                }}
                className="text-lg font-semibold text-neutral-800"
              />
            ) : (
              <h1 className="text-lg font-semibold text-neutral-800">Board</h1>
            )}
            <div className="flex items-center text-sm text-neutral-500">
              <p>{formatLastUpdated(lastUpdated)}</p>
              {teamMembers && teamMembers.length > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <div className="flex -space-x-1">
                    {teamMembers.slice(0, 3).map((member, index) => (
                      <Avatar key={index} className="h-5 w-5 border border-white">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback className="text-[10px]">
                          {member.username ? member.username.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {teamMembers.length > 3 && (
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs font-medium">
                        +{teamMembers.length - 3}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <Search className="h-5 w-5 text-neutral-400 absolute left-2.5 top-2.5" />
            <Input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 bg-neutral-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white w-64"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:bg-neutral-100">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-medium border-b">Notifications</div>
                <div className="py-2 text-center text-sm text-neutral-500">
                  No new notifications
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              className="ml-2 flex items-center px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={onNewTask}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>New Task</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filters bar */}
      {showFilters && (
        <div className="px-4 py-2 border-t flex flex-wrap items-center justify-between lg:px-6">
          <div className="flex flex-wrap items-center space-x-2">
            <div className="flex items-center bg-white border rounded-md overflow-hidden">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'ghost'}
                className={`px-3 py-1.5 text-sm font-medium ${
                  activeFilter === 'all' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                onClick={() => handleFilterClick('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'my' ? 'default' : 'ghost'}
                className={`px-3 py-1.5 text-sm ${
                  activeFilter === 'my' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                onClick={() => handleFilterClick('my')}
              >
                My Tasks
              </Button>
              <Button
                variant={activeFilter === 'assigned' ? 'default' : 'ghost'}
                className={`px-3 py-1.5 text-sm ${
                  activeFilter === 'assigned' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                onClick={() => handleFilterClick('assigned')}
              >
                Assigned to Me
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center text-neutral-600">
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              Filter
            </Button>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 mt-2 md:mt-0">
            <Button variant="outline" size="sm" className="flex items-center text-neutral-600">
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center text-neutral-600">
              <HelpCircle className="h-4 w-4 mr-1.5" />
              Help
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
