import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onValue, ref } from 'firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { db, realtimeDb } from '@/firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const { firebaseUser, profile, viewedPatient, setViewedPatient, loading, messagesByPatient } = useAuth();
  const isProfessional = profile?.type === 'profissional';
  const currentMessage = viewedPatient ? messagesByPatient[viewedPatient.uid] : undefined;
  const [liveMessage, setLiveMessage] = useState<string | undefined>(undefined);
  const [livePitch, setLivePitch] = useState<number | null>(null);
  const [liveRoll, setLiveRoll] = useState<number | null>(null);

  // Mock de telemetria ate a integracao da ESP + MPU6050.
  const mockSensor = {    pitch: 31.6,
    roll: 7.8,
    status: 'correta' as const,
    history: [
      { time: '10:05', angle: 28.9, note: 'Execucao correta' },
      { time: '09:42', angle: 35.1, note: 'Punho acima do ideal' },
      { time: '09:11', angle: 30.2, note: 'Execucao correta' },
    ],
  };

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
    const sensorRef = ref(realtimeDb, 'sensors/esp001');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as { pitch?: number; roll?: number };
        setLivePitch(data?.pitch ?? null);
        setLiveRoll(data?.roll ?? null);
      } else {
        setLivePitch(null);
        setLiveRoll(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading || !firebaseUser || !profile) {
    return null;
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

          <View style={styles.valueRow}>
            <View style={styles.sensorBox}>
              <Text style={styles.axisLabel}>Inclinação Vertical</Text>
              <Text style={styles.axisValue}>{mockSensor.pitch.toFixed(1)}°</Text>
            </View>
            <View style={styles.sensorBox}>
              <Text style={styles.axisLabel}>Inclinação Lateral</Text>
              <Text style={styles.axisValue}>{mockSensor.roll.toFixed(1)}°</Text>
            </View>
          </View>

          <Text style={styles.helperText}>Valores reais retornados pela ESP (MPU6050).</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Interpretacao dos Dados</Text>
            <Text
              style={[
                styles.statusPill,
                mockSensor.status === 'correta' ? styles.statusPillSuccess : styles.statusPillDanger,
              ]}>
              {mockSensor.status === 'correta' ? 'Posicao correta' : 'Posicao incorreta'}
            </Text>
          </View>

          <Text style={styles.interpretationText}>
            {mockSensor.status === 'correta'
              ? 'O punho esta alinhado com o angulo esperado para o exercicio.'
              : 'Corrija a inclinacao do punho para evitar sobrecarga.'}
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
            {livePitch !== null && liveRoll !== null
              ? `Pitch: ${livePitch.toFixed(2)}°, Roll: ${liveRoll.toFixed(2)}°`
              : 'Aguardando leitura do sensor...'}
          </Text>
        </View>

        <Text style={styles.footerText}>Última leitura: 01/03/2026 20:58:44</Text>
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
