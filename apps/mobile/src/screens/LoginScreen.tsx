import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authAPI } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginScreen({ navigation }: any) {
  const { setAuth } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      handleGoogleLogin(idToken);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await authAPI.googleLogin({ idToken });
      setAuth(res.data.user, res.data.token);
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      setAuth(res.data.user, res.data.token);
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleBtn} onPress={() => promptAsync()} disabled={!request || loading}>
        <Text style={styles.googleBtnText}>G  Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation?.navigate('Register')}>
        <Text style={styles.link}>Don&apos;t have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 40, alignItems: 'center' },
  logo: { width: 220, height: 60 },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.light.textSecondary, marginTop: 8 },
  form: { gap: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.light.border, borderRadius: theme.borderRadius.sm, padding: 14, fontSize: theme.fontSize.md },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.borderRadius.sm, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.light.border },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: theme.colors.light.textSecondary },
  googleBtn: { paddingVertical: 14, borderRadius: theme.borderRadius.sm, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.light.border },
  googleBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.light.text },
  link: { textAlign: 'center', marginTop: 24, fontSize: theme.fontSize.sm, color: theme.colors.light.textSecondary },
  linkBold: { color: theme.colors.primary, fontWeight: '600' },
});
