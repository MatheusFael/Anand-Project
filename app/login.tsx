import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MOCK_ACCOUNTS } from '@/constants/mock-accounts';
import { clearViewedPatient, setLoggedUser, setViewedPatient } from '@/constants/mock-session';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const professionalAccount = MOCK_ACCOUNTS.find((item) => item.type === 'profissional');
    const samplePatient = MOCK_ACCOUNTS.find((item) => item.type === 'paciente');

    const handleLogin = () => {
        const normalizedEmail = email.trim().toLowerCase();

        const account = MOCK_ACCOUNTS.find(
            (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
        );

        if (!account) {
            setErrorMessage('Credenciais inválidas. Use uma conta de teste abaixo.');
            return;
        }

        setErrorMessage('');
        setLoggedUser({
            name: account.name,
            email: account.email,
            type: account.type,
        });

        if (account.type === 'profissional') {
            clearViewedPatient();
            router.replace('/profissional');
            return;
        }

        setViewedPatient({
            name: account.name,
            email: account.email,
            type: account.type,
        });
        router.replace('/(tabs)');
    };
//ronaldo
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

                    <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
                        <Text style={styles.primaryButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.testAccountsCard}>
                    <Text style={styles.testAccountsTitle}>Contas de teste</Text>
                    {professionalAccount ? (
                        <View style={styles.testAccountItem}>
                            <Text style={styles.testAccountType}>PROFISSIONAL</Text>
                            <Text style={styles.testAccountText}>E-mail: {professionalAccount.email}</Text>
                            <Text style={styles.testAccountText}>Senha: {professionalAccount.password}</Text>
                        </View>
                    ) : null}

                    {samplePatient ? (
                        <View style={styles.testAccountItem}>
                            <Text style={styles.testAccountType}>PACIENTE (EXEMPLO)</Text>
                            <Text style={styles.testAccountText}>E-mail: {samplePatient.email}</Text>
                            <Text style={styles.testAccountText}>Senha: {samplePatient.password}</Text>
                        </View>
                    ) : null}
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
    testAccountsCard: {
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e584f',
        backgroundColor: '#072923',
        padding: 12,
        gap: 10,
    },
    testAccountsTitle: {
        color: '#eef4ff',
        fontSize: 14,
        fontWeight: '700',
    },
    testAccountItem: {
        gap: 2,
    },
    testAccountType: {
        color: '#01937C',
        fontSize: 12,
        fontWeight: '800',
    },
    testAccountText: {
        color: '#88b6ac',
        fontSize: 13,
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
