import { useAuth } from '@/contexts/AuthContext';

// Define admin emails here
const ADMIN_EMAILS = [
  'admin@andrhasweets.com',
  'owner@andrhasweets.com',
  // Add more admin emails as needed
];

export const useEmailAdmin = () => {
  const { user, isLoading } = useAuth();
  
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  
  return {
    isAdmin,
    isLoading,
  };
};