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

export default function SignUpScreen() {
  const { themeMode, signUp, t } = useNutrio();
  const theme = getThemeColors(themeMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isFormFilled =
    email.trim().length > 0 && password.length >= 4 && agreeTerms;

  const handleSignUp = async () => {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Nutrio Terms & Conditions.');
      return;
    }
    const res = await signUp(email, password);
    if (!res.ok) {
      setErrorMsg(res.error || 'Could not create account.');
      return;
    }
    router.replace('/onboarding');
  };

  const handleSocialQuickSignUp = async () => {
    await signUp('andrew.ainsley@yourdomain.com', 'password123');
    router.replace('/onboarding');
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
          {t.joinNutrio}
        </Text>
        <Text style={[styles.subheading, { color: theme.textSecondary }]}>
          {t.joinSubtitle}
        </Text>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Email Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            {t.emailLabel}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.card, borderColor: theme.card },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={email ? theme.text : theme.textMuted}
            />
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

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            {t.passwordLabel}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.card, borderColor: theme.card },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={password ? theme.text : theme.textMuted}
            />
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
                color={password ? theme.text : theme.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms Checkbox matching Stage 2 (lime outline when unchecked, solid lime + dark check when checked) */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreeTerms((v) => !v)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.checkbox,
              agreeTerms
                ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                : { backgroundColor: 'transparent', borderColor: COLORS.primary },
            ]}
          >
            {agreeTerms && (
              <Ionicons name="checkmark" size={16} color="#181A20" />
            )}
          </View>
          <Text style={[styles.termsText, { color: theme.text }]}>
            {t.agreeTermsPrefix}{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
              {t.termsConditions}
            </Text>
            .
          </Text>
        </TouchableOpacity>

        {/* Switch to Sign In */}
        <View style={styles.switchAuthRow}>
          <Text style={[styles.switchText, { color: theme.text }]}>
            {t.alreadyHaveAccount}{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.switchLink}>{t.signIn}</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: theme.divider }]} />
          <Text style={[styles.orText, { color: theme.textSecondary }]}>
            {t.orContinueWith}
          </Text>
          <View style={[styles.line, { backgroundColor: theme.divider }]} />
        </View>

        {/* 4 Brand Social Pill Buttons matching Stage 2 */}
        <View style={styles.socialIconsRow}>
          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSocialQuickSignUp}
          >
            <GoogleGIcon size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSocialQuickSignUp}
          >
            <AppleIcon size={24} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSocialQuickSignUp}
          >
            <FacebookIcon size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.socialPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
            onPress={handleSocialQuickSignUp}
          >
            <XLogoIcon size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bar with solid / muted lime Sign up CTA */}
      <View
        style={[
          styles.bottomBar,
          { borderTopColor: theme.divider, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.signUpBtn,
            { backgroundColor: isFormFilled ? COLORS.primary : '#84A842' },
          ]}
          onPress={handleSignUp}
          activeOpacity={0.9}
        >
          <Text style={styles.signUpBtnText}>{t.signUp}</Text>
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
    borderWidth: 1,
    paddingHorizontal: 18,
    height: 60,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 28,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
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
  signUpBtn: {
    height: 58,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181A20',
  },
});
