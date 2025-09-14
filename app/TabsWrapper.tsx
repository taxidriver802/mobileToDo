import React from 'react';
import { useAuth } from '@/context/AuthContextProvider';
import { isLoggedIn } from '@/api/auth';
import Loading from './components/loading';
import TabsLayout from './(tabs)/_layout';

export default function TabsWrapper() {
  const { setIsLogin } = useAuth();
  const [checkedLogin, setCheckedLogin] = React.useState(false);

  React.useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await isLoggedIn();
      setIsLogin(loggedIn);
      setCheckedLogin(true);
    };
    checkLogin();
  }, []);

  if (!checkedLogin) return <Loading />;

  return <TabsLayout />;
}
