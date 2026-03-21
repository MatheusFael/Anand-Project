import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onValue, ref } from 'firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { db, realtimeDb } from '@/firebaseConfig';

interface SensorData {
  pitch: number | null;
  roll: number | null;
  updatedAt: number | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const { firebaseUser, profile, viewedPatient, setViewedPatient, loading, messagesByPatient } = useAuth();
  const isProfessional = profile?.type === 'profissional';
  const currentMessage = viewedPatient ? messagesByPatient[viewedPatient.uid] : undefined;
  const [liveMessage, setLiveMessage] = useState<string | undefined>(undefined);
  const [sensorData, setSensorData] = useState<SensorData>({
    pitch: null,
    roll: null,
    updatedAt: null,
  });



  useEffect(() => {
    const targetPatientUid =
      profile?.type === 'paciente'
        ? profile.uid
        : viewedPatient?.uid;

    if (!targetPatientUid) {
      setLiveMessage(undefined);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'patientMessages', targetPatientUid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as { message?: string };
        setLiveMessage(data?.message ?? undefined);
      } else {
        setLiveMessage(undefined);
      }
    });

    return () => unsubscribe();
  }, [profile, viewedPatient]);

  useEffect(() => {
    const sensorRef = ref(realtimeDb, 'angulacao');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as { horizontal?: number; vertical?: number };
        setSensorData({
          pitch: data?.vertical ?? null,
          roll: data?.horizontal ?? null,
          updatedAt: Date.now(),
        });
      } else {
        setSensorData({ pitch: null, roll: null, updatedAt: null });
      }
    });

    return () => unsubscribe();
  }, []);

  // Determina status baseado em valores reais (dentro do range esperado)
  const getAngleStatus = () => {
    if (sensorData.pitch === null || sensorData.roll === null) {
      return 'aguardando';
    }
    const pitch = Math.abs(sensorData.pitch);
    const roll = Math.abs(sensorData.roll);
    // Range esperado: pitch -15 a 15, roll -10 a 10
    if (pitch <= 15 && roll <= 10) {
      return 'correta';
    }
    return 'incorreta';
  };

  // Formata timestamp do Firebase (milissegundos desde 1970)
  const formatSensorTime = () => {
    if (!sensorData.updatedAt) return '--:--:--';
    const date = new Date(sensorData.updatedAt);
    return date.toLocaleTimeString('pt-BR');
  };

  if (loading) {
    return null;
  }

  if (!firebaseUser || !profile) {
    return <Redirect href="/login" />;
  }

  if (profile.type === 'profissional' && !viewedPatient) {
    return <Redirect href="/profissional" />;
  }

  const headerTitle = viewedPatient?.name || 'Paciente não selecionado';

  const handleBackToPatients = () => {
    setViewedPatient(null);
    router.replace('/profissional');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.title}>{headerTitle}</Text>
            <Text style={styles.subtitle}>Dados em tempo real do MPU6050</Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.connectedBadge}>
              <MaterialIcons name="wifi" size={15} color="#01937C" />
              <Text style={styles.connectedText}>Conectado</Text>
            </View>

            {isProfessional ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBackToPatients} activeOpacity={0.85}>
                <MaterialIcons name="arrow-back" size={16} color="#88b6ac" />
                <Text style={styles.backButtonText}>Pacientes</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Angulo da Mao</Text>
            <Text style={styles.badgeMuted}>Tempo real</Text>
          </View>

          {sensorData.pitch !== null && sensorData.roll !== null ? (
            <>
              <View style={styles.valueRow}>
                <View style={styles.sensorBox}>
                  <Text style={styles.axisLabel}>Inclinação Vertical</Text>
                  <Text style={styles.axisValue}>{sensorData.pitch.toFixed(1)}°</Text>
                </View>
                <View style={styles.sensorBox}>
                  <Text style={styles.axisLabel}>Inclinação Lateral</Text>
                  <Text style={styles.axisValue}>{sensorData.roll.toFixed(1)}°</Text>
                </View>
              </View>
              <Text style={styles.helperText}>Valores reais retornados pela ESP (MPU6050).</Text>
            </>
          ) : (
            <Text style={styles.interpretationText}>
              Aguardando conexão com sensor...
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Interpretacao dos Dados</Text>
            <Text
              style={[
                styles.statusPill,
                getAngleStatus() === 'correta' ? styles.statusPillSuccess : getAngleStatus() === 'incorreta' ? styles.statusPillDanger : styles.statusPillMuted,
              ]}>
              {getAngleStatus() === 'correta'
                ? 'Posicao correta'
                : getAngleStatus() === 'incorreta'
                  ? 'Posicao incorreta'
                  : 'Aguardando...'}
            </Text>
          </View>

          <Text style={styles.interpretationText}>
            {getAngleStatus() === 'correta'
              ? 'O punho esta alinhado corretamente com o angulo esperado para o exercicio.'
              : getAngleStatus() === 'incorreta'
                ? 'A inclinacao do punho esta fora do intervalo esperado. Corrija para evitar sobrecarga.'
                : 'Aguardando dados do sensor MPU6050...'}
          </Text>
        </View>

        {isProfessional ? (
          <TouchableOpacity
            style={styles.sendMessageButton}
            onPress={() => router.push('/enviar-mensagem')}
            activeOpacity={0.85}
          >
            <Text style={styles.sendMessageButtonText}>Enviar mensagem ao paciente</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {isProfessional ? 'Mensagem atual para o paciente' : 'Mensagem do profissional'}
            </Text>
          </View>

          <Text style={styles.interpretationText}>
            {liveMessage?.trim().length
              ? liveMessage
              : currentMessage?.trim().length
                ? currentMessage
                : 'Nenhuma mensagem enviada ainda.'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Leitura de sensor (ESP)</Text>
          </View>

          <Text style={styles.interpretationText}>
            {sensorData.pitch !== null && sensorData.roll !== null
              ? `Pitch: ${sensorData.pitch.toFixed(2)}°, Roll: ${sensorData.roll.toFixed(2)}°`
              : 'Aguardando leitura do sensor...'}
          </Text>
        </View>

        <Text style={styles.footerText}>Última leitura: {formatSensorTime()}</Text>
      </ScrollView>
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
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 12,
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
    marginTop: 8,
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
  backButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 5,
  },
  backButtonText: {
    color: '#88b6ac',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    padding: 12,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    color: '#edf5ff',
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    color: '#28e3bf',
    fontSize: 12,
    fontWeight: '700',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#0f6454',
    backgroundColor: '#083b33',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeMuted: {
    color: '#9ab8b4',
    fontSize: 12,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sensorBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#08332b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    minWidth: 115,
  },
  axisLabel: {
    color: '#8bb5aa',
    fontSize: 12,
    fontWeight: '700',
  },
  axisValue: {
    color: '#eef4ff',
    fontSize: 24,
    fontWeight: '800',
  },
  angleValue: {
    color: '#eef4ff',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
  },
  helperText: {
    color: '#88b6ac',
    fontSize: 13,
  },
  statusPill: {
    fontSize: 12,
    fontWeight: '700',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  statusPillSuccess: {
    color: '#44f3ce',
    borderColor: '#0f6454',
    backgroundColor: '#083b33',
  },
  statusPillDanger: {
    color: '#ff8da4',
    borderColor: '#7b2335',
    backgroundColor: '#3a0d1b',
  },
  statusPillMuted: {
    color: '#9ab8b4',
    borderColor: '#1e584f',
    backgroundColor: '#072923',
  },
  interpretationText: {
    color: '#d7e9e4',
    fontSize: 15,
    lineHeight: 21,
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
  sendMessageButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#19a17b',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  sendMessageButtonText: {
    color: '#eef4ff',
    fontSize: 15,
    fontWeight: '700',
  },
  footerText: {
    color: '#6e9d93',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
});
