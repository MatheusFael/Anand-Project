import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020a24',
  },
  container: {
    flex: 1,
    backgroundColor: '#020a24',
    padding: 16,
    gap: 12,
  },
  title: {
    color: '#eef4ff',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8ea3c8',
    fontSize: 15,
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#223b62',
    backgroundColor: '#0b1a37',
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
});
