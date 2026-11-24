import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS, getThemeColors } from '@/constants/theme';
import { getLanguageMeta } from '@/constants/i18n';
import { useNutrio } from '@/context/NutrioContext';
import { NutrioLogo } from '@/components/NutrioLogo';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';

function GoogleGIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Svg>
  );
}

function XLogoIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill={color}
      />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const { themeMode, signIn, language, t } = useNutrio();
  const theme = getThemeColors(themeMode);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const currentLang = getLanguageMeta(language);

  const handleSocialDemoSignIn = async () => {
    await signIn('andrew.ainsley@yourdomain.com', 'password123');
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      {/* Top Language Pill */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.walkthroughReplayBtn}
          onPress={() => router.replace('/(auth)/walkthrough')}
        >
          <Ionicons name="sparkles-outline" size={15} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.langPill,
            { backgroundColor: theme.card, borderColor: theme.inputBorder },
          ]}
          onPress={() => setLangModalOpen(true)}
        >
          <Text style={{ fontSize: 15 }}>{currentLang.flag}</Text>
          <Text style={[styles.langPillText, { color: theme.text }]}>
            {currentLang.nativeName}
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Center Mascot Logo + Heading matching Stage 1 Screen 5 */}
      <View style={styles.heroSection}>
        <NutrioLogo size={76} color={COLORS.primary} eyeColor={theme.background} />
        <Text style={[styles.title, { color: theme.text }]}>{t.welcomeTitle}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t.welcomeSubtitle}
        </Text>
      </View>

      {/* 4 Social Buttons with left-aligned brand icon + centered label */}
      <View style={styles.socialButtons}>
        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: theme.card, borderColor: theme.inputBorder },
          ]}
          onPress={handleSocialDemoSignIn}
          activeOpacity={0.85}
        >
          <View style={styles.socialIconSlot}>
            <GoogleGIcon />
          </View>
          <Text style={[styles.socialBtnText, { color: theme.text }]}>
            {t.continueGoogle}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: theme.card, borderColor: theme.inputBorder },
          ]}
          onPress={handleSocialDemoSignIn}
          activeOpacity={0.85}
        >
          <View style={styles.socialIconSlot}>
            <Ionicons name="logo-apple" size={24} color={theme.text} />
          </View>
          <Text style={[styles.socialBtnText, { color: theme.text }]}>
            {t.continueApple}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: theme.card, borderColor: theme.inputBorder },
          ]}
          onPress={handleSocialDemoSignIn}
          activeOpacity={0.85}
        >
          <View style={styles.socialIconSlot}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </View>
          <Text style={[styles.socialBtnText, { color: theme.text }]}>
            {t.continueFacebook}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: theme.card, borderColor: theme.inputBorder },
          ]}
          onPress={handleSocialDemoSignIn}
          activeOpacity={0.85}
        >
          <View style={styles.socialIconSlot}>
            <XLogoIcon color={theme.text} />
          </View>
          <Text style={[styles.socialBtnText, { color: theme.text }]}>
            {t.continueX}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign up & Sign in Pill Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.primaryPillBtn}
          onPress={() => router.push('/(auth)/sign-up')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryPillText}>{t.signUp}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryPillBtn, { backgroundColor: theme.secondaryBtnBg }]}
          onPress={() => router.push('/(auth)/sign-in')}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.secondaryPillText,
              { color: themeMode === 'dark' ? '#FFFFFF' : '#212121' },
            ]}
          >
            {t.signIn}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.footerNote, { color: theme.textMuted }]}>
        {t.privacyTerms}
      </Text>

      <LanguagePickerModal
        visible={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walkthroughReplayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 1000,
    borderWidth: 1,
    gap: 6,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.78,
  },
  socialButtons: {
    gap: 16,
    marginBottom: 28,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    paddingHorizontal: 20,
    borderRadius: 1000,
    borderWidth: 1,
    position: 'relative',
  },
  socialIconSlot: {
    position: 'absolute',
    left: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomActions: {
    gap: 16,
  },
  primaryPillBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPillText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181A20',
  },
  secondaryPillBtn: {
    height: 58,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPillText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 24,
  },
});
