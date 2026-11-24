import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { getLanguageMeta } from '@/constants/i18n';
import { useNutrio } from '@/context/NutrioContext';
import { CHEAP_VISION_MODELS } from '@/services/gemini';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { NutrioLogo } from '@/components/NutrioLogo';

export default function AccountScreen() {
  const {
    themeMode,
    toggleTheme,
    language,
    t,
    user,
    geminiApiKey,
    setGeminiApiKey,
    geminiModel,
    setGeminiModel,
    updateProfileAndCalculatePlan,
    signOut,
  } = useNutrio();
  const theme = getThemeColors(themeMode);
  const currentLang = getLanguageMeta(language);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [calInput, setCalInput] = useState(String(user?.calorieGoal || 2560));
  const [waterInput, setWaterInput] = useState(String(user?.waterGoalMl || 2500));
  const [stepInput, setStepInput] = useState(String(user?.stepGoal || 6000));
  const [weightGoalInput, setWeightGoalInput] = useState(
    String(user?.targetWeightKg || 75.0)
  );
  const [apiKeyDraft, setApiKeyDraft] = useState(geminiApiKey);

  const handleSaveGoals = async () => {
    const cals = Number(calInput) || 2560;
    await updateProfileAndCalculatePlan({
      calorieGoal: cals,
      carbsGoalGrams: Math.round((cals * 0.45) / 4),
      proteinGoalGrams: Math.round((cals * 0.25) / 4),
      fatGoalGrams: Math.round((cals * 0.30) / 9),
      waterGoalMl: Number(waterInput) || 2500,
      stepGoal: Number(stepInput) || 6000,
      targetWeightKg: Number(weightGoalInput) || 75.0,
    });
    setGoalModalOpen(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Header matching Screen 103_Dark_account & settings */}
      <View style={styles.header}>
        <NutrioLogo size={28} color={COLORS.primary} eyeColor={theme.background} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.accountTitle}</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Upgrade Plan Banner matching Screen 103 */}
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={() => setApiModalOpen(true)}
          activeOpacity={0.9}
        >
          <View style={styles.crownCircle}>
            <Text style={{ fontSize: 22 }}>👑</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>{t.proBannerTitle}</Text>
            <Text style={styles.upgradeSub}>
              {t.proBannerSub}
            </Text>
          </View>
        </TouchableOpacity>

        {/* User Profile Card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.card }]}
          onPress={() => router.push('/onboarding')}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {(user?.name || 'Andrew Ainsley')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {user?.name || 'Andrew Ainsley'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {user?.email || 'andrew.ainsley@yourdomain.com'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Goal Settings Group matching Screen 103 */}
        <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              setCalInput(String(user?.calorieGoal || 2560));
              setWaterInput(String(user?.waterGoalMl || 2500));
              setStepInput(String(user?.stepGoal || 6000));
              setWeightGoalInput(String(user?.targetWeightKg || 75.0));
              setGoalModalOpen(true);
            }}
          >
            <Ionicons name="flame-outline" size={22} color={theme.text} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.calorieCounter} ({user?.calorieGoal || 2560} {t.kcal})
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setGoalModalOpen(true)}
          >
            <Ionicons name="water-outline" size={22} color={theme.text} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.waterTracker} ({user?.waterGoalMl || 2500} mL)
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setGoalModalOpen(true)}
          >
            <Ionicons name="footsteps-outline" size={22} color={theme.text} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.stepCounter} ({user?.stepGoal || 6000} {t.steps})
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/weight')}
          >
            <Ionicons name="scale-outline" size={22} color={theme.text} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.weightTrackerAndCal} ({t.goal}: {user?.targetWeightKg || 75.0} kg)
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/onboarding')}
          >
            <Ionicons name="options-outline" size={22} color={theme.text} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.recalculatePlan}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* System, Language, Gemini AI & Appearance Settings Group */}
        <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setLangModalOpen(true)}
          >
            <Ionicons name="globe-outline" size={22} color={COLORS.primaryDark} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.appLanguage}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textSecondary }}>
              {currentLang.flag} {currentLang.nativeName}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              setApiKeyDraft(geminiApiKey);
              setApiModalOpen(true);
            }}
          >
            <Ionicons name="sparkles-outline" size={22} color={COLORS.primaryDark} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.geminiConfig} ({geminiModel})
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuRow}>
            <Ionicons name="eye-outline" size={22} color={theme.text} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {t.darkMode}
            </Text>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
            />
          </View>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/welcome');
            }}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
            <Text style={[styles.menuLabel, { color: COLORS.danger }]}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LanguagePickerModal
        visible={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />

      {/* Edit Goals Modal */}
      <Modal
        visible={goalModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setGoalModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Daily Nutrition &amp; Fitness Goals
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>
              Daily Calorie Goal (kcal)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={calInput}
              onChangeText={setCalInput}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>
              Target Weight Goal (kg)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={weightGoalInput}
              onChangeText={setWeightGoalInput}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>
              Daily Water Goal (mL)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={waterInput}
              onChangeText={setWaterInput}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.text }]}>
              Daily Step Goal
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={stepInput}
              onChangeText={setStepInput}
              keyboardType="numeric"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setGoalModalOpen(false)}
              >
                <Text style={{ fontWeight: '700', color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoals}>
                <Text style={{ fontWeight: '800', color: '#212121' }}>Save Goals</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gemini API Key Configuration Modal */}
      <Modal
        visible={apiModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setApiModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Low-Cost Gemini Vision Model &amp; Key
            </Text>
            <Text style={[styles.label, { color: theme.text }]}>
              Select Image Recognition Model
            </Text>
            <View style={{ gap: 8, marginBottom: 16 }}>
              {CHEAP_VISION_MODELS.map((m) => {
                const selected = geminiModel === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: selected ? COLORS.primary : theme.divider,
                      backgroundColor: selected ? COLORS.primaryLight : theme.inputBg,
                    }}
                    onPress={() => setGeminiModel(m.id)}
                  >
                    <Text style={{ fontWeight: '800', color: '#212121', fontSize: 14 }}>
                      {m.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#616161', marginTop: 2 }}>
                      {m.tierNote}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.label, { color: theme.text }]}>
              Gemini API Key
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={apiKeyDraft}
              onChangeText={setApiKeyDraft}
              placeholder="AIzaSy..."
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setApiModalOpen(false)}
              >
                <Text style={{ fontWeight: '700', color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={async () => {
                  await setGeminiApiKey(apiKeyDraft.trim());
                  setApiModalOpen(false);
                }}
              >
                <Text style={{ fontWeight: '800', color: '#212121' }}>Save Key</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  upgradeBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  crownCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 2,
  },
  upgradeSub: {
    fontSize: 12,
    color: '#212121',
    opacity: 0.85,
  },
  profileCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
  },
  menuCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 1000,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
