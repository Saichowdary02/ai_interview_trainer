// Simple auth hook that works with App.js state management
export const useAuth = () => {
  // This hook is designed to work with the auth state managed in App.js
  // For now, it provides access to localStorage values
  // In a real implementation, this would be connected to App.js via context or props
  
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const token = localStorage.getItem('token');
  
  return {
    user,
    token
  };
};
