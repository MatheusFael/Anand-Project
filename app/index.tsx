import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

export default function IndexScreen() {
  const { firebaseUser, profile, viewedPatient, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!firebaseUser || !profile) {
    return <Redirect href="/login" />;
  }

  if (profile.type === 'profissional' && !viewedPatient) {
    return <Redirect href="/profissional" />;
  }

  return <Redirect href="/(tabs)" />;
}
