import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const mockSensor = {
    history: [
      { time: '10:05', pitch: 28.9, roll: 4.1, note: 'Execucao correta' },
      { time: '09:42', pitch: 35.1, roll: 12.5, note: 'Punho acima do ideal' },
      { time: '09:11', pitch: 30.2, roll: 7.2, note: 'Execucao correta' },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Últimas leituras do MPU6050 (Pitch/Roll)</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Histórico do Paciente</Text>
            <Text style={styles.badgeMuted}>Últimas leituras</Text>
          </View>

          <View style={styles.historyList}>
            {mockSensor.history.map((entry) => (
              <View key={`${entry.time}-${entry.pitch}-${entry.roll}`} style={styles.historyItem}>
                <Text style={styles.historyTime}>{entry.time}</Text>
                <View style={styles.historyCenter}>
                  <Text style={styles.historyAngle}>Inclinação Vertical: {entry.pitch.toFixed(1)}° · Inclinação Lateral: {entry.roll.toFixed(1)}°</Text>
                  <Text style={styles.historyNote}>{entry.note}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#edf5ff',
    fontSize: 20,
    fontWeight: '700',
  },
  badgeMuted: {
    color: '#9ab8b4',
    fontSize: 12,
    fontWeight: '700',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#08332b',
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 10,
  },
  historyTime: {
    color: '#88b6ac',
    fontSize: 12,
    width: 44,
    fontWeight: '700',
  },
  historyCenter: {
    flex: 1,
  },
  historyAngle: {
    color: '#eef4ff',
    fontSize: 15,
    fontWeight: '700',
  },
  historyNote: {
    color: '#8db6ae',
    fontSize: 12,
  },
  day: {
    color: '#edf5ff',
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    color: '#8db6ae',
    fontSize: 14,
  },
});
