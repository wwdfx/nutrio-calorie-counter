import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/constants/theme';
import { GeminiVisionModel } from '@/services/gemini';
import {
  AppLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  TranslationStrings,
} from '@/constants/i18n';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  servingGrams: number;
  unit: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  cholesterolMg?: number;
  sodiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  potassiumMg?: number;
  isFavorite?: boolean;
  isPersonal?: boolean;
}

export interface LoggedFoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  food: FoodItem;
  servings: number;
  createdAt: string;
}

export interface LoggedActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  emoji: string;
  caloriesBurned: number;
  durationMinutes: number;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  birthYear: number;
  heightCm: number;
  startingWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  mainGoal: 'Lose Weight' | 'Gain Muscle' | 'Maintain Weight' | 'Boost Energy' | 'Improve Nutrition' | 'Gain Weight';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Super Active';
  dietType: 'Balanced Diet' | 'Balanced' | 'High Protein' | 'Low Carb' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Mediterranean';
  breakfastTime: string;
  dinnerTime: string;
  calorieGoal: number;
  carbsGoalGrams: number;
  proteinGoalGrams: number;
  fatGoalGrams: number;
  waterGoalMl: number;
  stepGoal: number;
  cupSizeMl: number;
  onboardingCompleted: boolean;
}

interface RegisteredAccount {
  email: string;
  password: string;
  profile: UserProfile;
}

interface NutrioContextValue {
  isHydrated: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: TranslationStrings;
  user: UserProfile | null;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => Promise<void>;
  geminiModel: GeminiVisionModel;
  setGeminiModel: (model: GeminiVisionModel) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfileAndCalculatePlan: (partial: Partial<UserProfile>) => Promise<UserProfile>;
  catalogFoods: FoodItem[];
  loggedFoods: LoggedFoodEntry[];
  loggedActivities: LoggedActivityEntry[];
  waterByDate: Record<string, number>;
  stepsByDate: Record<string, number>;
  weightHistory: WeightEntry[];
  addFoodIntake: (mealType: MealType, food: FoodItem, servings?: number, date?: string) => Promise<void>;
  addMultipleFoodIntakes: (mealType: MealType, foods: FoodItem[], date?: string) => Promise<void>;
  updateFoodIntake: (entryId: string, servings: number, customGrams?: number) => Promise<void>;
  removeFoodIntake: (entryId: string) => Promise<void>;
  createCustomFood: (food: Omit<FoodItem, 'id'>) => Promise<FoodItem>;
  updateCustomFood: (foodId: string, updates: Partial<Omit<FoodItem, 'id'>>) => Promise<void>;
  deleteCustomFood: (foodId: string) => Promise<void>;
  toggleFavoriteFood: (foodId: string) => Promise<void>;
  addActivityLog: (activity: Omit<LoggedActivityEntry, 'id' | 'date'>, date?: string) => Promise<void>;
  removeActivityLog: (id: string) => Promise<void>;
  updateWater: (deltaMl: number, date?: string) => Promise<void>;
  updateSteps: (steps: number, date?: string) => Promise<void>;
  addOrUpdateWeight: (weightKg: number, date?: string) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
}

const STORAGE_KEY = '@nutrio_state_v1';

export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateCaloriePlan(profile: UserProfile): {
  calorieGoal: number;
  carbsGoalGrams: number;
  proteinGoalGrams: number;
  fatGoalGrams: number;
} {
  const currentYear = new Date().getFullYear();
  const age = Math.max(16, Math.min(90, currentYear - (profile.birthYear || 1996)));
  const weight = profile.currentWeightKg || 78.5;
  const height = profile.heightCm || 175;

  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += profile.gender === 'Female' ? -161 : 5;

  const multMap: Record<UserProfile['activityLevel'], number> = {
    Sedentary: 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Super Active': 1.9,
  };
  const tdee = bmr * (multMap[profile.activityLevel] || 1.375);

  let calorieGoal = Math.round(tdee);
  if (profile.mainGoal === 'Lose Weight') calorieGoal = Math.max(1300, Math.round(tdee - 450));
  if (profile.mainGoal === 'Gain Muscle' || profile.mainGoal === 'Gain Weight') {
    calorieGoal = Math.round(tdee + 350);
  }

  // Macro ratios by dietType
  let carbPct = 0.45;
  let proteinPct = 0.25;
  let fatPct = 0.30;

  if (profile.dietType === 'High Protein') {
    carbPct = 0.35;
    proteinPct = 0.35;
    fatPct = 0.30;
  } else if (profile.dietType === 'Low Carb') {
    carbPct = 0.25;
    proteinPct = 0.35;
    fatPct = 0.40;
  } else if (profile.dietType === 'Keto') {
    carbPct = 0.10;
    proteinPct = 0.25;
    fatPct = 0.65;
  }

  return {
    calorieGoal,
    carbsGoalGrams: Math.round((calorieGoal * carbPct) / 4),
    proteinGoalGrams: Math.round((calorieGoal * proteinPct) / 4),
    fatGoalGrams: Math.round((calorieGoal * fatPct) / 9),
  };
}

const DEFAULT_FOOD_CATALOG: FoodItem[] = [
  {
    id: 'food-sandwich',
    name: 'Club Turkey Sandwich',
    emoji: '🥪',
    servingGrams: 220,
    unit: 'gram (g)',
    calories: 480,
    carbs: 46,
    protein: 32,
    fat: 18,
    cholesterolMg: 55,
    sodiumMg: 640,
    calciumMg: 110,
    ironMg: 2.8,
    potassiumMg: 390,
    isFavorite: true,
  },
  {
    id: 'food-oatmeal',
    name: 'Oatmeal with Berries',
    emoji: '🥣',
    servingGrams: 180,
    unit: 'gram (g)',
    calories: 344,
    carbs: 58,
    protein: 12,
    fat: 7,
    cholesterolMg: 0,
    sodiumMg: 85,
    calciumMg: 95,
    ironMg: 2.4,
    potassiumMg: 280,
    isFavorite: true,
  },
  {
    id: 'food-rice-bowl',
    name: 'Teriyaki Chicken Rice Bowl',
    emoji: '🍚',
    servingGrams: 350,
    unit: 'gram (g)',
    calories: 620,
    carbs: 74,
    protein: 44,
    fat: 16,
    cholesterolMg: 95,
    sodiumMg: 720,
    calciumMg: 45,
    ironMg: 2.6,
    potassiumMg: 540,
    isFavorite: true,
  },
  {
    id: 'food-salad',
    name: 'Grilled Chicken Salad',
    emoji: '🥗',
    servingGrams: 300,
    unit: 'gram (g)',
    calories: 350,
    carbs: 16,
    protein: 38,
    fat: 15,
    cholesterolMg: 80,
    sodiumMg: 340,
    calciumMg: 68,
    ironMg: 2.2,
    potassiumMg: 620,
    isFavorite: true,
  },
  {
    id: 'food-cheeseburger',
    name: 'Cheeseburger',
    emoji: '🍔',
    servingGrams: 150,
    unit: 'gram (g)',
    calories: 303,
    carbs: 28.125,
    protein: 14.275,
    fat: 14.822,
    cholesterolMg: 53,
    sodiumMg: 663,
    calciumMg: 179,
    ironMg: 2.2,
    potassiumMg: 257,
  },
  {
    id: 'food-eggs',
    name: 'Scrambled Eggs',
    emoji: '🍳',
    servingGrams: 100,
    unit: 'gram (g)',
    calories: 160,
    carbs: 2,
    protein: 13,
    fat: 11,
    cholesterolMg: 370,
    sodiumMg: 145,
    calciumMg: 56,
    ironMg: 1.8,
    potassiumMg: 138,
  },
  {
    id: 'food-sushi',
    name: 'Sushi Roll',
    emoji: '🍣',
    servingGrams: 180,
    unit: 'gram (g)',
    calories: 250,
    carbs: 38,
    protein: 12,
    fat: 7,
    cholesterolMg: 22,
    sodiumMg: 310,
    calciumMg: 25,
    ironMg: 1.4,
    potassiumMg: 290,
  },
  {
    id: 'food-sushi-tuna',
    name: 'Sushi, Tuna (Maguro)',
    emoji: '🍣',
    servingGrams: 28,
    unit: 'gram (g)',
    calories: 50,
    carbs: 6,
    protein: 5,
    fat: 0.5,
  },
  {
    id: 'food-sushi-salmon',
    name: 'Sushi, Salmon (Sake)',
    emoji: '🍣',
    servingGrams: 30,
    unit: 'gram (g)',
    calories: 48,
    carbs: 5,
    protein: 4.5,
    fat: 1.2,
  },
  {
    id: 'food-sushi-yellowtail',
    name: 'Sushi, Yellowtail (Hamachi)',
    emoji: '🍣',
    servingGrams: 30,
    unit: 'gram (g)',
    calories: 65,
    carbs: 6,
    protein: 5,
    fat: 2.4,
  },
  {
    id: 'food-sushi-eel',
    name: 'Sushi, Eel (Unagi)',
    emoji: '🍣',
    servingGrams: 35,
    unit: 'gram (g)',
    calories: 100,
    carbs: 9,
    protein: 6,
    fat: 4.2,
  },
  {
    id: 'food-grilled-shrimp',
    name: 'Grilled Shrimp',
    emoji: '🍤',
    servingGrams: 100,
    unit: 'gram (g)',
    calories: 100,
    carbs: 1,
    protein: 22,
    fat: 1,
  },
  {
    id: 'food-shrimp-cocktail',
    name: 'Shrimp Cocktail',
    emoji: '🍤',
    servingGrams: 150,
    unit: 'gram (g)',
    calories: 120,
    carbs: 8,
    protein: 20,
    fat: 1,
  },
  {
    id: 'food-fried-shrimp',
    name: 'Fried Shrimp',
    emoji: '🍤',
    servingGrams: 150,
    unit: 'gram (g)',
    calories: 240,
    carbs: 12,
    protein: 21,
    fat: 12,
    cholesterolMg: 189,
    sodiumMg: 231,
    calciumMg: 54,
    ironMg: 1.4,
    potassiumMg: 182,
  },
  {
    id: 'food-shrimp-scampi',
    name: 'Shrimp Scampi',
    emoji: '🍤',
    servingGrams: 200,
    unit: 'gram (g)',
    calories: 250,
    carbs: 14,
    protein: 21,
    fat: 12,
  },
  {
    id: 'food-shrimp-alfredo',
    name: 'Shrimp Alfredo',
    emoji: '🍤',
    servingGrams: 250,
    unit: 'gram (g)',
    calories: 320,
    carbs: 28,
    protein: 22,
    fat: 13,
  },
  {
    id: 'food-mashed-potatoes',
    name: 'Mashed Potatoes',
    emoji: '🥔',
    servingGrams: 200,
    unit: 'gram (g)',
    calories: 240,
    carbs: 36,
    protein: 4,
    fat: 9,
  },
  {
    id: 'food-flatbread',
    name: 'Stuffed Flatbread',
    emoji: '🥙',
    servingGrams: 140,
    unit: 'gram (g)',
    calories: 215,
    carbs: 28,
    protein: 9,
    fat: 7,
  },
  {
    id: 'food-kitkat',
    name: 'Kit Kat Wafer Bar',
    emoji: '🍫',
    servingGrams: 42,
    unit: 'gram (g)',
    calories: 218,
    carbs: 14.7,
    protein: 10.5,
    fat: 16.8,
    cholesterolMg: 5,
    sodiumMg: 21,
    calciumMg: 40,
    ironMg: 1,
    potassiumMg: 88,
  },
  {
    id: 'food-hotdog',
    name: 'Hot Dog',
    emoji: '🌭',
    servingGrams: 57,
    unit: 'gram (g)',
    calories: 150,
    carbs: 2,
    protein: 5,
    fat: 13,
    isPersonal: true,
  },
  {
    id: 'food-orange-juice',
    name: 'Orange Juice',
    emoji: '🍊',
    servingGrams: 240,
    unit: 'ml',
    calories: 112,
    carbs: 26,
    protein: 2,
    fat: 0,
    isPersonal: true,
  },
  {
    id: 'food-avocado-toast',
    name: 'Avocado Toast',
    emoji: '🥑',
    servingGrams: 140,
    unit: 'gram (g)',
    calories: 250,
    carbs: 24,
    protein: 7,
    fat: 14,
    isPersonal: true,
  },
  {
    id: 'food-turkey-sandwich',
    name: 'Turkey Sandwich',
    emoji: '🥪',
    servingGrams: 200,
    unit: 'gram (g)',
    calories: 280,
    carbs: 30,
    protein: 22,
    fat: 8,
    isPersonal: true,
  },
  {
    id: 'food-fruit-salad',
    name: 'Fruit Salad',
    emoji: '🍓',
    servingGrams: 150,
    unit: 'gram (g)',
    calories: 120,
    carbs: 28,
    protein: 2,
    fat: 0.5,
    isPersonal: true,
  },
  {
    id: 'food-veggie-wrap',
    name: 'Veggie Wrap',
    emoji: '🌯',
    servingGrams: 250,
    unit: 'gram (g)',
    calories: 290,
    carbs: 38,
    protein: 10,
    fat: 11,
    isPersonal: true,
  },
  {
    id: 'food-cheesecake-slice',
    name: 'Cheesecake Slice',
    emoji: '🍰',
    servingGrams: 120,
    unit: 'gram (g)',
    calories: 320,
    carbs: 26,
    protein: 6,
    fat: 22,
    isPersonal: true,
  },
  {
    id: 'food-pancakes',
    name: 'Protein Pancakes',
    emoji: '🥞',
    servingGrams: 160,
    unit: 'gram (g)',
    calories: 190,
    carbs: 24,
    protein: 16,
    fat: 4,
    cholesterolMg: 35,
    sodiumMg: 290,
    calciumMg: 110,
    ironMg: 1.9,
    potassiumMg: 210,
  },
];

const DEFAULT_DEMO_PROFILE: UserProfile = {
  id: 'user-andrew',
  email: 'andrew.ainsley@yourdomain.com',
  name: 'Andrew Ainsley',
  gender: 'Male',
  birthYear: 1995,
  heightCm: 185,
  startingWeightKg: 80.0,
  currentWeightKg: 78.4,
  targetWeightKg: 75.0,
  mainGoal: 'Lose Weight',
  activityLevel: 'Moderately Active',
  dietType: 'Balanced',
  breakfastTime: '08:00 AM',
  dinnerTime: '07:30 PM',
  calorieGoal: 2560,
  carbsGoalGrams: 224,
  proteinGoalGrams: 128,
  fatGoalGrams: 128,
  waterGoalMl: 2500,
  stepGoal: 6000,
  cupSizeMl: 250,
  onboardingCompleted: true,
};

function buildInitialSeedData() {
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Seed 14 days of weight history for the Weight Calendar & Insights charts
  const weights: WeightEntry[] = [];
  const sampleWeights = [79.6, 79.4, 79.5, 79.2, 79.0, 79.1, 78.9, 78.8, 78.8, 78.5, 78.7, 78.5, 78.7, 78.5, 78.4];
  for (let i = sampleWeights.length - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    weights.push({
      id: `w-${i}`,
      date: formatDateKey(d),
      weightKg: sampleWeights[sampleWeights.length - 1 - i],
    });
  }

  const waterByDate: Record<string, number> = {};
  const stepsByDate: Record<string, number> = {};
  const sampleWater = [2250, 2000, 2750, 2000, 2250, 3000, 1750];
  const sampleSteps = [5300, 5024, 5740, 6520, 5310, 5690, 4420];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = formatDateKey(d);
    waterByDate[k] = sampleWater[6 - i];
    stepsByDate[k] = sampleSteps[6 - i];
  }

  const loggedFoods: LoggedFoodEntry[] = [
    {
      id: 'log-1',
      date: todayKey,
      mealType: 'Breakfast',
      food: DEFAULT_FOOD_CATALOG[0],
      servings: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log-2',
      date: todayKey,
      mealType: 'Breakfast',
      food: DEFAULT_FOOD_CATALOG[1],
      servings: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log-3',
      date: todayKey,
      mealType: 'Lunch',
      food: DEFAULT_FOOD_CATALOG[2],
      servings: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log-4',
      date: todayKey,
      mealType: 'Lunch',
      food: DEFAULT_FOOD_CATALOG[9],
      servings: 1,
      createdAt: new Date().toISOString(),
    },
  ];

  const loggedActivities: LoggedActivityEntry[] = [
    {
      id: 'act-1',
      date: todayKey,
      name: 'Basketball',
      emoji: '🏀',
      caloriesBurned: 165,
      durationMinutes: 30,
    },
  ];

  return {
    weights,
    waterByDate,
    stepsByDate,
    loggedFoods,
    loggedActivities,
  };
}

const NutrioContext = createContext<NutrioContextValue | undefined>(undefined);

function detectInitialLanguage(): AppLanguage {
  try {
    const navLang =
      typeof navigator !== 'undefined' && navigator.language
        ? navigator.language.slice(0, 2).toLowerCase()
        : 'en';
    const match = SUPPORTED_LANGUAGES.find((l) => l.code === navLang);
    return match ? match.code : 'en';
  } catch {
    return 'en';
  }
}

export function NutrioProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [language, setLanguageState] = useState<AppLanguage>(detectInitialLanguage);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<RegisteredAccount[]>([
    {
      email: DEFAULT_DEMO_PROFILE.email,
      password: 'password123',
      profile: DEFAULT_DEMO_PROFILE,
    },
  ]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey());
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
  );
  const [geminiModel, setGeminiModelState] = useState<GeminiVisionModel>(
    'gemini-3.5-flash-lite'
  );

  const seed = buildInitialSeedData();
  const [catalogFoods, setCatalogFoods] = useState<FoodItem[]>(DEFAULT_FOOD_CATALOG);
  const [deletedCatalogIds, setDeletedCatalogIds] = useState<string[]>([]);
  const [loggedFoods, setLoggedFoods] = useState<LoggedFoodEntry[]>(seed.loggedFoods);
  const [loggedActivities, setLoggedActivities] = useState<LoggedActivityEntry[]>(seed.loggedActivities);
  const [waterByDate, setWaterByDate] = useState<Record<string, number>>(seed.waterByDate);
  const [stepsByDate, setStepsByDate] = useState<Record<string, number>>(seed.stepsByDate);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(seed.weights);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.themeMode) setThemeModeState(parsed.themeMode);
          if (parsed.language && TRANSLATIONS[parsed.language as AppLanguage]) {
            setLanguageState(parsed.language as AppLanguage);
          }
          if (parsed.user !== undefined) setUser(parsed.user);
          if (parsed.accounts) setAccounts(parsed.accounts);
          if (parsed.geminiApiKey) setGeminiApiKeyState(parsed.geminiApiKey);
          if (parsed.geminiModel) setGeminiModelState(parsed.geminiModel);
          const deletedIds: string[] = Array.isArray(parsed.deletedCatalogIds)
            ? parsed.deletedCatalogIds
            : [];
          if (deletedIds.length > 0) setDeletedCatalogIds(deletedIds);
          if (parsed.catalogFoods) {
            const savedList = parsed.catalogFoods as FoodItem[];
            const mergedCatalog = [
              ...savedList,
              ...DEFAULT_FOOD_CATALOG.filter(
                (def) =>
                  !savedList.some((s) => s.id === def.id) &&
                  !deletedIds.includes(def.id)
              ),
            ];
            setCatalogFoods(mergedCatalog);
          }
          if (parsed.loggedFoods) setLoggedFoods(parsed.loggedFoods);
          if (parsed.loggedActivities) setLoggedActivities(parsed.loggedActivities);
          if (parsed.waterByDate) setWaterByDate(parsed.waterByDate);
          if (parsed.stepsByDate) setStepsByDate(parsed.stepsByDate);
          if (parsed.weightHistory) setWeightHistory(parsed.weightHistory);
        }
      } catch {
        // Ignore storage read error
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  const persist = async (next: Partial<{
    themeMode: ThemeMode;
    language: AppLanguage;
    user: UserProfile | null;
    accounts: RegisteredAccount[];
    geminiApiKey: string;
    geminiModel: GeminiVisionModel;
    catalogFoods: FoodItem[];
    deletedCatalogIds: string[];
    loggedFoods: LoggedFoodEntry[];
    loggedActivities: LoggedActivityEntry[];
    waterByDate: Record<string, number>;
    stepsByDate: Record<string, number>;
    weightHistory: WeightEntry[];
  }>) => {
    try {
      const payload = {
        themeMode: next.themeMode ?? themeMode,
        language: next.language ?? language,
        user: next.user !== undefined ? next.user : user,
        accounts: next.accounts ?? accounts,
        geminiApiKey: next.geminiApiKey ?? geminiApiKey,
        geminiModel: next.geminiModel ?? geminiModel,
        catalogFoods: next.catalogFoods ?? catalogFoods,
        deletedCatalogIds: next.deletedCatalogIds ?? deletedCatalogIds,
        loggedFoods: next.loggedFoods ?? loggedFoods,
        loggedActivities: next.loggedActivities ?? loggedActivities,
        waterByDate: next.waterByDate ?? waterByDate,
        stepsByDate: next.stepsByDate ?? stepsByDate,
        weightHistory: next.weightHistory ?? weightHistory,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore write error
    }
  };

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeModeState(next);
    persist({ themeMode: next });
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    persist({ themeMode: mode });
  };

  const setLanguage = async (lang: AppLanguage) => {
    setLanguageState(lang);
    await persist({ language: lang });
  };

  const setGeminiApiKey = async (key: string) => {
    setGeminiApiKeyState(key);
    await persist({ geminiApiKey: key });
  };

  const setGeminiModel = async (model: GeminiVisionModel) => {
    setGeminiModelState(model);
    await persist({ geminiModel: model });
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { ok: false, error: 'Please enter both email and password.' };
    }
    const found = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (found) {
      setUser(found.profile);
      await persist({ user: found.profile });
      return { ok: true };
    }
    // Also allow instant login with any valid email for seamless demo testing
    const newProfile: UserProfile = {
      ...DEFAULT_DEMO_PROFILE,
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      onboardingCompleted: true,
    };
    const nextAccounts = [...accounts, { email: cleanEmail, password, profile: newProfile }];
    setAccounts(nextAccounts);
    setUser(newProfile);
    await persist({ user: newProfile, accounts: nextAccounts });
    return { ok: true };
  };

  const signUp = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 4) {
      return { ok: false, error: 'Password must be at least 4 characters.' };
    }

    const newProfile: UserProfile = {
      ...DEFAULT_DEMO_PROFILE,
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      onboardingCompleted: false,
    };

    const filtered = accounts.filter((a) => a.email.toLowerCase() !== cleanEmail);
    const nextAccounts = [...filtered, { email: cleanEmail, password, profile: newProfile }];
    setAccounts(nextAccounts);
    setUser(newProfile);
    await persist({ user: newProfile, accounts: nextAccounts });
    return { ok: true };
  };

  const signOut = async () => {
    setUser(null);
    await persist({ user: null });
  };

  const updateProfileAndCalculatePlan = async (partial: Partial<UserProfile>) => {
    const base = user || DEFAULT_DEMO_PROFILE;
    const merged: UserProfile = { ...base, ...partial };
    const plan = calculateCaloriePlan(merged);
    const finalProfile: UserProfile = {
      ...merged,
      calorieGoal: partial.calorieGoal ?? plan.calorieGoal,
      carbsGoalGrams: partial.carbsGoalGrams ?? plan.carbsGoalGrams,
      proteinGoalGrams: partial.proteinGoalGrams ?? plan.proteinGoalGrams,
      fatGoalGrams: partial.fatGoalGrams ?? plan.fatGoalGrams,
    };
    setUser(finalProfile);

    // Sync weight history if currentWeightKg changed
    let nextWeights = weightHistory;
    if (partial.currentWeightKg) {
      const todayKey = formatDateKey();
      const existingIdx = weightHistory.findIndex((w) => w.date === todayKey);
      if (existingIdx >= 0) {
        nextWeights = weightHistory.map((w, idx) =>
          idx === existingIdx ? { ...w, weightKg: partial.currentWeightKg! } : w
        );
      } else {
        nextWeights = [
          ...weightHistory,
          { id: `w-${Date.now()}`, date: todayKey, weightKg: partial.currentWeightKg },
        ];
      }
      setWeightHistory(nextWeights);
    }

    const nextAccounts = accounts.map((a) =>
      a.email.toLowerCase() === finalProfile.email.toLowerCase()
        ? { ...a, profile: finalProfile }
        : a
    );
    setAccounts(nextAccounts);
    await persist({ user: finalProfile, accounts: nextAccounts, weightHistory: nextWeights });
    return finalProfile;
  };

  const addFoodIntake = async (
    mealType: MealType,
    food: FoodItem,
    servings = 1,
    date = selectedDate
  ) => {
    const newEntry: LoggedFoodEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date,
      mealType,
      food,
      servings,
      createdAt: new Date().toISOString(),
    };
    const next = [...loggedFoods, newEntry];
    setLoggedFoods(next);

    // Ensure food is also in catalog
    let nextCatalog = catalogFoods;
    if (!catalogFoods.some((f) => f.id === food.id)) {
      nextCatalog = [food, ...catalogFoods];
      setCatalogFoods(nextCatalog);
    }
    await persist({ loggedFoods: next, catalogFoods: nextCatalog });
  };

  const addMultipleFoodIntakes = async (
    mealType: MealType,
    foods: FoodItem[],
    date = selectedDate
  ) => {
    if (foods.length === 0) return;
    const now = Date.now();
    const newEntries: LoggedFoodEntry[] = foods.map((food, idx) => ({
      id: `log-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      date,
      mealType,
      food,
      servings: 1,
      createdAt: new Date(now + idx).toISOString(),
    }));
    const next = [...loggedFoods, ...newEntries];
    setLoggedFoods(next);

    const missingFoods = foods.filter(
      (f) => !catalogFoods.some((c) => c.id === f.id)
    );
    const nextCatalog =
      missingFoods.length > 0 ? [...missingFoods, ...catalogFoods] : catalogFoods;
    if (missingFoods.length > 0) setCatalogFoods(nextCatalog);

    await persist({ loggedFoods: next, catalogFoods: nextCatalog });
  };

  const updateFoodIntake = async (
    entryId: string,
    servings: number,
    customGrams?: number
  ) => {
    const next = loggedFoods.map((e) => {
      if (e.id !== entryId) return e;
      const ratio =
        customGrams && e.food.servingGrams > 0
          ? customGrams / e.food.servingGrams
          : servings;
      return { ...e, servings: Math.max(0.25, Math.round(ratio * 100) / 100) };
    });
    setLoggedFoods(next);
    await persist({ loggedFoods: next });
  };

  const removeFoodIntake = async (entryId: string) => {
    const next = loggedFoods.filter((e) => e.id !== entryId);
    setLoggedFoods(next);
    await persist({ loggedFoods: next });
  };

  const createCustomFood = async (foodData: Omit<FoodItem, 'id'>) => {
    const newFood: FoodItem = {
      ...foodData,
      id: `food-${Date.now()}`,
      isPersonal: true,
    };
    const nextCatalog = [newFood, ...catalogFoods];
    setCatalogFoods(nextCatalog);
    await persist({ catalogFoods: nextCatalog });
    return newFood;
  };

  const updateCustomFood = async (
    foodId: string,
    updates: Partial<Omit<FoodItem, 'id'>>
  ) => {
    const nextCatalog = catalogFoods.map((f) =>
      f.id === foodId ? { ...f, ...updates } : f
    );
    const nextLogged = loggedFoods.map((e) =>
      e.food.id === foodId ? { ...e, food: { ...e.food, ...updates } } : e
    );
    setCatalogFoods(nextCatalog);
    setLoggedFoods(nextLogged);
    await persist({ catalogFoods: nextCatalog, loggedFoods: nextLogged });
  };

  const deleteCustomFood = async (foodId: string) => {
    const nextCatalog = catalogFoods.filter((f) => f.id !== foodId);
    const nextDeleted = deletedCatalogIds.includes(foodId)
      ? deletedCatalogIds
      : [...deletedCatalogIds, foodId];
    setCatalogFoods(nextCatalog);
    setDeletedCatalogIds(nextDeleted);
    await persist({ catalogFoods: nextCatalog, deletedCatalogIds: nextDeleted });
  };

  const toggleFavoriteFood = async (foodId: string) => {
    const nextCatalog = catalogFoods.map((f) =>
      f.id === foodId ? { ...f, isFavorite: !f.isFavorite } : f
    );
    setCatalogFoods(nextCatalog);
    await persist({ catalogFoods: nextCatalog });
  };

  const addActivityLog = async (
    activity: Omit<LoggedActivityEntry, 'id' | 'date'>,
    date = selectedDate
  ) => {
    const entry: LoggedActivityEntry = {
      ...activity,
      id: `act-${Date.now()}`,
      date,
    };
    const next = [...loggedActivities, entry];
    setLoggedActivities(next);
    await persist({ loggedActivities: next });
  };

  const removeActivityLog = async (id: string) => {
    const next = loggedActivities.filter((a) => a.id !== id);
    setLoggedActivities(next);
    await persist({ loggedActivities: next });
  };

  const updateWater = async (deltaMl: number, date = selectedDate) => {
    const current = waterByDate[date] || 0;
    const updated = Math.max(0, current + deltaMl);
    const next = { ...waterByDate, [date]: updated };
    setWaterByDate(next);
    await persist({ waterByDate: next });
  };

  const updateSteps = async (steps: number, date = selectedDate) => {
    const next = { ...stepsByDate, [date]: Math.max(0, steps) };
    setStepsByDate(next);
    await persist({ stepsByDate: next });
  };

  const addOrUpdateWeight = async (weightKg: number, date = selectedDate) => {
    const cleanWeight = Math.round(weightKg * 10) / 10;
    const existingIdx = weightHistory.findIndex((w) => w.date === date);
    let next: WeightEntry[];
    if (existingIdx >= 0) {
      next = weightHistory.map((w, idx) =>
        idx === existingIdx ? { ...w, weightKg: cleanWeight } : w
      );
    } else {
      next = [
        ...weightHistory,
        { id: `w-${Date.now()}`, date, weightKg: cleanWeight },
      ].sort((a, b) => a.date.localeCompare(b.date));
    }
    setWeightHistory(next);

    let nextUser = user;
    if (user && date >= formatDateKey()) {
      nextUser = { ...user, currentWeightKg: cleanWeight };
      setUser(nextUser);
    }
    await persist({ weightHistory: next, user: nextUser });
  };

  const deleteWeightEntry = async (id: string) => {
    const next = weightHistory.filter((w) => w.id !== id);
    setWeightHistory(next);
    await persist({ weightHistory: next });
  };

  return (
    <NutrioContext.Provider
      value={{
        isHydrated,
        themeMode,
        toggleTheme,
        setThemeMode,
        language,
        setLanguage,
        t: TRANSLATIONS[language] || TRANSLATIONS.en,
        user,
        selectedDate,
        setSelectedDate,
        geminiApiKey,
        setGeminiApiKey,
        geminiModel,
        setGeminiModel,
        signIn,
        signUp,
        signOut,
        updateProfileAndCalculatePlan,
        catalogFoods,
        loggedFoods,
        loggedActivities,
        waterByDate,
        stepsByDate,
        weightHistory,
        addFoodIntake,
        addMultipleFoodIntakes,
        updateFoodIntake,
        removeFoodIntake,
        createCustomFood,
        updateCustomFood,
        deleteCustomFood,
        toggleFavoriteFood,
        addActivityLog,
        removeActivityLog,
        updateWater,
        updateSteps,
        addOrUpdateWeight,
        deleteWeightEntry,
      }}
    >
      {children}
    </NutrioContext.Provider>
  );
}

export function useNutrio() {
  const ctx = useContext(NutrioContext);
  if (!ctx) throw new Error('useNutrio must be used inside NutrioProvider');
  return ctx;
}
