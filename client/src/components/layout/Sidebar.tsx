import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Layers, Users, ChevronDown } from 'lucide-react';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ isMobile = false, isOpen = true, onToggle }: SidebarProps) => {
  const [location] = useLocation();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const workspaces = useSelector((state: RootState) => state.user.workspaces);
  const teams = useSelector((state: RootState) => state.user.teams);
  
  const [expandedWorkspace, setExpandedWorkspace] = useState<number | null>(
    workspaces.length > 0 ? workspaces[0].id : null
  );

  const toggleWorkspace = (workspaceId: number) => {
    setExpandedWorkspace(expandedWorkspace === workspaceId ? null : workspaceId);
  };

  // Sidebar classes based on mobile/desktop and open/closed state
  const sidebarClasses = cn(
    'sidebar bg-white h-full shadow-lg transition-transform duration-300 ease-in-out w-64 flex flex-col z-30',
    {
      'fixed': isMobile,
      'relative': !isMobile,
      'transform -translate-x-full': isMobile && !isOpen,
      'transform translate-x-0': !isMobile || isOpen,
    }
  );

  // Filter teams by workspace
  const getWorkspaceTeams = (workspaceId: number) => {
    return teams.filter(team => team.workspaceId === workspaceId);
  };

  return (
    <>
      <div className={sidebarClasses}>
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            <h1 className="text-xl font-bold text-neutral-800">TaskFlow</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 flex-grow overflow-y-auto">
          {/* Workspaces */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider">Workspaces</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                aria-label="Add workspace"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
            
            <ul className="space-y-1">
              {workspaces.map(workspace => (
                <li key={workspace.id}>
                  <div>
                    <Button
                      variant={expandedWorkspace === workspace.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => toggleWorkspace(workspace.id)}
                    >
                      <Layers className="h-5 w-5 mr-3" />
                      <span className="flex-1 text-left">{workspace.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        expandedWorkspace === workspace.id ? 'transform rotate-180' : ''
                      }`} />
                    </Button>
                    
                    {expandedWorkspace === workspace.id && (
                      <div className="ml-8 mt-1 space-y-1">
                        <Link href={`/workspace/${workspace.id}`}
                          className={`flex items-center px-4 py-2 rounded-md ${
                            location === `/workspace/${workspace.id}` ? 'bg-blue-50 text-primary font-medium' : 'text-neutral-600 hover:bg-neutral-100'
                          }`}>
                            Overview
                        </Link>
                        <Link href={`/workspace/${workspace.id}/boards`}
                          className={`flex items-center px-4 py-2 rounded-md ${
                            location.startsWith(`/workspace/${workspace.id}/boards`) ? 'bg-blue-50 text-primary font-medium' : 'text-neutral-600 hover:bg-neutral-100'
                          }`}>
                            Boards
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Teams */}
          {expandedWorkspace && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider">Teams</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  aria-label="Add team"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>
              </div>
              
              <ul className="space-y-1">
                {getWorkspaceTeams(expandedWorkspace).map(team => (
                  <li key={team.id}>
                    <Link href={`/team/${team.id}`}
                      className={`flex items-center px-4 py-2 rounded-md ${
                        location === `/team/${team.id}` ? 'bg-blue-50 text-primary font-medium' : 'text-neutral-600 hover:bg-neutral-100'
                      }`}>
                        <Users className="h-5 w-5 mr-3" />
                        {team.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
        
        {/* User Menu */}
        <div className="border-t p-4">
          {currentUser ? (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={currentUser.avatarUrl || ''} alt={currentUser.username} />
                <AvatarFallback>{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{currentUser.username}</p>
                <p className="text-xs text-neutral-500">{currentUser.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 focus:text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button className="w-full">Login</Button>
          )}
        </div>
      </div>
      
      {/* Sidebar Overlay (for mobile) */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
