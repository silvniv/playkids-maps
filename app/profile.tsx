import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../src/services/supabase';
import { colors, spacing, typography, borderRadius } from '../src/constants/theme';

function normalizeErrorMessage(err: any): string {
  const msg = err?.message ?? String(err ?? 'Erro desconhecido');
  if (msg.toLowerCase().includes('email logins are disabled')) {
    return 'Login por email está desabilitado no Supabase. Abra Authentication, Sign In / Providers e habilite Email.';
  }
  if (msg.toLowerCase().includes('signup is disabled') || msg.toLowerCase().includes('signups not allowed')) {
    return 'Cadastros estão desabilitados no Supabase. Em Authentication, Sign In / Providers, habilite novos cadastros (Allow new users to sign up).';
  }
  if (msg.toLowerCase().includes('email not confirmed')) {
    return 'Seu email ainda não foi confirmado. Para teste rápido, desative "Confirm email" no provedor Email ou configure SMTP para enviar o email de confirmação.';
  }
  return msg;
}

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const userEmail = useMemo(() => session?.user?.email ?? null, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Preencha email e senha');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      Alert.alert('Login realizado');
    } catch (e: any) {
      Alert.alert('Falha no login', normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Preencha email e senha');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      if (!data.session) {
        Alert.alert(
          'Conta criada',
          'Se o projeto exigir confirmação de email, confirme no email antes de logar. Para teste rápido, desative "Confirm email" no provedor Email ou configure SMTP.'
        );
      } else {
        Alert.alert('Conta criada e logado');
      }
    } catch (e: any) {
      Alert.alert('Falha ao criar conta', normalizeErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      Alert.alert('Sessão encerrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.muted}>Entrar é necessário para favoritar, avaliar e relatar problemas.</Text>

      {userEmail ? (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Logado como</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.secondary]}
            onPress={handleSignOut}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.secondary }]}>
              {loading ? 'Saindo...' : 'Sair'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="voce@exemplo.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: spacing.sm }]}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleSignUp} disabled={loading}>
            <Text style={[styles.buttonText, { color: colors.secondary }]}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Se aparecer "Email not confirmed", desative a confirmação de email no provedor Email ou configure SMTP.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs },
  muted: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  value: { ...typography.body, color: colors.text, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.surface, fontWeight: '600', textAlign: 'center' },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
