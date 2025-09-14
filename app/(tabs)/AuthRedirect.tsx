import { useAuth } from '../../context/AuthContextProvider';
import { Redirect } from 'expo-router';
import React from 'react';

interface AuthRedirectProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires login, false = requires logout
  redirectTo: string;
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({
  children,
  requireAuth = true,
  redirectTo,
}) => {
  const { isLogin } = useAuth();

  // Redirect logic
  if (requireAuth && !isLogin) {
    return <Redirect href={redirectTo as any} />;
  }

  if (!requireAuth && isLogin) {
    return <Redirect href={redirectTo as any} />;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AuthRedirect requireAuth={true} redirectTo="/profile">
    {children}
  </AuthRedirect>
);

export const RequireNoAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AuthRedirect requireAuth={false} redirectTo="/home">
    {children}
  </AuthRedirect>
);
