import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function UnAuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Redirect href={'/'} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
