import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';
import {
  GoogleGIcon,
  AppleIcon,
  FacebookIcon,
  XLogoIcon,
} from '@/components/SocialBrandIcons';

export default function SignInScreen() {
  const { themeMode, signIn, t } = useNutrio();
  const theme = getThemeColors(themeMode);

  const [email, setEmail] = useState('andrew.ainsley@yourdomain.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async () => {
    setErrorMsg('');
    const res = await signIn(email, password);
    if (!res.ok) {
      setErrorMsg(res.error || 'Invalid credentials');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')
          }
        >
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.heading, { color: theme.text }]}>
          {t.welcomeBack}
        </Text>
        <Text style={[styles.subheading, { color: theme.textSecondary }]}>
          {t.welcomeBackSub}
        </Text>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>{t.emailLabel}</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
            <Ionicons name="mail-outline" size={20} color={theme.text} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder={t.emailLabel}
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            {t.passwordLabel}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder={t.passwordLabel}
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rememberRow}>
          <TouchableOpacity
            style={styles.rememberLeft}
            onPress={() => setRememberMe((v) => !v)}
          >
            <View
              style={[
                styles.checkbox,
                rememberMe
                  ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                  : { backgroundColor: 'transparent', borderColor: COLORS.primary },
              ]}
            >
              {rememberMe && <Ionicons name="checkmark" size={16} color="#181A20" />}
            </View>
            <Text style={[styles.rememberText, { color: theme.text }]}>
              {t.rememberMe}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotLink}>{t.forgotPassword}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchAuthRow}>
          <Text style={[styles.switchText, { color: theme.text }]}>
            {t.dontHaveAccount}{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.switchLink}>{t.signUp}</Text>
          </TouchableOpacity>
        </View>

        {/* Divider + 4 Social Brand Pills matching 22_Dark_sign in */}
        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: theme.divider }]} />
          <Text style={[styles.orText, { color: theme.textSecondary }]}>
            {t.orContinueWith}
          </Text>
          <View style={[styles.line, { backgroundColor: theme.divider }]} />
        </View>

        <View style={styles.socialIconsRow}>
          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSignIn}
          >
            <GoogleGIcon size={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSignIn}
          >
            <AppleIcon size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSignIn}
          >
            <FacebookIcon size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSignIn}
          >
            <XLogoIcon size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { borderTopColor: theme.divider, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
          <Text style={styles.signInBtnText}>{t.signIn}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    opacity: 0.8,
  },
  errorBanner: {
    backgroundColor: 'rgba(245, 67, 54, 0.16)',
    borderColor: '#F54336',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  errorText: {
    color: '#FF7066',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 20,
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
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 28,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: 15,
    fontWeight: '600',
  },
  forgotLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  switchText: {
    fontSize: 15,
  },
  switchLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 26,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 14,
    opacity: 0.78,
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  socialPill: {
    flex: 1,
    height: 56,
    borderRadius: 1000,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181A20',
  },
});
