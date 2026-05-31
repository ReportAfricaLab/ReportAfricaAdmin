import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authAPI } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { getCurrentLocation } from '../services/location';
import { theme } from '../theme';
import { COUNTRY_CONFIG } from '../constants';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function RegisterScreen({ navigation }: any) {
  const { setAuth } = useAppStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('NG');
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      handleGoogleRegister(idToken);
    }
  }, [response]);

  const handleGoogleRegister = async (idToken: string) => {
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

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      if (loc?.country) {
        setSelectedCountry(loc.country);
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (!email || !username || !displayName || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ email, username, displayName, password, country: selectedCountry, latitude, longitude });
      setAuth(res.data.user, res.data.token);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.subtitle}>Create your account</Text>

      <Text style={styles.label}>Country</Text>
      <View style={styles.countryGrid}>
        {Object.entries(COUNTRY_CONFIG).map(([code, config]) => (
          <TouchableOpacity
            key={code}
            style={[styles.countryChip, selectedCountry === code && styles.countryChipActive]}
            onPress={() => setSelectedCountry(code)}
          >
            <Text style={[styles.countryChipText, selectedCountry === code && styles.countryChipTextActive]}>{config.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Full Name" />
      <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Username" autoCapitalize="none" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password (min 8 characters)" secureTextEntry />

      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleBtn} onPress={() => promptAsync()} disabled={!request || loading}>
        <Text style={styles.googleBtnText}>G  Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
        <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background },
  content: { padding: 24, paddingTop: 80, alignItems: 'center' },
  logo: { width: 220, height: 60, marginBottom: 8 },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.light.textSecondary, textAlign: 'center', marginBottom: 32 },
  label: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.light.text, marginBottom: 8 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  countryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.light.border },
  countryChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  countryChipText: { fontSize: theme.fontSize.xs, color: theme.colors.light.textSecondary },
  countryChipTextActive: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.light.border, borderRadius: theme.borderRadius.sm, padding: 14, fontSize: theme.fontSize.md, marginBottom: 12, width: '100%' },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.borderRadius.sm, alignItems: 'center', marginTop: 12, width: '100%' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 24, fontSize: theme.fontSize.sm, color: theme.colors.light.textSecondary, marginBottom: 40 },
  linkBold: { color: theme.colors.primary, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.light.border },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: theme.colors.light.textSecondary },
  googleBtn: { paddingVertical: 14, borderRadius: theme.borderRadius.sm, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.light.border, width: '100%' },
  googleBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.light.text },
});
