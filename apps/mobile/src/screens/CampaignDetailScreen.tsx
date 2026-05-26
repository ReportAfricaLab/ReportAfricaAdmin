import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Linking } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { donationsAPI } from '../services/api';
import { theme } from '../theme';

export default function CampaignDetailScreen({ route }: any) {
  const { id } = route.params;
  const { token, isAuthenticated } = useAppStore();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    donationsAPI.getById(id).then((res) => setCampaign(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleDonate = async () => {
    if (!amount || !email) { Alert.alert('Error', 'Please fill amount and email'); return; }
    setDonating(true);
    try {
      const res = await donationsAPI.donate(id, { amount: Number(amount), email, isAnonymous: false });
      if (res.data.paymentUrl) {
        Linking.openURL(res.data.paymentUrl);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>;
  if (!campaign) return <View style={styles.center}><Text style={styles.loadingText}>Campaign not found</Text></View>;

  const pct = Math.min((Number(campaign.raisedAmount) / Number(campaign.targetAmount)) * 100, 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {campaign.isEmergency && (
        <View style={styles.emergencyBadge}><Text style={styles.emergencyText}>🚨 EMERGENCY</Text></View>
      )}

      <Text style={styles.title}>{campaign.title}</Text>
      <Text style={styles.description}>{campaign.description}</Text>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.raised}>{campaign.currency} {Number(campaign.raisedAmount).toLocaleString()}</Text>
          <Text style={styles.target}>of {campaign.currency} {Number(campaign.targetAmount).toLocaleString()}</Text>
        </View>
        <Text style={styles.donors}>{campaign.donorCount} donors · {Math.round(pct)}% funded</Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoRow}>Category: <Text style={styles.infoValue}>{campaign.category.replace('_', ' ')}</Text></Text>
        <Text style={styles.infoRow}>By: <Text style={styles.infoValue}>{campaign.author?.displayName || 'Anonymous'}</Text></Text>
        {campaign.beneficiaryName && <Text style={styles.infoRow}>For: <Text style={styles.infoValue}>{campaign.beneficiaryName}</Text></Text>}
      </View>

      {/* Donate Button */}
      {campaign.isActive && (
        <TouchableOpacity style={styles.donateBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.donateBtnText}>💛 Donate Now</Text>
        </TouchableOpacity>
      )}

      {/* Donate Form */}
      {showForm && isAuthenticated && (
        <View style={styles.form}>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder={`Amount (${campaign.currency})`} keyboardType="numeric" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email (for receipt)" keyboardType="email-address" autoCapitalize="none" />
          <TouchableOpacity style={[styles.submitBtn, donating && styles.submitBtnDisabled]} onPress={handleDonate} disabled={donating}>
            <Text style={styles.submitBtnText}>{donating ? 'Processing...' : `Donate ${amount ? `${campaign.currency} ${Number(amount).toLocaleString()}` : ''}`}</Text>
          </TouchableOpacity>
        </View>
      )}

      {showForm && !isAuthenticated && (
        <Text style={styles.loginHint}>Please sign in to donate</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.light.background },
  content: { padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.colors.light.textSecondary },
  emergencyBadge: { backgroundColor: theme.colors.emergency, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 12 },
  emergencyText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.light.text, marginBottom: 10 },
  description: { fontSize: theme.fontSize.md, color: theme.colors.light.textSecondary, lineHeight: 24, marginBottom: 20 },
  progressSection: { marginBottom: 20 },
  progressBg: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.colors.humanitarian, borderRadius: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  raised: { fontSize: 16, fontWeight: '700', color: theme.colors.humanitarian },
  target: { fontSize: 13, color: theme.colors.light.textSecondary },
  donors: { fontSize: 12, color: theme.colors.light.textSecondary, marginTop: 4 },
  infoBox: { backgroundColor: '#fff', padding: 14, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.light.border, marginBottom: 20, gap: 6 },
  infoRow: { fontSize: 13, color: theme.colors.light.textSecondary },
  infoValue: { fontWeight: '600', color: theme.colors.light.text, textTransform: 'capitalize' },
  donateBtn: { backgroundColor: theme.colors.humanitarian, paddingVertical: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', marginBottom: 16 },
  donateBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.light.border, gap: 12 },
  input: { borderWidth: 1, borderColor: theme.colors.light.border, borderRadius: theme.borderRadius.sm, padding: 12, fontSize: theme.fontSize.md },
  submitBtn: { backgroundColor: theme.colors.humanitarian, paddingVertical: 14, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: '700' },
  loginHint: { textAlign: 'center', color: theme.colors.light.textSecondary, marginTop: 12 },
});
