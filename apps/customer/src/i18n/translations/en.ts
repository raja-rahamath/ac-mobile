// English translations
export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    noResults: 'No results found',
    retry: 'Retry',
    gotIt: 'Got it',
  },

  // Auth
  auth: {
    login: 'Login',
    logout: 'Logout',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    invalidEmail: 'Invalid email address',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
  },

  // Profile
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    updateProfile: 'Update your profile details',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    emailCannotChange: 'Email cannot be changed',
    saveChanges: 'Save Changes',
    unsavedChanges: 'Unsaved Changes',
    unsavedChangesMessage: 'You have unsaved changes. Are you sure you want to go back?',
    discard: 'Discard',
    profileUpdated: 'Your profile has been updated',
  },

  // Menu sections
  menu: {
    account: 'ACCOUNT',
    preferences: 'PREFERENCES',
    support: 'SUPPORT',
    personalInformation: 'Personal Information',
    myProperties: 'My Properties',
    paymentMethods: 'Payment Methods',
    billingHistory: 'Billing History',
    pushNotifications: 'Push Notifications',
    darkMode: 'Dark Mode',
    language: 'Language',
    helpCenter: 'Help Center',
    contactSupport: 'Contact Support',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    signOut: 'Sign Out',
  },

  // Languages
  languages: {
    selectLanguage: 'Select Language',
    english: 'English',
    arabic: 'العربية (Arabic)',
  },

  // Properties
  properties: {
    title: 'My Properties',
    addProperty: 'Add Property',
    noProperties: 'No properties yet',
    addFirstProperty: 'Add your first property',
    propertyName: 'Property Name',
    address: 'Address',
    area: 'Area',
    city: 'City',
    setPrimary: 'Set as Primary',
    primary: 'Primary',
    property: 'property',
    properties: 'properties',
  },

  // Service Requests
  requests: {
    title: 'Service Requests',
    newRequest: 'New Request',
    noRequests: 'No service requests yet',
    createFirst: 'Create your first service request',
    status: 'Status',
    date: 'Date',
    description: 'Description',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },

  // Chat
  chat: {
    title: 'Chat',
    typeMessage: 'Type your message...',
    send: 'Send',
    assistant: 'Assistant',
    you: 'You',
    thinking: 'Thinking...',
  },

  // Home
  home: {
    welcome: 'Welcome',
    activeRequests: 'Active Requests',
    recentActivity: 'Recent Activity',
    noActiveRequests: 'No active requests',
    viewAll: 'View All',
  },

  // Modals
  modals: {
    comingSoon: 'Coming Soon',
    comingSoonMessage: "This feature is coming soon!\nWe're working hard to bring it to you.",
    signOutTitle: 'Sign Out',
    signOutMessage: 'Are you sure you want to sign out of your account?',
  },

  // Validation
  validation: {
    required: 'This field is required',
    invalidFormat: 'Invalid format',
    minLength: 'Must be at least {{min}} characters',
    maxLength: 'Must be at most {{max}} characters',
  },

  // Welcome Screen
  welcome: {
    tagline: 'Home Services at Your Fingertips',
    stats: {
      happyCustomers: 'Happy Customers',
      appRating: 'App Rating',
      verifiedPros: 'Verified Pros',
    },
    continueWithApple: 'Continue with Apple',
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    signInWithEmail: 'Sign in with Email',
    newToAgentCare: 'New to AgentCare?',
    createAccount: 'Create Account',
    browseAsGuest: 'Browse as Guest',
    sslEncrypted: '256-bit SSL Encrypted',
    termsAgreement: 'By continuing, you agree to our',
    terms: 'Terms',
    and: '&',
    privacyPolicy: 'Privacy Policy',
  },
};

export type TranslationKeys = typeof en;
