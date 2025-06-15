const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',
    timeout: 30000,
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || true,
    mockDataDelay: 500, // Delay in ms for mock API responses
  },
  
  // Authentication Configuration
  auth: {
    tokenKey: 'staffin_token',
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days in seconds
    login: '/auth/login',
  },
  
  // App Configuration
  app: {
    name: 'StaffIn',
    version: '1.0.0',
    defaultTheme: 'light' as 'light' | 'dark',
  },
  
  // Feature Flags
  features: {
    enableDarkMode: true,
    enableNotifications: true,
  },
  
  // Routes Configuration
  routes: {
    // Auth routes
    auth: {
      login: '/auth/login',
    },
    // Dashboard route
    dashboard: '/dashboard',
    // Role Management route
    roles: '/roles',
    // Department Management route
    departments: '/departments',
    // Employee Management route
    employees: '/employees',
    // Transfer Management route
    transfers: '/transfers',
    // Shift Management route
    shifts: '/shifts',
    // Recruitment route
    recruitment: '/recruitment',
    // Leave Management route
    leave: '/leave',
    // Holiday Management route
    holidays: '/holidays',
    // Attendance Management route
    attendance: '/attendance',
    // Goals Management route
    goals: '/goals',
    // Recognition routes
    recognition: {
      dashboard: '/recognition',
      nominate: '/recognition/nominate',
      winners: '/recognition/winners',
      myNominations: '/recognition/my-nominations',
    },
  },
};

export default config; 