import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth, type ViewedPatient } from '@/contexts/auth-context';
import { db } from '@/firebaseConfig';

export default function ProfessionalSelectScreen() {
  const router = useRouter();
  const { firebaseUser, profile, setViewedPatient, loading } = useAuth();
  const [patients, setPatients] = useState<ViewedPatient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!firebaseUser || !profile || profile.type !== 'profissional') {
      router.replace('/login');
    }
  }, [firebaseUser, profile, router, loading]);

  useEffect(() => {
    const loadPatients = async () => {
      if (!firebaseUser || !profile || profile.type !== 'profissional') {
        setPatientsLoading(false);
        return;
      }

      setPatientsLoading(true);
      setErrorMessage('');

      try {
        const patientsQuery = query(collection(db, 'users'), where('type', '==', 'paciente'));
        const snapshot = await getDocs(patientsQuery);

        const loadedPatients = snapshot.docs.map((item, index) => {
          const data = item.data() as {
            name?: string;
            email?: string;
            patientId?: string;
            monitoringStatus?: string;
          };

          return {
            uid: item.id,
            name: data.name ?? 'Paciente sem nome',
            email: data.email ?? 'sem-email',
            type: 'paciente' as const,
            patientId: data.patientId ?? `#${String(index + 1).padStart(4, '0')}`,
            monitoringStatus: data.monitoringStatus ?? 'Ativo',
          };
        });

        setPatients(loadedPatients);
      } catch {
        setErrorMessage('Não foi possível carregar os pacientes.');
      } finally {
        setPatientsLoading(false);
      }
    };

    loadPatients();
  }, [firebaseUser, profile]);

  if (loading || !firebaseUser || !profile || profile.type !== 'profissional') {
    return null;
  }

  const handleSelectPatient = (patientUid: string) => {
    const patient = patients.find((item) => item.uid === patientUid);

    if (!patient) {
      return;
    }

    setViewedPatient(patient);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.title}>Olá, {profile.name || 'Profissional'}</Text>
        <Text style={styles.subtitle}>Selecione um paciente para monitorar</Text>

        {patientsLoading ? <Text style={styles.infoText}>Carregando pacientes...</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {!patientsLoading && !errorMessage && patients.length === 0 ? (
          <Text style={styles.infoText}>Nenhum paciente cadastrado.</Text>
        ) : null}

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          scrollEnabled
          nestedScrollEnabled>
          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.uid}
              style={styles.patientButton}
              onPress={() => handleSelectPatient(patient.uid)}
              activeOpacity={0.85}>
              <View style={styles.patientLeft}>
                <View style={styles.patientIconWrap}>
                  <MaterialIcons name="person" size={18} color="#01937C" />
                </View>

                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientMeta}>
                    {patient.patientId} · {patient.monitoringStatus}
                  </Text>
                </View>
              </View>

              <MaterialIcons name="chevron-right" size={22} color="#88b6ac" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#011814',
  },
  container: {
    flex: 1,
    backgroundColor: '#011814',
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: {
    color: '#eef4ff',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: '#88b6ac',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  infoText: {
    color: '#88b6ac',
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: {
    color: '#ff8da4',
    fontSize: 14,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 20,
  },
  patientButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  patientIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#083b33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInfo: {
    gap: 3,
    flex: 1,
  },
  patientName: {
    color: '#edf5ff',
    fontSize: 16,
    fontWeight: '700',
  },
  patientMeta: {
    color: '#88b6ac',
    fontSize: 13,
  },
});
