import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { SUPPORTED_LANGUAGES, AppLanguage } from '@/constants/i18n';
import { useNutrio } from '@/context/NutrioContext';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguagePickerModal({ visible, onClose }: LanguagePickerModalProps) {
  const { themeMode, language, setLanguage, t } = useNutrio();
  const theme = getThemeColors(themeMode);

  const handleSelect = async (code: AppLanguage) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{t.chooseLanguage}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {SUPPORTED_LANGUAGES.map((item) => {
              const selected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.row,
                    {
                      backgroundColor: selected ? COLORS.primaryLight : theme.inputBg,
                      borderColor: selected ? COLORS.primary : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(item.code)}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.nativeName,
                        { color: selected ? '#212121' : theme.text },
                      ]}
                    >
                      {item.nativeName}
                    </Text>
                    <Text
                      style={[
                        styles.englishName,
                        { color: selected ? '#555555' : theme.textSecondary },
                      ]}
                    >
                      {item.englishName}
                    </Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryDark} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    gap: 10,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  flag: {
    fontSize: 26,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '800',
  },
  englishName: {
    fontSize: 12,
    marginTop: 1,
  },
});
