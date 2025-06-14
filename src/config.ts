const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
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
  },
};

export default config; 