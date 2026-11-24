export type AppLanguage =
  | 'en'
  | 'ru'
  | 'uk'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'it'
  | 'zh'
  | 'ja';

export interface LanguageOption {
  code: AppLanguage;
  nativeName: string;
  englishName: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺', locale: 'ru-RU' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', flag: '🇺🇦', locale: 'uk-UA' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹', locale: 'it-IT' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵', locale: 'ja-JP' },
];

export interface TranslationStrings {
  // Tabs
  tabHome: string;
  tabTracker: string;
  tabInsights: string;
  tabArticles: string;
  tabAccount: string;

  // Auth / Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  continueGoogle: string;
  continueApple: string;
  continueFacebook: string;
  continueX: string;
  instantDemo: string;
  signUpEmail: string;
  signIn: string;
  signUp: string;
  skip: string;
  walk1Title: string;
  walk1Sub: string;
  walk2Title: string;
  walk2Sub: string;
  walk3Title: string;
  walk3Sub: string;
  letsGetStartedBtn: string;
  privacyTerms: string;
  joinNutrio: string;
  joinSubtitle: string;
  welcomeBack: string;
  welcomeBackSub: string;
  emailLabel: string;
  passwordLabel: string;
  agreeTermsPrefix: string;
  termsConditions: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  orContinueWith: string;
  rememberMe: string;
  forgotPassword: string;
  sendOtp: string;
  enterOtp: string;
  verifyReset: string;
  allSet: string;
  backToSignIn: string;

  // Home
  today: string;
  eaten: string;
  burned: string;
  kcalLeft: string;
  kcal: string;
  carbs: string;
  protein: string;
  fat: string;
  walking: string;
  activity: string;
  aiScan: string;
  aiBannerTitle: string;
  aiBannerSub: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;

  // Food Add / Create / Scan / Details
  searchFoodPlaceholder: string;
  quickLog: string;
  createFood: string;
  recognizePhotoBanner: string;
  recent: string;
  favorites: string;
  personal: string;
  noFoodsMatch: string;
  noFoodsSub: string;
  foodName: string;
  serving: string;
  unit: string;
  caloriesKcal: string;
  carbsG: string;
  proteinG: string;
  fatG: string;
  add: string;
  addTo: string;
  totalLabel: string;
  deleteTitle: string;
  deleteFoodConfirm: string;
  deletePersonalFoodConfirm: string;
  editFood: string;
  personalFoodDeletedToast: string;
  cannotBeUndone: string;
  yesDelete: string;
  foodLogDeletedToast: string;
  addedToFavoritesToast: string;
  removedFromFavoritesToast: string;
  noItemsLoggedYet: string;
  tapToDeleteHint: string;
  weightLabel: string;
  cholesterol: string;
  sodium: string;
  minerals: string;
  calcium: string;
  iron: string;
  potassium: string;
  aiScannerTitle: string;
  aiScannerPlaceholder: string;
  aiAnalyzing: string;
  activeVisionModel: string;
  describeMealLabel: string;
  describeMealPlaceholder: string;
  analyze: string;
  instantSamples: string;
  aiScannedDetails: string;
  servingWeight: string;

  // Tracker & Weight Calendar
  trackerTitle: string;
  water: string;
  step: string;
  steps: string;
  tapToUpdate: string;
  weight: string;
  update: string;
  starting: string;
  goal: string;
  bmiTitle: string;
  editBmi: string;
  heightCm: string;
  weightKg: string;
  cancel: string;
  save: string;
  weightTrackerTitle: string;
  current: string;
  weightCalendarView: string;
  weightCalendarSub: string;
  history: string;
  calendar: string;
  updateWeight: string;
  weightCalendarTitle: string;
  setTargetWeight: string;
  updateGoal: string;
  selectDate: string;
  months: string[];
  weekdaysShort: string[];

  // Activity
  activityLogTitle: string;
  totalBurnedToday: string;
  noActivitiesYet: string;
  quickAddExercise: string;
  createCustomActivity: string;
  activityName: string;
  caloriesBurned: string;
  durationMins: string;
  addActivity: string;

  // Insights
  insightsTitle: string;
  weekly: string;
  monthly: string;
  yearly: string;
  selected: string;
  nutritionPct: string;
  bmiNormal: string;
  bmiUnderweight: string;
  bmiOverweight: string;
  bmiObese: string;

  // Articles
  articlesTitle: string;
  articleDetails: string;
  minRead: string;

  // Account & Settings
  accountTitle: string;
  proBannerTitle: string;
  proBannerSub: string;
  calorieCounter: string;
  waterTracker: string;
  stepCounter: string;
  weightTrackerAndCal: string;
  recalculatePlan: string;
  geminiConfig: string;
  appLanguage: string;
  darkMode: string;
  logout: string;
  dailyGoalsTitle: string;
  dailyCalorieGoal: string;
  targetWeightGoal: string;
  dailyWaterGoal: string;
  dailyStepGoal: string;
  saveGoals: string;
  chooseLanguage: string;
  saveKey: string;

  // Onboarding
  continueBtn: string;
  finishBtn: string;
  startPlanNow: string;
  personalizingTitle: string;
  personalizingSub: string;
  planReadyTitle: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  step5Title: string;
  step6Title: string;
  step7Title: string;
  step8Title: string;
  step9Title: string;
  step10Title: string;
  step11Title: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  preferNotToSay: string;
  monthLabel: string;
  dayLabel: string;
  yearLabel: string;
  goalLoseWeight: string;
  goalGainMuscle: string;
  goalMaintain: string;
  goalBoostEnergy: string;
  goalImproveNutrition: string;
  goalGainWeight: string;
}

const en: TranslationStrings = {
  tabHome: 'Home',
  tabTracker: 'Tracker',
  tabInsights: 'Insights',
  tabArticles: 'Articles',
  tabAccount: 'Account',

  welcomeTitle: "Let's Get Started!",
  welcomeSubtitle: "Let's dive in into your account",
  continueGoogle: 'Continue with Google',
  continueApple: 'Continue with Apple',
  continueFacebook: 'Continue with Facebook',
  continueX: 'Continue with X',
  instantDemo: 'Instant Demo (Andrew Ainsley)',
  signUpEmail: 'Sign up',
  signIn: 'Sign in',
  signUp: 'Sign up',
  skip: 'Skip',
  walk1Title: 'Nutrio - Personalized\nTracking Made Easy',
  walk1Sub: 'Log your meals, track activities, steps, weight, BMI, and monitor hydration with tailored insights just for you.',
  walk2Title: 'Gain Clear Insights Into\nYour Progress',
  walk2Sub: 'See how your daily efforts stack up with detailed graphs and reports on calories, nutrition, and fitness.',
  walk3Title: 'Empower Your Health\nwith Expert Advice',
  walk3Sub: 'Access a wealth of knowledge, nutrition, and wellness articles tailored to your needs, written by our top experts.',
  letsGetStartedBtn: "Let's Get Started",
  privacyTerms: 'Privacy Policy  ·  Terms of Service',
  joinNutrio: 'Join Nutrio Today ✨',
  joinSubtitle: 'Create a Nutrio account to track your meals, stay active, and achieve your health goals.',
  welcomeBack: 'Welcome Back! 👋',
  welcomeBackSub: 'Sign in to your Nutrio account to continue tracking your daily nutrition and weight goals.',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  agreeTermsPrefix: 'I agree to Nutrio',
  termsConditions: 'Terms & Conditions',
  alreadyHaveAccount: 'Already have an account?',
  dontHaveAccount: "Don't have an account?",
  orContinueWith: 'or continue with',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot Password?',
  sendOtp: 'Send OTP Code',
  enterOtp: 'Enter OTP Code 🔐',
  verifyReset: 'Verify & Reset Password',
  allSet: "You're All Set!",
  backToSignIn: 'Back to Sign In',

  today: 'Today',
  eaten: 'Eaten',
  burned: 'Burned',
  kcalLeft: 'kcal left',
  kcal: 'kcal',
  carbs: 'Carbs',
  protein: 'Protein',
  fat: 'Fat',
  walking: 'Walking',
  activity: 'Activity',
  aiScan: 'AI Scan',
  aiBannerTitle: 'Gemini AI Food Recognition',
  aiBannerSub: 'Snap a photo or describe your meal for instant calorie & macro breakdown',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',

  searchFoodPlaceholder: 'Search food or ask AI...',
  quickLog: 'Quick Log',
  createFood: 'Create Food',
  recognizePhotoBanner: 'Recognize Food Photo or Description with Gemini AI',
  recent: 'Recent',
  favorites: 'Favorites',
  personal: 'Personal',
  noFoodsMatch: 'No foods match your filter',
  noFoodsSub: 'Use Gemini AI Scan or Create Food to add any meal!',
  foodName: 'Food Name',
  serving: 'Serving',
  unit: 'Unit',
  caloriesKcal: 'Calorie (kcal)',
  carbsG: 'Carbs (g)',
  proteinG: 'Protein (g)',
  fatG: 'Fat (g)',
  add: 'Add',
  addTo: 'Add to',
  totalLabel: 'Total',
  deleteTitle: 'Delete',
  deleteFoodConfirm: 'Sure you want to delete this food log?',
  deletePersonalFoodConfirm: 'Sure you want to delete this personal food?',
  editFood: 'Edit Food',
  personalFoodDeletedToast: 'Personal food deleted!',
  cannotBeUndone: 'This action cannot be undone.',
  yesDelete: 'Yes, Delete',
  foodLogDeletedToast: 'Food log successfully deleted!',
  addedToFavoritesToast: 'Added to Favorites!',
  removedFromFavoritesToast: 'Removed from Favorites!',
  noItemsLoggedYet: 'No items logged yet.',
  tapToDeleteHint: 'Tip: Tap any logged item to reveal the delete button',
  weightLabel: 'Weight',
  cholesterol: 'Cholesterol',
  sodium: 'Sodium',
  minerals: 'Minerals',
  calcium: 'Calcium',
  iron: 'Iron',
  potassium: 'Potassium',
  aiScannerTitle: 'AI Food & Barcode Scanner',
  aiScannerPlaceholder: 'Upload or capture a food photo for Gemini multimodal recognition',
  aiAnalyzing: 'Gemini AI is analyzing food portions & macros...',
  activeVisionModel: 'Active Low-Cost Vision Model:',
  describeMealLabel: '✨ Or describe your meal / barcode item to Gemini AI',
  describeMealPlaceholder: 'e.g. 2 scrambled eggs, avocado toast & latte',
  analyze: 'Analyze',
  instantSamples: 'Instant Sample Food Scans:',
  aiScannedDetails: 'AI Scanned Food Details',
  servingWeight: 'Serving Weight',

  trackerTitle: 'Tracker',
  water: 'Water',
  step: 'Step',
  steps: 'steps',
  tapToUpdate: 'tap to update',
  weight: 'Weight',
  update: 'Update',
  starting: 'Starting',
  goal: 'Goal',
  bmiTitle: 'BMI (kg/m2)',
  editBmi: 'Edit BMI',
  heightCm: 'Height (cm)',
  weightKg: 'Weight (kg)',
  cancel: 'Cancel',
  save: 'Save',
  weightTrackerTitle: 'Weight Tracker',
  current: 'Current',
  weightCalendarView: 'Weight Calendar View',
  weightCalendarSub: 'Inspect daily weights across the month or select any date to log',
  history: 'History',
  calendar: 'Calendar',
  updateWeight: 'Update Weight',
  weightCalendarTitle: 'Weight Calendar (kg)',
  setTargetWeight: 'Set Target Weight Goal',
  updateGoal: 'Update Goal',
  selectDate: 'Select Date',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weekdaysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],

  activityLogTitle: 'Activity Log',
  totalBurnedToday: 'Total Burned Today',
  noActivitiesYet: 'No activities logged for this date yet. Tap any activity below to add!',
  quickAddExercise: 'Quick Add Exercise',
  createCustomActivity: 'Create Custom Activity',
  activityName: 'Activity Name',
  caloriesBurned: 'Calories Burned (kcal)',
  durationMins: 'Duration (minutes)',
  addActivity: 'Add Activity',

  insightsTitle: 'Insights',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  selected: 'Selected',
  nutritionPct: 'Nutrition (%)',
  bmiNormal: 'Normal',
  bmiUnderweight: 'Underweight',
  bmiOverweight: 'Overweight',
  bmiObese: 'Obese',

  articlesTitle: 'Articles',
  articleDetails: 'Article Details',
  minRead: 'min read',

  accountTitle: 'Account',
  proBannerTitle: 'Nutrio Pro + Gemini AI',
  proBannerSub: 'Configure your Gemini model, API key, or recalculate your calorie plan',
  calorieCounter: 'Calorie Counter',
  waterTracker: 'Water Tracker',
  stepCounter: 'Step Counter',
  weightTrackerAndCal: 'Weight Tracker & Calendar',
  recalculatePlan: 'Recalculate 11-Step Plan',
  geminiConfig: 'Gemini AI Config',
  appLanguage: 'App Language',
  darkMode: 'Dark Mode',
  logout: 'Logout',
  dailyGoalsTitle: 'Daily Nutrition & Fitness Goals',
  dailyCalorieGoal: 'Daily Calorie Goal (kcal)',
  targetWeightGoal: 'Target Weight Goal (kg)',
  dailyWaterGoal: 'Daily Water Goal (mL)',
  dailyStepGoal: 'Daily Step Goal',
  saveGoals: 'Save Goals',
  chooseLanguage: 'Choose App Language',
  saveKey: 'Save Key',

  continueBtn: 'Continue',
  finishBtn: 'Finish',
  startPlanNow: 'Start Your Plan Now',
  personalizingTitle: 'Personalizing your Nutrio\nexperience...',
  personalizingSub: "Hang tight! We're crafting a personalized plan\njust for you.",
  planReadyTitle: 'Your personalized calorie\nplan is ready!',
  step1Title: "What's your name?",
  step2Title: "What's your gender?",
  step3Title: "When's your birthday?",
  step4Title: 'How tall are you?',
  step5Title: "What's your current weight?",
  step6Title: "What's your target weight?",
  step7Title: "What's your main goal\nwith Nutrio?",
  step8Title: "What's your activity level?",
  step9Title: "What's your diet type?",
  step10Title: 'When do you usually\nhave breakfast?',
  step11Title: 'When do you usually\nhave dinner?',
  genderMale: 'Male',
  genderFemale: 'Female',
  genderOther: 'Other',
  preferNotToSay: 'Prefer not to say',
  monthLabel: 'Month',
  dayLabel: 'Day',
  yearLabel: 'Year',
  goalLoseWeight: 'Lose Weight',
  goalGainMuscle: 'Gain Muscle',
  goalMaintain: 'Maintain Weight',
  goalBoostEnergy: 'Boost Energy',
  goalImproveNutrition: 'Improve Nutrition',
  goalGainWeight: 'Gain Weight',
};

const ru: TranslationStrings = {
  tabHome: 'Главная',
  tabTracker: 'Трекер',
  tabInsights: 'Отчёты',
  tabArticles: 'Статьи',
  tabAccount: 'Профиль',

  welcomeTitle: 'Начнём!',
  welcomeSubtitle: 'Войдите в свой аккаунт',
  continueGoogle: 'Продолжить с Google',
  continueApple: 'Продолжить с Apple',
  continueFacebook: 'Продолжить с Facebook',
  continueX: 'Продолжить с X',
  instantDemo: 'Быстрое демо (Эндрю Эйнсли)',
  signUpEmail: 'Регистрация',
  signIn: 'Войти',
  signUp: 'Регистрация',
  skip: 'Пропустить',
  walk1Title: 'Nutrio — Персональный\nтрекинг стал проще',
  walk1Sub: 'Записывайте приёмы пищи, активность, шаги, вес, ИМТ и воду с персональными подсказками.',
  walk2Title: 'Наглядная аналитика\nвашего прогресса',
  walk2Sub: 'Следите за ежедневными результатами с подробными графиками калорий, нутриентов и фитнеса.',
  walk3Title: 'Укрепляйте здоровье\nс советами экспертов',
  walk3Sub: 'Доступ к проверенным статьям о питании и здоровье от ведущих специалистов.',
  letsGetStartedBtn: 'Начать',
  privacyTerms: 'Политика конфиденциальности · Условия',
  joinNutrio: 'Присоединяйтесь к Nutrio ✨',
  joinSubtitle: 'Создайте аккаунт Nutrio, чтобы отслеживать питание, активность и цели по весу.',
  welcomeBack: 'С возвращением! 👋',
  welcomeBackSub: 'Войдите в аккаунт Nutrio, чтобы продолжить учёт калорий и веса.',
  emailLabel: 'Электронная почта',
  passwordLabel: 'Пароль',
  agreeTermsPrefix: 'Я принимаю',
  termsConditions: 'Условия использования Nutrio',
  alreadyHaveAccount: 'Уже есть аккаунт?',
  dontHaveAccount: 'Нет аккаунта?',
  orContinueWith: 'или продолжить через',
  rememberMe: 'Запомнить меня',
  forgotPassword: 'Забыли пароль?',
  sendOtp: 'Отправить код',
  enterOtp: 'Введите код 🔐',
  verifyReset: 'Подтвердить и сбросить пароль',
  allSet: 'Готово!',
  backToSignIn: 'Вернуться ко входу',

  today: 'Сегодня',
  eaten: 'Съедено',
  burned: 'Сожжено',
  kcalLeft: 'ккал осталось',
  kcal: 'ккал',
  carbs: 'Углеводы',
  protein: 'Белки',
  fat: 'Жиры',
  walking: 'Ходьба',
  activity: 'Активность',
  aiScan: 'ИИ Скан',
  aiBannerTitle: 'Распознавание еды Gemini AI',
  aiBannerSub: 'Сделайте фото или опишите блюдо для мгновенного расчёта КБЖУ',
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snacks: 'Перекусы',

  searchFoodPlaceholder: 'Поиск еды или спросить ИИ...',
  quickLog: 'Быстрый ввод',
  createFood: 'Создать блюдо',
  recognizePhotoBanner: 'Распознать фото или описание блюда с Gemini AI',
  recent: 'Недавние',
  favorites: 'Избранное',
  personal: 'Мои блюда',
  noFoodsMatch: 'Блюда не найдены',
  noFoodsSub: 'Используйте ИИ-сканер Gemini или создайте своё блюдо!',
  foodName: 'Название блюда',
  serving: 'Порция',
  unit: 'Ед. изм.',
  caloriesKcal: 'Калории (ккал)',
  carbsG: 'Углеводы (г)',
  proteinG: 'Белки (г)',
  fatG: 'Жиры (г)',
  add: 'Добавить',
  addTo: 'Добавить в',
  totalLabel: 'Итого',
  deleteTitle: 'Удалить',
  deleteFoodConfirm: 'Вы уверены, что хотите удалить эту запись?',
  deletePersonalFoodConfirm: 'Вы уверены, что хотите удалить это личное блюдо?',
  editFood: 'Редактировать блюдо',
  personalFoodDeletedToast: 'Личное блюдо удалено!',
  cannotBeUndone: 'Это действие нельзя отменить.',
  yesDelete: 'Да, удалить',
  foodLogDeletedToast: 'Запись успешно удалена!',
  addedToFavoritesToast: 'Добавлено в избранное!',
  removedFromFavoritesToast: 'Удалено из избранного!',
  noItemsLoggedYet: 'Пока нет записей.',
  tapToDeleteHint: 'Совет: нажмите на блюдо, чтобы удалить его',
  weightLabel: 'Вес',
  cholesterol: 'Холестерин',
  sodium: 'Натрий',
  minerals: 'Минералы',
  calcium: 'Кальций',
  iron: 'Железо',
  potassium: 'Калий',
  aiScannerTitle: 'ИИ-сканер еды и штрихкодов',
  aiScannerPlaceholder: 'Загрузите или сфотографируйте блюдо для распознавания через Gemini AI',
  aiAnalyzing: 'Gemini AI анализирует порцию и КБЖУ...',
  activeVisionModel: 'Активная экономичная модель:',
  describeMealLabel: '✨ Или опишите блюдо для Gemini AI',
  describeMealPlaceholder: 'напр. 2 яйца скрэмбл, тост с авокадо и латте',
  analyze: 'Анализ',
  instantSamples: 'Примеры быстрого сканирования:',
  aiScannedDetails: 'Результат ИИ-анализа',
  servingWeight: 'Вес порции',

  trackerTitle: 'Трекер',
  water: 'Вода',
  step: 'Шаги',
  steps: 'шагов',
  tapToUpdate: 'нажмите для ввода',
  weight: 'Вес',
  update: 'Обновить',
  starting: 'Начальный',
  goal: 'Цель',
  bmiTitle: 'ИМТ (кг/м²)',
  editBmi: 'Изменить ИМТ',
  heightCm: 'Рост (см)',
  weightKg: 'Вес (кг)',
  cancel: 'Отмена',
  save: 'Сохранить',
  weightTrackerTitle: 'Трекер веса',
  current: 'Текущий',
  weightCalendarView: 'Календарь веса',
  weightCalendarSub: 'Просматривайте вес по дням месяца или выберите дату для записи',
  history: 'История',
  calendar: 'Календарь',
  updateWeight: 'Обновить вес',
  weightCalendarTitle: 'Календарь веса (кг)',
  setTargetWeight: 'Установить целевой вес',
  updateGoal: 'Обновить цель',
  selectDate: 'Выбрать дату',
  months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],

  activityLogTitle: 'Журнал активности',
  totalBurnedToday: 'Сожжено сегодня',
  noActivitiesYet: 'За этот день нет тренировок. Нажмите на активность ниже, чтобы добавить!',
  quickAddExercise: 'Быстро добавить тренировку',
  createCustomActivity: 'Создать свою активность',
  activityName: 'Название активности',
  caloriesBurned: 'Сожжено калорий (ккал)',
  durationMins: 'Длительность (мин)',
  addActivity: 'Добавить активность',

  insightsTitle: 'Аналитика',
  weekly: 'Неделя',
  monthly: 'Месяц',
  yearly: 'Год',
  selected: 'Выбрано',
  nutritionPct: 'Нутриенты (%)',
  bmiNormal: 'Норма',
  bmiUnderweight: 'Дефицит веса',
  bmiOverweight: 'Избыточный вес',
  bmiObese: 'Ожирение',

  articlesTitle: 'Статьи',
  articleDetails: 'Статья',
  minRead: 'мин чтения',

  accountTitle: 'Аккаунт',
  proBannerTitle: 'Nutrio Pro + Gemini AI',
  proBannerSub: 'Настройте модель Gemini, API-ключ или пересчитайте план калорий',
  calorieCounter: 'Норма калорий',
  waterTracker: 'Трекер воды',
  stepCounter: 'Шагомер',
  weightTrackerAndCal: 'Трекер и календарь веса',
  recalculatePlan: 'Пересчитать план (11 шагов)',
  geminiConfig: 'Настройки Gemini AI',
  appLanguage: 'Язык приложения',
  darkMode: 'Тёмная тема',
  logout: 'Выйти',
  dailyGoalsTitle: 'Дневные цели питания и фитнеса',
  dailyCalorieGoal: 'Цель по калориям (ккал)',
  targetWeightGoal: 'Целевой вес (кг)',
  dailyWaterGoal: 'Цель по воде (мл)',
  dailyStepGoal: 'Цель по шагам',
  saveGoals: 'Сохранить цели',
  chooseLanguage: 'Выберите язык',
  saveKey: 'Сохранить ключ',

  continueBtn: 'Продолжить',
  finishBtn: 'Готово',
  startPlanNow: 'Начать план сейчас',
  personalizingTitle: 'Персонализируем ваш\nопыт в Nutrio...',
  personalizingSub: 'Минуточку! Мы создаём персональный план\nспециально для вас.',
  planReadyTitle: 'Ваш персональный план\nкалорий готов!',
  step1Title: 'Как вас зовут?',
  step2Title: 'Ваш пол?',
  step3Title: 'Год вашего рождения?',
  step4Title: 'Какой у вас рост?',
  step5Title: 'Ваш текущий вес?',
  step6Title: 'Какой ваш целевой вес?',
  step7Title: 'Ваша главная цель\nс Nutrio?',
  step8Title: 'Ваш уровень активности?',
  step9Title: 'Ваш тип питания?',
  step10Title: 'Во сколько вы обычно\nзавтракаете?',
  step11Title: 'Во сколько вы обычно\nужинаете?',
  genderMale: 'Мужской',
  genderFemale: 'Женский',
  genderOther: 'Другой',
  preferNotToSay: 'Предпочитаю не указывать',
  monthLabel: 'Месяц',
  dayLabel: 'День',
  yearLabel: 'Год',
  goalLoseWeight: 'Похудеть',
  goalGainMuscle: 'Набрать мышцы',
  goalMaintain: 'Удержать вес',
  goalBoostEnergy: 'Повысить энергию',
  goalImproveNutrition: 'Улучшить питание',
  goalGainWeight: 'Набрать вес',
};

const uk: TranslationStrings = {
  tabHome: 'Головна',
  tabTracker: 'Трекер',
  tabInsights: 'Звіти',
  tabArticles: 'Статті',
  tabAccount: 'Профіль',

  welcomeTitle: 'Почнімо!',
  welcomeSubtitle: 'Увійдіть у свій акаунт',
  continueGoogle: 'Продовжити з Google',
  continueApple: 'Продовжити з Apple',
  continueFacebook: 'Продовжити з Facebook',
  continueX: 'Продовжити з X',
  instantDemo: 'Швидке демо (Ендрю Ейнслі)',
  signUpEmail: 'Реєстрація',
  signIn: 'Увійти',
  signUp: 'Реєстрація',
  skip: 'Пропустити',
  walk1Title: 'Nutrio — Персональний\nтрекінг став простішим',
  walk1Sub: 'Записуйте страви, активність, кроки, вагу, ІМТ та воду з персональними порадами.',
  walk2Title: 'Чітка аналітика\nвашого прогресу',
  walk2Sub: 'Дивіться, як щоденні зусилля складаються у результат з графіками калорій, БЖВ та фітнесу.',
  walk3Title: 'Підсилюйте здоров’я\nпорадами експертів',
  walk3Sub: 'Отримайте доступ до знань та статей про харчування й велнес від провідних експертів.',
  letsGetStartedBtn: 'Почати',
  privacyTerms: 'Політика конфіденційності · Умови',
  joinNutrio: 'Приєднуйтесь до Nutrio ✨',
  joinSubtitle: 'Створіть обліковий запис Nutrio, щоб відстежувати страви, активність та цілі щодо ваги.',
  welcomeBack: 'З поверненням! 👋',
  welcomeBackSub: 'Увійдіть у Nutrio, щоб продовжити контроль харчування та ваги.',
  emailLabel: 'Електронна пошта',
  passwordLabel: 'Пароль',
  agreeTermsPrefix: 'Я погоджуюсь з',
  termsConditions: 'Умовами використання Nutrio',
  alreadyHaveAccount: 'Вже маєте акаунт?',
  dontHaveAccount: 'Немає акаунту?',
  orContinueWith: 'або продовжити через',
  rememberMe: 'Запам’ятати мене',
  forgotPassword: 'Забули пароль?',
  sendOtp: 'Надіслати код',
  enterOtp: 'Введіть код 🔐',
  verifyReset: 'Підтвердити та скинути пароль',
  allSet: 'Готово!',
  backToSignIn: 'Повернутися до входу',

  today: 'Сьогодні',
  eaten: 'З’їдено',
  burned: 'Спалено',
  kcalLeft: 'ккал залишилось',
  kcal: 'ккал',
  carbs: 'Вуглеводи',
  protein: 'Білки',
  fat: 'Жири',
  walking: 'Ходьба',
  activity: 'Активність',
  aiScan: 'ШІ Скан',
  aiBannerTitle: 'Розпізнавання їжі Gemini AI',
  aiBannerSub: 'Зробіть фото або опишіть страву для миттєвого підрахунку КБЖВ',
  breakfast: 'Сніданок',
  lunch: 'Обід',
  dinner: 'Вечеря',
  snacks: 'Перекуси',

  searchFoodPlaceholder: 'Пошук їжі або запитати ШІ...',
  quickLog: 'Швидкий запис',
  createFood: 'Створити страву',
  recognizePhotoBanner: 'Розпізнати фото або опис страви через Gemini AI',
  recent: 'Нещодавні',
  favorites: 'Обране',
  personal: 'Мої страви',
  noFoodsMatch: 'Страв не знайдено',
  noFoodsSub: 'Використовуйте ШІ-сканер Gemini або додайте власну страву!',
  foodName: 'Назва страви',
  serving: 'Порція',
  unit: 'Од. вим.',
  caloriesKcal: 'Калорії (ккал)',
  carbsG: 'Вуглеводи (г)',
  proteinG: 'Білки (г)',
  fatG: 'Жири (г)',
  add: 'Додати',
  addTo: 'Додати до',
  totalLabel: 'Всього',
  deleteTitle: 'Видалити',
  deleteFoodConfirm: 'Ви впевнені, що хочете видалити цей запис?',
  deletePersonalFoodConfirm: 'Ви впевнені, що хочете видалити цю особисту страву?',
  editFood: 'Редагувати страву',
  personalFoodDeletedToast: 'Особисту страву видалено!',
  cannotBeUndone: 'Цю дію неможливо скасувати.',
  yesDelete: 'Так, видалити',
  foodLogDeletedToast: 'Запис успішно видалено!',
  addedToFavoritesToast: 'Додано в обране!',
  removedFromFavoritesToast: 'Видалено з обраного!',
  noItemsLoggedYet: 'Поки що немає записів.',
  tapToDeleteHint: 'Порада: натисніть на страву, щоб видалити її',
  weightLabel: 'Вага',
  cholesterol: 'Холестерин',
  sodium: 'Натрій',
  minerals: 'Мінерали',
  calcium: 'Кальцій',
  iron: 'Залізо',
  potassium: 'Калій',
  aiScannerTitle: 'ШІ-сканер їжі та штрихкодів',
  aiScannerPlaceholder: 'Завантажте або сфотографуйте страву для розпізнавання Gemini AI',
  aiAnalyzing: 'Gemini AI аналізує порцію та КБЖВ...',
  activeVisionModel: 'Активна економна модель:',
  describeMealLabel: '✨ Або опишіть страву для Gemini AI',
  describeMealPlaceholder: 'напр. 2 яйця скрембл, тост з авокадо та лате',
  analyze: 'Аналіз',
  instantSamples: 'Приклади швидкого сканування:',
  aiScannedDetails: 'Результат ШІ-аналізу',
  servingWeight: 'Вага порції',

  trackerTitle: 'Трекер',
  water: 'Вода',
  step: 'Кроки',
  steps: 'кроків',
  tapToUpdate: 'натисніть для оновлення',
  weight: 'Вага',
  update: 'Оновити',
  starting: 'Початкова',
  goal: 'Ціль',
  bmiTitle: 'ІМТ (кг/м²)',
  editBmi: 'Змінити ІМТ',
  heightCm: 'Зріст (см)',
  weightKg: 'Вага (кг)',
  cancel: 'Скасувати',
  save: 'Зберегти',
  weightTrackerTitle: 'Трекер ваги',
  current: 'Поточна',
  weightCalendarView: 'Календар ваги',
  weightCalendarSub: 'Переглядайте щоденну вагу за місяць або виберіть дату для запису',
  history: 'Історія',
  calendar: 'Календар',
  updateWeight: 'Оновити вагу',
  weightCalendarTitle: 'Календар ваги (кг)',
  setTargetWeight: 'Встановити цільову вагу',
  updateGoal: 'Оновити ціль',
  selectDate: 'Вибрати дату',
  months: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
  weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],

  activityLogTitle: 'Журнал активності',
  totalBurnedToday: 'Спалено сьогодні',
  noActivitiesYet: 'За цей день активностей немає. Натисніть нижче, щоб додати!',
  quickAddExercise: 'Швидко додати тренування',
  createCustomActivity: 'Створити власну активність',
  activityName: 'Назва активності',
  caloriesBurned: 'Спалено калорій (ккал)',
  durationMins: 'Тривалість (хв)',
  addActivity: 'Додати активність',

  insightsTitle: 'Аналітика',
  weekly: 'Тиждень',
  monthly: 'Місяць',
  yearly: 'Рік',
  selected: 'Обрано',
  nutritionPct: 'Нутрієнти (%)',
  bmiNormal: 'Норма',
  bmiUnderweight: 'Недостатня вага',
  bmiOverweight: 'Надмірна вага',
  bmiObese: 'Ожиріння',

  articlesTitle: 'Статті',
  articleDetails: 'Стаття',
  minRead: 'хв читання',

  accountTitle: 'Акаунт',
  proBannerTitle: 'Nutrio Pro + Gemini AI',
  proBannerSub: 'Налаштуйте модель Gemini, API-ключ або перерахуйте план калорій',
  calorieCounter: 'Лічильник калорій',
  waterTracker: 'Трекер води',
  stepCounter: 'Крокомір',
  weightTrackerAndCal: 'Трекер і календар ваги',
  recalculatePlan: 'Перерахувати план (11 кроків)',
  geminiConfig: 'Налаштування Gemini AI',
  appLanguage: 'Мова застосунку',
  darkMode: 'Темна тема',
  logout: 'Вийти',
  dailyGoalsTitle: 'Щоденні цілі харчування та фітнесу',
  dailyCalorieGoal: 'Денна норма калорій (ккал)',
  targetWeightGoal: 'Цільова вага (кг)',
  dailyWaterGoal: 'Ціль по воді (мл)',
  dailyStepGoal: 'Ціль по кроках',
  saveGoals: 'Зберегти цілі',
  chooseLanguage: 'Оберіть мову',
  saveKey: 'Зберегти ключ',

  continueBtn: 'Продовжити',
  finishBtn: 'Завершити',
  startPlanNow: 'Почати план зараз',
  personalizingTitle: 'Персоналізуємо ваш\nдосвід у Nutrio...',
  personalizingSub: 'Хвилинку! Ми створюємо персональний план\nсаме для вас.',
  planReadyTitle: 'Ваш персональний план\nкалорій готовий!',
  step1Title: 'Як вас звати?',
  step2Title: 'Ваша стать?',
  step3Title: 'Рік вашого народження?',
  step4Title: 'Який ваш зріст?',
  step5Title: 'Ваша поточна вага?',
  step6Title: 'Яка ваша цільова вага?',
  step7Title: 'Ваша головна ціль\nз Nutrio?',
  step8Title: 'Ваш рівень активності?',
  step9Title: 'Ваш тип харчування?',
  step10Title: 'О котрій ви зазвичай\nснідаєте?',
  step11Title: 'О котрій ви зазвичай\nвечеряєте?',
  genderMale: 'Чоловіча',
  genderFemale: 'Жіноча',
  genderOther: 'Інша',
  preferNotToSay: 'Не хочу вказувати',
  monthLabel: 'Місяць',
  dayLabel: 'День',
  yearLabel: 'Рік',
  goalLoseWeight: 'Схуднути',
  goalGainMuscle: 'Набрати м’язи',
  goalMaintain: 'Підтримати вагу',
  goalBoostEnergy: 'Підвищити енергію',
  goalImproveNutrition: 'Покращити харчування',
  goalGainWeight: 'Набрати вагу',
};

const es: TranslationStrings = {
  ...en,
  tabHome: 'Inicio',
  tabTracker: 'Registro',
  tabInsights: 'Estadísticas',
  tabArticles: 'Artículos',
  tabAccount: 'Cuenta',
  welcomeTitle: '¡Empecemos!',
  welcomeSubtitle: 'Controla tus calorías diarias, escanea comidas con Gemini AI y alcanza tu peso ideal con Nutrio.',
  continueGoogle: 'Continuar con Google',
  continueApple: 'Continuar con Apple',
  instantDemo: 'Demo instantánea (Andrew Ainsley)',
  signUpEmail: 'Registrarse con Email',
  signIn: 'Iniciar sesión',
  signUp: 'Registrarse',
  joinNutrio: 'Únete a Nutrio Hoy ✨',
  welcomeBack: '¡Bienvenido de nuevo! 👋',
  emailLabel: 'Correo electrónico',
  passwordLabel: 'Contraseña',
  today: 'Hoy',
  eaten: 'Consumido',
  burned: 'Quemado',
  kcalLeft: 'kcal restantes',
  carbs: 'Carbohidratos',
  protein: 'Proteína',
  fat: 'Grasa',
  walking: 'Caminata',
  activity: 'Actividad',
  aiScan: 'Escáner IA',
  aiBannerTitle: 'Reconocimiento de Comida Gemini AI',
  aiBannerSub: 'Toma una foto o describe tu comida para ver calorías y macros al instante',
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snacks: 'Snacks',
  searchFoodPlaceholder: 'Buscar comida o preguntar a IA...',
  quickLog: 'Registro rápido',
  createFood: 'Crear alimento',
  recognizePhotoBanner: 'Reconocer foto o descripción con Gemini AI',
  recent: 'Recientes',
  favorites: 'Favoritos',
  personal: 'Personales',
  add: 'Añadir',
  addTo: 'Añadir a',
  aiScannerTitle: 'Escáner IA de Comida',
  analyze: 'Analizar',
  trackerTitle: 'Registro',
  water: 'Agua',
  step: 'Pasos',
  steps: 'pasos',
  weight: 'Peso',
  update: 'Actualizar',
  starting: 'Inicial',
  goal: 'Meta',
  cancel: 'Cancelar',
  save: 'Guardar',
  weightTrackerTitle: 'Control de Peso',
  current: 'Actual',
  weightCalendarView: 'Calendario de Peso',
  history: 'Historial',
  calendar: 'Calendario',
  updateWeight: 'Actualizar Peso',
  selectDate: 'Seleccionar fecha',
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  weekdaysShort: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
  insightsTitle: 'Estadísticas',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
  articlesTitle: 'Artículos',
  accountTitle: 'Cuenta',
  calorieCounter: 'Contador de Calorías',
  waterTracker: 'Control de Agua',
  stepCounter: 'Contador de Pasos',
  weightTrackerAndCal: 'Peso y Calendario',
  appLanguage: 'Idioma de la App',
  darkMode: 'Modo Oscuro',
  logout: 'Cerrar sesión',
  chooseLanguage: 'Elegir idioma',
  continueBtn: 'Continuar',
  startPlanNow: 'Comenzar tu plan ahora',
  planReadyTitle: '¡Tu plan personalizado\nde calorías está listo!',
};

const fr: TranslationStrings = {
  ...en,
  tabHome: 'Accueil',
  tabTracker: 'Suivi',
  tabInsights: 'Analyses',
  tabArticles: 'Articles',
  tabAccount: 'Compte',
  welcomeTitle: 'Commençons !',
  welcomeSubtitle: 'Suivez vos calories quotidiennes, scannez vos repas avec Gemini AI et atteignez votre objectif.',
  continueGoogle: 'Continuer avec Google',
  continueApple: 'Continuer avec Apple',
  instantDemo: 'Démo instantanée (Andrew Ainsley)',
  signUpEmail: "S'inscrire par Email",
  signIn: 'Se connecter',
  signUp: "S'inscrire",
  joinNutrio: 'Rejoignez Nutrio ✨',
  welcomeBack: 'Bon retour ! 👋',
  emailLabel: 'Email',
  passwordLabel: 'Mot de passe',
  today: "Aujourd'hui",
  eaten: 'Mangé',
  burned: 'Brûlé',
  kcalLeft: 'kcal restantes',
  carbs: 'Glucides',
  protein: 'Protéines',
  fat: 'Lipides',
  walking: 'Marche',
  activity: 'Activité',
  aiScan: 'Scan IA',
  aiBannerTitle: 'Reconnaissance Alimentaire Gemini AI',
  aiBannerSub: 'Prenez une photo ou décrivez votre repas pour les calories et macros',
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snacks: 'Collations',
  searchFoodPlaceholder: 'Rechercher un aliment...',
  quickLog: 'Ajout rapide',
  createFood: 'Créer un aliment',
  recognizePhotoBanner: 'Reconnaître une photo de repas avec Gemini AI',
  recent: 'Récents',
  favorites: 'Favoris',
  personal: 'Personnel',
  add: 'Ajouter',
  addTo: 'Ajouter à',
  aiScannerTitle: 'Scanner IA de Repas',
  analyze: 'Analyser',
  trackerTitle: 'Suivi',
  water: 'Eau',
  step: 'Pas',
  steps: 'pas',
  weight: 'Poids',
  update: 'Mettre à jour',
  starting: 'Départ',
  goal: 'Objectif',
  cancel: 'Annuler',
  save: 'Enregistrer',
  weightTrackerTitle: 'Suivi du Poids',
  current: 'Actuel',
  weightCalendarView: 'Calendrier du Poids',
  history: 'Historique',
  calendar: 'Calendrier',
  updateWeight: 'Mettre à jour le poids',
  selectDate: 'Choisir une date',
  months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  weekdaysShort: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
  insightsTitle: 'Analyses',
  weekly: 'Semaine',
  monthly: 'Mois',
  yearly: 'Année',
  articlesTitle: 'Articles',
  accountTitle: 'Compte',
  calorieCounter: 'Compteur de Calories',
  waterTracker: "Suivi d'Eau",
  stepCounter: 'Podomètre',
  weightTrackerAndCal: 'Poids & Calendrier',
  appLanguage: "Langue de l'application",
  darkMode: 'Mode Sombre',
  logout: 'Déconnexion',
  chooseLanguage: 'Choisir la langue',
  continueBtn: 'Continuer',
  startPlanNow: 'Démarrer votre plan',
  planReadyTitle: 'Votre plan calorique\npersonnalisé est prêt !',
};

const de: TranslationStrings = {
  ...en,
  tabHome: 'Start',
  tabTracker: 'Tracker',
  tabInsights: 'Statistik',
  tabArticles: 'Artikel',
  tabAccount: 'Konto',
  welcomeTitle: 'Lass uns starten!',
  welcomeSubtitle: 'Tracke deine täglichen Kalorien, scanne Mahlzeiten mit Gemini AI und erreiche dein Zielgewicht.',
  continueGoogle: 'Mit Google fortfahren',
  continueApple: 'Mit Apple fortfahren',
  instantDemo: 'Sofort-Demo (Andrew Ainsley)',
  signUpEmail: 'Mit E-Mail registrieren',
  signIn: 'Anmelden',
  signUp: 'Registrieren',
  joinNutrio: 'Werde Teil von Nutrio ✨',
  welcomeBack: 'Willkommen zurück! 👋',
  emailLabel: 'E-Mail',
  passwordLabel: 'Passwort',
  today: 'Heute',
  eaten: 'Gegessen',
  burned: 'Verbrannt',
  kcalLeft: 'kcal übrig',
  carbs: 'Kohlenhydrate',
  protein: 'Protein',
  fat: 'Fett',
  walking: 'Gehen',
  activity: 'Aktivität',
  aiScan: 'KI-Scan',
  aiBannerTitle: 'Gemini AI Essen-Erkennung',
  aiBannerSub: 'Foto aufnehmen oder Mahlzeit beschreiben für sofortige Kalorien & Makros',
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snacks: 'Snacks',
  searchFoodPlaceholder: 'Lebensmittel suchen...',
  quickLog: 'Schnelleingabe',
  createFood: 'Neues Essen',
  recognizePhotoBanner: 'Foto oder Beschreibung mit Gemini AI erkennen',
  recent: 'Kürzlich',
  favorites: 'Favoriten',
  personal: 'Eigene',
  add: 'Hinzufügen',
  addTo: 'Hinzufügen zu',
  aiScannerTitle: 'KI-Essens-Scanner',
  analyze: 'Analysieren',
  trackerTitle: 'Tracker',
  water: 'Wasser',
  step: 'Schritte',
  steps: 'Schritte',
  weight: 'Gewicht',
  update: 'Aktualisieren',
  starting: 'Start',
  goal: 'Ziel',
  cancel: 'Abbrechen',
  save: 'Speichern',
  weightTrackerTitle: 'Gewichtstracker',
  current: 'Aktuell',
  weightCalendarView: 'Gewichtskalender',
  history: 'Verlauf',
  calendar: 'Kalender',
  updateWeight: 'Gewicht aktualisieren',
  selectDate: 'Datum wählen',
  months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  weekdaysShort: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  insightsTitle: 'Statistik',
  weekly: 'Woche',
  monthly: 'Monat',
  yearly: 'Jahr',
  articlesTitle: 'Artikel',
  accountTitle: 'Konto',
  calorieCounter: 'Kalorienzähler',
  waterTracker: 'Wassertracker',
  stepCounter: 'Schrittzähler',
  weightTrackerAndCal: 'Gewicht & Kalender',
  appLanguage: 'App-Sprache',
  darkMode: 'Dunkelmodus',
  logout: 'Abmelden',
  chooseLanguage: 'Sprache wählen',
  continueBtn: 'Weiter',
  startPlanNow: 'Plan jetzt starten',
  planReadyTitle: 'Dein persönlicher\nKalorienplan ist fertig!',
};

const pt: TranslationStrings = {
  ...en,
  tabHome: 'Início',
  tabTracker: 'Rastreador',
  tabInsights: 'Relatórios',
  tabArticles: 'Artigos',
  tabAccount: 'Conta',
  welcomeTitle: 'Vamos Começar!',
  welcomeSubtitle: 'Acompanhe suas calorias, escaneie refeições com Gemini AI e alcance seu peso ideal.',
  signUpEmail: 'Cadastrar com E-mail',
  signIn: 'Entrar',
  signUp: 'Cadastrar',
  today: 'Hoje',
  eaten: 'Consumido',
  burned: 'Queimado',
  kcalLeft: 'kcal restantes',
  carbs: 'Carboidratos',
  protein: 'Proteína',
  fat: 'Gordura',
  walking: 'Caminhada',
  activity: 'Atividade',
  aiScan: 'Scan IA',
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snacks: 'Lanches',
  water: 'Água',
  step: 'Passos',
  steps: 'passos',
  weight: 'Peso',
  update: 'Atualizar',
  cancel: 'Cancelar',
  save: 'Salvar',
  weightTrackerTitle: 'Controle de Peso',
  weightCalendarView: 'Calendário de Peso',
  history: 'Histórico',
  calendar: 'Calendário',
  months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  weekdaysShort: ['Se', 'Te', 'Qa', 'Qi', 'Sx', 'Sá', 'Do'],
  insightsTitle: 'Relatórios',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
  articlesTitle: 'Artigos',
  accountTitle: 'Conta',
  appLanguage: 'Idioma do App',
  darkMode: 'Modo Escuro',
  logout: 'Sair',
  chooseLanguage: 'Escolher Idioma',
  continueBtn: 'Continuar',
  startPlanNow: 'Começar plano agora',
};

const it: TranslationStrings = {
  ...en,
  tabHome: 'Home',
  tabTracker: 'Tracker',
  tabInsights: 'Statistiche',
  tabArticles: 'Articoli',
  tabAccount: 'Profilo',
  welcomeTitle: 'Iniziamo!',
  welcomeSubtitle: 'Monitora le calorie quotidiane, scansiona i pasti con Gemini AI e raggiungi il peso ideale.',
  signUpEmail: 'Registrati con Email',
  signIn: 'Accedi',
  signUp: 'Registrati',
  today: 'Oggi',
  eaten: 'Assunte',
  burned: 'Bruciate',
  kcalLeft: 'kcal rimaste',
  carbs: 'Carboidrati',
  protein: 'Proteine',
  fat: 'Grassi',
  walking: 'Camminata',
  activity: 'Attività',
  aiScan: 'Scan IA',
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  dinner: 'Cena',
  snacks: 'Spuntini',
  water: 'Acqua',
  step: 'Passi',
  steps: 'passi',
  weight: 'Peso',
  update: 'Aggiorna',
  cancel: 'Annulla',
  save: 'Salva',
  weightTrackerTitle: 'Tracker Peso',
  weightCalendarView: 'Calendario Peso',
  history: 'Cronologia',
  calendar: 'Calendario',
  months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  weekdaysShort: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
  insightsTitle: 'Statistiche',
  weekly: 'Settimana',
  monthly: 'Mese',
  yearly: 'Anno',
  articlesTitle: 'Articoli',
  accountTitle: 'Profilo',
  appLanguage: 'Lingua App',
  darkMode: 'Modalità Scura',
  logout: 'Esci',
  chooseLanguage: 'Scegli la lingua',
  continueBtn: 'Continua',
  startPlanNow: 'Inizia il tuo piano',
};

const zh: TranslationStrings = {
  ...en,
  tabHome: '首页',
  tabTracker: '记录',
  tabInsights: '统计',
  tabArticles: '文章',
  tabAccount: '我的',
  welcomeTitle: '立即开始！',
  welcomeSubtitle: '使用 Nutrio 记录每日热量，通过 Gemini AI 拍照识别食物，轻松达成减重目标。',
  continueGoogle: '使用 Google 继续',
  continueApple: '使用 Apple 继续',
  instantDemo: '一键体验演示账号',
  signUpEmail: '使用邮箱注册',
  signIn: '登录',
  signUp: '注册',
  today: '今天',
  eaten: '已摄入',
  burned: '已消耗',
  kcalLeft: '剩余千卡',
  kcal: '千卡',
  carbs: '碳水',
  protein: '蛋白质',
  fat: '脂肪',
  walking: '步行',
  activity: '运动',
  aiScan: 'AI 识图',
  aiBannerTitle: 'Gemini AI 食物识别',
  aiBannerSub: '拍一张照片或描述餐食，立即分析热量与营养素',
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snacks: '加餐',
  searchFoodPlaceholder: '搜索食物或询问 AI...',
  quickLog: '快速记录',
  createFood: '自定义食物',
  recent: '最近',
  favorites: '收藏',
  personal: '自定义',
  add: '添加',
  addTo: '添加到',
  aiScannerTitle: 'AI 食物扫描仪',
  analyze: '分析',
  trackerTitle: '健康记录',
  water: '饮水',
  step: '步数',
  steps: '步',
  weight: '体重',
  update: '更新',
  starting: '初始',
  goal: '目标',
  cancel: '取消',
  save: '保存',
  weightTrackerTitle: '体重记录',
  current: '当前',
  weightCalendarView: '体重日历',
  history: '历史记录',
  calendar: '日历',
  updateWeight: '更新体重',
  selectDate: '选择日期',
  months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  weekdaysShort: ['一', '二', '三', '四', '五', '六', '日'],
  insightsTitle: '数据洞察',
  weekly: '本周',
  monthly: '本月',
  yearly: '全年',
  articlesTitle: '健康资讯',
  accountTitle: '个人中心',
  appLanguage: '应用语言',
  darkMode: '深色模式',
  logout: '退出登录',
  chooseLanguage: '选择语言',
  continueBtn: '继续',
  startPlanNow: '立即开始计划',
  planReadyTitle: '您的专属热量计划\n已准备就绪！',
};

const ja: TranslationStrings = {
  ...en,
  tabHome: 'ホーム',
  tabTracker: '記録',
  tabInsights: '分析',
  tabArticles: '記事',
  tabAccount: 'アカウント',
  welcomeTitle: '始めましょう！',
  welcomeSubtitle: 'Nutrioで毎日のカロリーを記録し、Gemini AIで食事をスキャンして目標体重を達成しましょう。',
  continueGoogle: 'Googleで続行',
  continueApple: 'Appleで続行',
  instantDemo: 'デモアカウントで試す',
  signUpEmail: 'メールで新規登録',
  signIn: 'ログイン',
  signUp: '登録',
  today: '今日',
  eaten: '摂取',
  burned: '消費',
  kcalLeft: 'kcal 残り',
  carbs: '炭水化物',
  protein: 'タンパク質',
  fat: '脂質',
  walking: 'ウォーキング',
  activity: '運動',
  aiScan: 'AIスキャン',
  aiBannerTitle: 'Gemini AI 食事認識',
  aiBannerSub: '写真またはテキストからカロリーと栄養素を瞬時に計算',
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snacks: '間食',
  searchFoodPlaceholder: '食品を検索またはAIに質問...',
  quickLog: 'クイック記録',
  createFood: '食品を作成',
  recent: '最近',
  favorites: 'お気に入り',
  personal: 'マイ食品',
  add: '追加',
  addTo: '追加先:',
  aiScannerTitle: 'AI 食事スキャナー',
  analyze: '分析',
  trackerTitle: 'トラッカー',
  water: '水分',
  step: '歩数',
  steps: '歩',
  weight: '体重',
  update: '更新',
  starting: '開始時',
  goal: '目標',
  cancel: 'キャンセル',
  save: '保存',
  weightTrackerTitle: '体重管理',
  current: '現在',
  weightCalendarView: '体重カレンダー',
  history: '履歴',
  calendar: 'カレンダー',
  updateWeight: '体重を更新',
  selectDate: '日付を選択',
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  weekdaysShort: ['月', '火', '水', '木', '金', '土', '日'],
  insightsTitle: '分析',
  weekly: '週間',
  monthly: '月間',
  yearly: '年間',
  articlesTitle: '記事',
  accountTitle: 'アカウント',
  appLanguage: 'アプリ言語',
  darkMode: 'ダークモード',
  logout: 'ログアウト',
  chooseLanguage: '言語を選択',
  continueBtn: '続ける',
  startPlanNow: 'プランを開始する',
  planReadyTitle: 'あなた専用のカロリー\nプランが完成しました！',
};

export const TRANSLATIONS: Record<AppLanguage, TranslationStrings> = {
  en,
  ru,
  uk,
  es,
  fr,
  de,
  pt,
  it,
  zh,
  ja,
};

export function getLanguageMeta(code: AppLanguage): LanguageOption {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
}
