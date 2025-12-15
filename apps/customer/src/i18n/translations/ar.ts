// Arabic translations
import { TranslationKeys } from './en';

export const ar: TranslationKeys = {
  // Common
  common: {
    loading: 'جار التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    cancel: 'إلغاء',
    save: 'حفظ',
    done: 'تم',
    back: 'رجوع',
    next: 'التالي',
    submit: 'إرسال',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    noResults: 'لم يتم العثور على نتائج',
    retry: 'إعادة المحاولة',
    gotIt: 'فهمت',
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    signUp: 'إنشاء حساب',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    emailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    invalidEmail: 'عنوان بريد إلكتروني غير صالح',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    passwordTooShort: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
  },

  // Profile
  profile: {
    title: 'الملف الشخصي',
    editProfile: 'تعديل الملف الشخصي',
    personalInfo: 'المعلومات الشخصية',
    updateProfile: 'تحديث بيانات ملفك الشخصي',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    phone: 'رقم الهاتف',
    emailCannotChange: 'لا يمكن تغيير البريد الإلكتروني',
    saveChanges: 'حفظ التغييرات',
    unsavedChanges: 'تغييرات غير محفوظة',
    unsavedChangesMessage: 'لديك تغييرات غير محفوظة. هل أنت متأكد من الرجوع؟',
    discard: 'تجاهل',
    profileUpdated: 'تم تحديث ملفك الشخصي',
  },

  // Menu sections
  menu: {
    account: 'الحساب',
    preferences: 'التفضيلات',
    support: 'الدعم',
    personalInformation: 'المعلومات الشخصية',
    myProperties: 'عقاراتي',
    paymentMethods: 'طرق الدفع',
    billingHistory: 'سجل الفواتير',
    pushNotifications: 'الإشعارات',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    helpCenter: 'مركز المساعدة',
    contactSupport: 'اتصل بالدعم',
    termsOfService: 'شروط الخدمة',
    privacyPolicy: 'سياسة الخصوصية',
    signOut: 'تسجيل الخروج',
  },

  // Languages
  languages: {
    selectLanguage: 'اختر اللغة',
    english: 'English',
    arabic: 'العربية',
  },

  // Properties
  properties: {
    title: 'عقاراتي',
    addProperty: 'إضافة عقار',
    noProperties: 'لا توجد عقارات بعد',
    addFirstProperty: 'أضف عقارك الأول',
    propertyName: 'اسم العقار',
    address: 'العنوان',
    area: 'المنطقة',
    city: 'المدينة',
    setPrimary: 'تعيين كأساسي',
    primary: 'أساسي',
    property: 'عقار',
    properties: 'عقارات',
  },

  // Service Requests
  requests: {
    title: 'طلبات الخدمة',
    newRequest: 'طلب جديد',
    noRequests: 'لا توجد طلبات خدمة بعد',
    createFirst: 'أنشئ طلب الخدمة الأول',
    status: 'الحالة',
    date: 'التاريخ',
    description: 'الوصف',
    pending: 'قيد الانتظار',
    inProgress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  },

  // Chat
  chat: {
    title: 'المحادثة',
    typeMessage: 'اكتب رسالتك...',
    send: 'إرسال',
    assistant: 'المساعد',
    you: 'أنت',
    thinking: 'يفكر...',
  },

  // Home
  home: {
    welcome: 'مرحباً',
    activeRequests: 'الطلبات النشطة',
    recentActivity: 'النشاط الأخير',
    noActiveRequests: 'لا توجد طلبات نشطة',
    viewAll: 'عرض الكل',
  },

  // Modals
  modals: {
    comingSoon: 'قريباً',
    comingSoonMessage: 'هذه الميزة قادمة قريباً!\nنحن نعمل بجد لتقديمها لك.',
    signOutTitle: 'تسجيل الخروج',
    signOutMessage: 'هل أنت متأكد من تسجيل الخروج من حسابك؟',
  },

  // Validation
  validation: {
    required: 'هذا الحقل مطلوب',
    invalidFormat: 'تنسيق غير صالح',
    minLength: 'يجب أن يكون {{min}} أحرف على الأقل',
    maxLength: 'يجب أن يكون {{max}} أحرف على الأكثر',
  },

  // Welcome Screen
  welcome: {
    tagline: 'خدمات المنزل في متناول يدك',
    stats: {
      happyCustomers: 'عميل سعيد',
      appRating: 'تقييم التطبيق',
      verifiedPros: 'متخصص معتمد',
    },
    continueWithApple: 'المتابعة مع Apple',
    continueWithGoogle: 'المتابعة مع Google',
    or: 'أو',
    signInWithEmail: 'تسجيل الدخول بالبريد الإلكتروني',
    newToAgentCare: 'جديد على AgentCare؟',
    createAccount: 'إنشاء حساب',
    browseAsGuest: 'تصفح كضيف',
    sslEncrypted: 'تشفير SSL 256-bit',
    termsAgreement: 'بالمتابعة، أنت توافق على',
    terms: 'الشروط',
    and: 'و',
    privacyPolicy: 'سياسة الخصوصية',
  },
};
