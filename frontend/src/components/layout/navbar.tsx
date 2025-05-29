import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, usePermissions } from '@/hooks/use-auth';
import { 
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { LogOut, User, Flag, Building2, Settings } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isOwner, isAdmin } = usePermissions();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const getUserInitials = () => {
    if (!user?.name) return user?.email?.charAt(0).toUpperCase() || 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-2 px-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 group mr-6">
            <div className="rounded-full bg-gradient-to-br from-nobug-600 to-nobug-400 p-1.5 flex items-center justify-center shadow-sm hover:shadow-nobug-300/50 transition-all duration-300">
              <Flag className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-nobug-600 to-nobug-500 text-transparent bg-clip-text group-hover:from-nobug-700 group-hover:to-nobug-500 transition-colors">
              NOBUG <span className="font-semibold">OKRs</span>
            </span>
          </Link>
          
          {isAuthenticated && (
            <NavigationMenu>
              <NavigationMenuList className="flex items-center space-x-1">
                <Link to="/dashboard">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive('/dashboard') && "bg-accent text-accent-foreground"
                    )}
                  >
                    Dashboard
                  </NavigationMenuLink>
                </Link>
                
                {(isOwner || isAdmin) && (
                  <Link to="/cycles">
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isActive('/cycles') && "bg-accent text-accent-foreground"
                      )}
                    >
                      Ciclos
                    </NavigationMenuLink>
                  </Link>
                )}
                
                
                
                <Link to="/users">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive('/users') && "bg-accent text-accent-foreground"
                    )}
                  >
                    Usuários
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 pr-3 transition-colors">
                  <Avatar className="h-8 w-8 border border-nobug-100">
                    <AvatarFallback className="bg-gradient-to-br from-nobug-500 to-nobug-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block">
                    {user?.name || user?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                
                {(isOwner || isAdmin) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/company-settings" className="flex items-center cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4" />
                        Configurações da Empresa
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-nobug-500 to-nobug-600 text-white rounded-md hover:from-nobug-600 hover:to-nobug-700 transition-colors shadow-sm"
            >
              Cadastro
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
