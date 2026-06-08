import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID) { Alert.alert('Error', 'Google OAuth not configured'); return; }
    setLoading(true);
    try {
      // Open Google login in browser, redirect to our web callback which handles the token
      const callbackUrl = 'https://reportafrica-web.vercel.app/google-callback';
      const scope = 'openid email profile';
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=token+id_token&scope=${encodeURIComponent(scope)}&nonce=${Date.now()}`;

      const result = await WebBrowser.openAuthSessionAsync(url, 'reportafrica://');

      if (result.type === 'success' && result.url) {
        // Extract id_token from the URL hash
        const hash = result.url.split('#')[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const idToken = params.get('id_token');
          if (idToken) {
            const res = await authAPI.googleLogin({ idToken });
            setAuth(res.data.user, res.data.token, res.data.refreshToken);
            return;
          }
        }
      }
      setLoading(false);
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err.message || 'Something went wrong.');
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
      setAuth(res.data.user, res.data.token, res.data.refreshToken);
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter your email address',
      async (inputEmail) => {
        if (!inputEmail) return;
        try {
          await authAPI.forgotPassword(inputEmail);
          Alert.alert('Check your email', 'If an account with that email exists, we\'ve sent a reset link.');
        } catch {
          Alert.alert('Check your email', 'If an account with that email exists, we\'ve sent a reset link.');
        }
      },
      'plain-text',
      email,
      'email-address'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />

        <View style={styles.passwordRow}>
          <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
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
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.light.border, borderRadius: theme.borderRadius.sm, padding: 14, fontSize: theme.fontSize.md },
  eyeBtn: { position: 'absolute', right: 14, padding: 4 },
  eyeText: { fontSize: 18 },
  forgotText: { color: theme.colors.primary, fontSize: theme.fontSize.sm, textAlign: 'right' },
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
