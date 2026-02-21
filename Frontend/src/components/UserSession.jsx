import { Navigate } from 'react-router-dom';

export default function UserSession({ children }) {
  // Check if the browser remembers a successful login
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // If there is no ticket, return back to the Login screen
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}