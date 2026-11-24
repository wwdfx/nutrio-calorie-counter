import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';

export default function ForgotPasswordScreen() {
  const { themeMode, t } = useNutrio();
  const theme = getThemeColors(themeMode);

  const [email, setEmail] = useState('andrew.ainsley@yourdomain.com');
  const [step, setStep] = useState<'email' | 'otp' | 'newpass' | 'done'>('email');
  const [otp, setOtp] = useState('4829');
  const [newPass, setNewPass] = useState('newpassword123');
  const [confirmPass, setConfirmPass] = useState('newpassword123');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() =>
          step === 'email'
            ? router.back()
            : setStep(step === 'otp' ? 'email' : step === 'newpass' ? 'otp' : 'email')
        }
      >
        <Ionicons name="arrow-back" size={26} color={theme.text} />
      </TouchableOpacity>

      {step === 'email' && (
        <View style={{ flex: 1 }}>
          <Text style={[styles.heading, { color: theme.text }]}>
            {t.forgotPassword} 🔑
          </Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Enter your registered email address and we&apos;ll send you a 4-digit OTP code to reset your password.
          </Text>
          <Text style={[styles.label, { color: theme.text }]}>{t.emailLabel}</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
            <Ionicons name="mail-outline" size={20} color={theme.text} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('otp')}>
            <Text style={styles.primaryBtnText}>{t.sendOtp}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'otp' && (
        <View style={{ flex: 1 }}>
          <Text style={[styles.heading, { color: theme.text }]}>{t.enterOtp}</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            We sent a 4-digit verification code to {email}. Enter the code below to continue.
          </Text>
          <View style={styles.otpBoxesRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: theme.card,
                    borderColor: otp.length === idx ? COLORS.primary : theme.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.otpDigit, { color: theme.text }]}>
                  {otp[idx] || ''}
                </Text>
              </View>
            ))}
          </View>
          <TextInput
            style={[styles.hiddenOtpInput, { color: theme.text, backgroundColor: theme.card }]}
            value={otp}
            onChangeText={(txt) => setOtp(txt.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="4829"
            placeholderTextColor={theme.textMuted}
          />
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('newpass')}>
            <Text style={styles.primaryBtnText}>{t.continueBtn}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'newpass' && (
        <View style={{ flex: 1 }}>
          <Text style={[styles.heading, { color: theme.text }]}>
            Secure Your Account 🔒
          </Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Create a strong new password for your Nutrio account.
          </Text>
          <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
            />
          </View>
          <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
            />
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('done')}>
            <Text style={styles.primaryBtnText}>{t.verifyReset}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'done' && (
        <View style={styles.doneCenter}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color="#181A20" />
          </View>
          <Text style={[styles.heading, { color: theme.text, textAlign: 'center' }]}>
            {t.allSet}
          </Text>
          <Text style={[styles.subheading, { color: theme.textSecondary, textAlign: 'center' }]}>
            Your password has been updated. You can now sign in with your new credentials.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { width: '100%' }]}
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text style={styles.primaryBtnText}>{t.backToSignIn}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    opacity: 0.8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 60,
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 20,
  },
  otpBox: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 28,
    fontWeight: '800',
  },
  hiddenOtpInput: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 8,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181A20',
  },
  doneCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
});
