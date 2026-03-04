import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// firebase imports
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (isLoading) {
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setErrorMessage('Preencha e-mail e senha.');
            return;
        }

        setErrorMessage('');
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, normalizedEmail, password);
            router.replace('/');
        } catch (error: any) {
            const code = error?.code as string | undefined;
            if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
                setErrorMessage('E-mail ou senha inválidos.');
            } else if (code === 'auth/invalid-email') {
                setErrorMessage('E-mail inválido.');
            } else {
                setErrorMessage('Não foi possível entrar. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

                <View style={styles.form}>
                    <View style={styles.fieldBlock}>
                        <Text style={styles.label}>E-mail</Text>
                        <TextInput
                            placeholder="seuemail@exemplo.com"
                            placeholderTextColor="#7c91b6"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.fieldBlock}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            placeholder="••••••••"
                            placeholderTextColor="#7c91b6"
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                    <TouchableOpacity
                        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                        onPress={handleLogin}
                        activeOpacity={0.85}
                        disabled={isLoading}>
                        <Text style={styles.primaryButtonText}>{isLoading ? 'Entrando...' : 'Login'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Ainda não tem conta?</Text>
                    <Link href="../cadastro" style={styles.footerLink}>
                        Cadastrar
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
    errorText: {
        color: '#ff8da4',
        fontSize: 13,
        fontWeight: '600',
    },
    primaryButtonDisabled: {
        opacity: 0.7,
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
