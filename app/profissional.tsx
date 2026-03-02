import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MOCK_ACCOUNTS } from '@/constants/mock-accounts';
import { getLoggedUser, setViewedPatient } from '@/constants/mock-session';

export default function ProfessionalSelectScreen() {
  const router = useRouter();
  const loggedUser = getLoggedUser();

  useEffect(() => {
    if (!loggedUser || loggedUser.type !== 'profissional') {
      router.replace('/login');
    }
  }, [loggedUser, router]);

  if (!loggedUser || loggedUser.type !== 'profissional') {
    return null;
  }

  const patients = MOCK_ACCOUNTS.filter((account) => account.type === 'paciente');

  const handleSelectPatient = (patientEmail: string) => {
    const patient = patients.find((item) => item.email === patientEmail);

    if (!patient) {
      return;
    }

    setViewedPatient({
      name: patient.name,
      email: patient.email,
      type: patient.type,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.title}>Olá, {loggedUser.name}</Text>
        <Text style={styles.subtitle}>Selecione um paciente para monitorar</Text>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          scrollEnabled
          nestedScrollEnabled>
          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.email}
              style={styles.patientButton}
              onPress={() => handleSelectPatient(patient.email)}
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
    marginBottom: 22,
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
