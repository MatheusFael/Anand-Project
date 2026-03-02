import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.title}>Monitor de Sensores</Text>
            <Text style={styles.subtitle}>Dados em tempo real do ESP</Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.connectedBadge}>
              <MaterialIcons name="wifi" size={15} color="#01937C" />
              <Text style={styles.connectedText}>Conectado</Text>
            </View>

            <View style={styles.refreshButton}>
              <MaterialIcons name="refresh" size={16} color="#8ca2c9" />
              <Text style={styles.refreshText}>Atualizar</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, styles.metricCardTemperature]}>
            <Text style={styles.metricLabel}>Temperatura</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>25.3</Text>
              <Text style={styles.metricUnit}>°C</Text>
            </View>
            <Text style={[styles.metricDelta, styles.metricDeltaDown]}>↓ 1.3 desde ontem</Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardHumidity]}>
            <Text style={styles.metricLabel}>Umidade</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>68.0</Text>
              <Text style={styles.metricUnit}>%</Text>
            </View>
            <Text style={[styles.metricDelta, styles.metricDeltaUp]}>↑ 7.1 desde ontem</Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardPressure]}>
            <Text style={styles.metricLabel}>Pressão</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>1013</Text>
              <Text style={styles.metricUnit}>hPa</Text>
            </View>
            <Text style={[styles.metricDelta, styles.metricDeltaMuted]}>Estável</Text>
          </View>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Monitoramento em Tempo Real</Text>
              <Text style={styles.liveTag}>Ao vivo</Text>
            </View>

            <View style={styles.chartArea}>
              <View style={[styles.gridLine, { top: 20 }]} />
              <View style={[styles.gridLine, { top: 74 }]} />
              <View style={[styles.gridLine, { top: 128 }]} />
              <View style={[styles.gridLine, { top: 182 }]} />

              <View style={styles.tempLine} />
              <View style={styles.humidityLine} />

              <Text style={[styles.axisLabel, { left: 10, bottom: 6 }]}>09:00</Text>
              <Text style={[styles.axisLabel, { left: 78, bottom: 6 }]}>12:00</Text>
              <Text style={[styles.axisLabel, { left: 145, bottom: 6 }]}>14:30</Text>
            </View>
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Histórico Diário</Text>

            <View style={styles.historyItem}>
              <Text style={styles.historyDay}>domingo, 1 de março</Text>
              <Text style={styles.historyReading}>🌡 23.8°C</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyDay}>sábado, 28 de fevereiro</Text>
              <Text style={styles.historyReading}>🌡 25.1°C</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyDay}>sexta-feira, 27 de fevereiro</Text>
              <Text style={styles.historyReading}>🌡 23.4°C</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>Última leitura: 01/03/2026 20:58:44</Text>
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
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: '#eef4ff',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
    maxWidth: 180,
  },
  subtitle: {
    color: '#88b6ac',
    fontSize: 21,
    lineHeight: 26,
    marginTop: 8,
    maxWidth: 175,
  },
  headerActions: {
    gap: 10,
    marginTop: 10,
  },
  connectedBadge: {
    borderRadius: 999,
    backgroundColor: '#083b33',
    borderWidth: 1,
    borderColor: '#0f6454',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  connectedText: {
    color: '#01937C',
    fontSize: 14,
    fontWeight: '700',
  },
  refreshButton: {
    borderRadius: 8,
    backgroundColor: '#f3f6fb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 9,
    gap: 6,
  },
  refreshText: {
    color: '#59797a',
    fontSize: 14,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    minHeight: 138,
    justifyContent: 'space-between',
  },
  metricCardTemperature: {
    backgroundColor: '#17312b',
    borderColor: '#2f5f53',
  },
  metricCardHumidity: {
    backgroundColor: '#163731',
    borderColor: '#2f6e60',
  },
  metricCardPressure: {
    backgroundColor: '#1a2f2b',
    borderColor: '#3f6a63',
  },
  metricLabel: {
    color: '#a8c0e6',
    fontSize: 14,
    fontWeight: '600',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  metricValue: {
    color: '#f3f7ff',
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
  },
  metricUnit: {
    color: '#95abc8',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 7,
  },
  metricDelta: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricDeltaDown: {
    color: '#ff5f7b',
  },
  metricDeltaUp: {
    color: '#45f8ce',
  },
  metricDeltaMuted: {
    color: '#9fadd1',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  chartCard: {
    flex: 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#f0f6ff',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    maxWidth: 165,
  },
  liveTag: {
    color: '#32e2b7',
    fontSize: 13,
    fontWeight: '700',
  },
  chartArea: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#206359',
    backgroundColor: '#06231e',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 250,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#1a4d45',
  },
  tempLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#2c8bff',
  },
  humidityLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 156,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#ff892d',
  },
  axisLabel: {
    position: 'absolute',
    color: '#7caea3',
    fontSize: 12,
  },
  historyCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#06231e',
    padding: 12,
    gap: 12,
  },
  historyTitle: {
    color: '#f2f7ff',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
  },
  historyItem: {
    borderTopWidth: 1,
    borderTopColor: '#1a4d45',
    paddingTop: 10,
    gap: 6,
  },
  historyDay: {
    color: '#eef4ff',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  historyReading: {
    color: '#8db6ae',
    fontSize: 14,
  },
  footerText: {
    color: '#6e9d93',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});
