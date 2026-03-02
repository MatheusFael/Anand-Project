import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearLoggedUser, clearViewedPatient, getLoggedUser } from '@/constants/mock-session';

export default function ProfileScreen() {
  const router = useRouter();
  const user = getLoggedUser();
  const isProfessional = user?.type === 'profissional';
  const accountTypeLabel =
    user?.type === 'profissional' ? 'Profissional' : user?.type === 'paciente' ? 'Paciente' : 'Não identificado';

  const handleBackToPatients = () => {
    clearViewedPatient();
    router.replace('/profissional');
  };

  const handleLogout = () => {
    clearLoggedUser();
    router.replace('../login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Configurações da conta e do dispositivo</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Dispositivo</Text>
          <Text style={styles.value}>ESP32-Sensor-01</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>Conectado</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{user?.name || 'Não identificado'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{user?.email || 'Não identificado'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tipo de conta</Text>
          <Text style={styles.value}>{accountTypeLabel}</Text>
        </View>

        {isProfessional ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackToPatients} activeOpacity={0.85}>
            <Text style={styles.backButtonText}>Voltar para lista de pacientes</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </TouchableOpacity>
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
    padding: 16,
    gap: 12,
  },
  title: {
    color: '#eef4ff',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#88b6ac',
    fontSize: 15,
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    padding: 12,
    gap: 6,
  },
  label: {
    color: '#97abd0',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    color: '#edf5ff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  backButtonText: {
    color: '#88b6ac',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7b2335',
    backgroundColor: '#3a0d1b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutButtonText: {
    color: '#ff8da4',
    fontSize: 15,
    fontWeight: '700',
  },
});
