import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Visualize leituras salvas por dia</Text>

        <View style={styles.card}>
          <Text style={styles.day}>domingo, 1 de março</Text>
          <Text style={styles.value}>23.8°C · 67% · 1012 hPa</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.day}>sábado, 28 de fevereiro</Text>
          <Text style={styles.value}>25.1°C · 63% · 1013 hPa</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.day}>sexta-feira, 27 de fevereiro</Text>
          <Text style={styles.value}>23.4°C · 65% · 1011 hPa</Text>
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
  day: {
    color: '#edf5ff',
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    color: '#96aad0',
    fontSize: 14,
  },
});
