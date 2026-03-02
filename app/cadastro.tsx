import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const [userType, setUserType] = useState<'profissional' | 'paciente'>('profissional');

  const handleRegister = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>Crie sua conta para começar</Text>

        <View style={styles.form}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              placeholder="Seu nome completo"
              placeholderTextColor="#7c91b6"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#7c91b6"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#7c91b6"
              style={styles.input}
              secureTextEntry
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Profissional ou Paciente</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity
                style={[styles.selectorButton, userType === 'profissional' && styles.selectorButtonActive]}
                onPress={() => setUserType('profissional')}
                activeOpacity={0.85}>
                <Text style={[styles.selectorText, userType === 'profissional' && styles.selectorTextActive]}>
                  Profissional
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectorButton, userType === 'paciente' && styles.selectorButtonActive]}
                onPress={() => setUserType('paciente')}
                activeOpacity={0.85}>
                <Text style={[styles.selectorText, userType === 'paciente' && styles.selectorTextActive]}>
                  Paciente
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Link href="../login" style={styles.footerLink}>
            Fazer login
          </Link>
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
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: '#011814',
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
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    color: '#a8c0e6',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    color: '#edf5ff',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e584f',
    backgroundColor: '#072923',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  selectorButtonActive: {
    borderColor: '#01937C',
    backgroundColor: '#0a4f43',
  },
  selectorText: {
    color: '#88b6ac',
    fontSize: 15,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#01937C',
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#01937C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#eef4ff',
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#88b6ac',
    fontSize: 14,
  },
  footerLink: {
    color: '#01937C',
    fontSize: 14,
    fontWeight: '700',
  },
});
