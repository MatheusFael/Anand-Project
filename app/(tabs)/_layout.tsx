import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { firebaseUser, profile, viewedPatient, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!firebaseUser || !profile) {
      router.replace('/login');
      return;
    }

    if (profile.type === 'profissional' && !viewedPatient) {
      router.replace('/profissional');
    }
  }, [firebaseUser, profile, viewedPatient, router, loading]);

  if (loading) {
    return null;
  }

  if (!firebaseUser || !profile || (profile.type === 'profissional' && !viewedPatient)) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#01937C',
        tabBarInactiveTintColor: '#7ea89f',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#012b25',
          borderTopColor: '#0b4f43',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tempo Real',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="waveform.path.ecg" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
