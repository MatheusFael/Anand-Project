import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { auth, db } from '@/firebaseConfig';

export type UserType = 'profissional' | 'paciente';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  type: UserType;
};

export type ViewedPatient = {
  uid: string;
  name: string;
  email: string;
  type: 'paciente';
  patientId?: string;
  monitoringStatus?: string;
};

type AuthContextValue = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  viewedPatient: ViewedPatient | null;
  setViewedPatient: (patient: ViewedPatient | null) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [viewedPatient, setViewedPatient] = useState<ViewedPatient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (!currentUser) {
        setFirebaseUser(null);
        setProfile(null);
        setViewedPatient(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(currentUser);

      try {
        const snapshot = await getDoc(doc(db, 'users', currentUser.uid));

        if (snapshot.exists()) {
          const data = snapshot.data() as {
            name?: string;
            email?: string;
            type?: UserType;
          };

          const nextProfile: UserProfile = {
            uid: currentUser.uid,
            name: data.name ?? currentUser.displayName ?? '',
            email: data.email ?? currentUser.email ?? '',
            type: data.type === 'profissional' ? 'profissional' : 'paciente',
          };

          setProfile(nextProfile);

          if (nextProfile.type === 'paciente') {
            setViewedPatient({
              uid: nextProfile.uid,
              name: nextProfile.name,
              email: nextProfile.email,
              type: 'paciente',
            });
          } else {
            setViewedPatient(null);
          }
        } else {
          const fallbackProfile: UserProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName ?? '',
            email: currentUser.email ?? '',
            type: 'paciente',
          };

          setProfile(fallbackProfile);
          setViewedPatient({
            uid: fallbackProfile.uid,
            name: fallbackProfile.name,
            email: fallbackProfile.email,
            type: 'paciente',
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const contextValue = useMemo(
    () => ({
      firebaseUser,
      profile,
      viewedPatient,
      setViewedPatient,
      loading,
    }),
    [firebaseUser, profile, viewedPatient, loading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
