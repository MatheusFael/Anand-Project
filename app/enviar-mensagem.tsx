import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';

export default function EnviarMensagemScreen() {
  const router = useRouter();
  const { profile, viewedPatient, messagesByPatient, setMessageForPatient } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!profile) {
      return;
    }

    if (profile.type !== 'profissional') {
      router.replace('/');
      return;
    }

    if (viewedPatient) {
      setMessage(messagesByPatient[viewedPatient.uid] ?? '');
    }
  }, [profile, viewedPatient, messagesByPatient, router]);

  const handleSend = async () => {
    if (!viewedPatient || !profile || profile.type !== 'profissional') {
      return;
    }

    const texto = message.trim();

    if (!texto) {
      return;
    }

    try {
      await setDoc(doc(db, 'patientMessages', viewedPatient.uid), {
        message: texto,
        professionalId: profile.uid,
        updatedAt: serverTimestamp(),
      });

      setMessageForPatient(viewedPatient.uid, texto);
      router.replace('/');
    } catch (error) {
      console.warn('Erro ao enviar mensagem para Firestore:', error);
    }
  };

  const handleBack = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
      >
        <Text style={styles.title}>Enviar mensagem ao paciente</Text>

        {viewedPatient ? (
          <Text style={styles.subtitle}>Para: {viewedPatient.name}</Text>
        ) : (
          <Text style={[styles.subtitle, styles.warningText]}>
            Selecione um paciente antes de enviar uma mensagem.
          </Text>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Mensagem atual</Text>
          <TextInput
            style={[styles.textInput, message ? styles.textInputFilled : undefined]}
            value={message}
            onChangeText={setMessage}
            placeholder="Digite aqui a mensagem"
            placeholderTextColor="#7c8d86"
            multiline
            textAlignVertical="top"
            editable={Boolean(viewedPatient)}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !viewedPatient || !message.trim() ? styles.buttonDisabled : null]}
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={!viewedPatient || !message.trim()}
        >
          <Text style={styles.buttonText}>Enviar mensagem</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleBack} activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Voltar para tela inicial</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    gap: 15,
  },
  title: {
    color: '#eef4ff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#88b6ac',
    fontSize: 14,
  },
  warningText: {
    color: '#ff8da4',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    padding: 12,
    gap: 10,
  },
  cardLabel: {
    color: '#9ab8b4',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textInput: {
    minHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#021610',
    color: '#eef4ff',
    textAlignVertical: 'top',
    padding: 10,
  },
  textInputFilled: {
    borderColor: '#19a17b',
  },
  button: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#19a17b',
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#2a473f',
    borderColor: '#1e584f',
  },
  buttonText: {
    color: '#eef4ff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#88b6ac',
    backgroundColor: '#072923',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 2,
  },
  secondaryButtonText: {
    color: '#88b6ac',
    fontSize: 13,
    fontWeight: '700',
  },
});