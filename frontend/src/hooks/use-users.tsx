
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

interface UsersState {
  users: User[];
  addUser: (userData: { name: string; email: string; password?: string }) => void;
  updateUser: (userId: string, userData: { name: string; email: string; active?: boolean; password?: string }) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  isAdmin: (email: string) => boolean;
}

export const useUsers = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      addUser: (userData) => {
        const newUser: User = {
          id: uuidv4(),
          name: userData.name,
          email: userData.email,
          password: userData.password, // Store password if provided
          active: true,
          isAdmin: userData.email === 'dinei@nobug.com.br',
        };
        set((state) => ({ 
          users: [...state.users, newUser] 
        }));
      },
      updateUser: (userId, userData) => {
        // Store the previous name for the global event
        const prevUser = get().users.find((user) => user.id === userId);
        
        // Update the user in the state
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, ...userData } : user
          )
        }));

        // If name changed, dispatch a custom event that will be listened to 
        // by components that need to update activity assignees
        if (prevUser && prevUser.name !== userData.name) {
          // Use setTimeout to ensure the state update completes first
          setTimeout(() => {
            // Dispatch a custom event with the old and new names
            const event = new CustomEvent('userNameChanged', { 
              detail: { 
                oldName: prevUser.name, 
                newName: userData.name 
              } 
            });
            window.dispatchEvent(event);
          }, 0);
        }
      },
      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        }));
      },
      toggleUserStatus: (userId) => {
        set((state) => ({
          users: state.users.map((user) => 
            user.id === userId ? { ...user, active: !user.active } : user
          )
        }));
      },
      isAdmin: (email) => {
        return email === 'dinei@nobug.com.br';
      }
    }),
    {
      name: 'nobug-users',
    }
  )
);
