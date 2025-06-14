import config from '../config';

interface StoredToken {
  value: string;
  expires: number;
}

/**
 * Saves an authentication token to storage
 * @param token The token to store
 * @param rememberMe Whether to use localStorage (persistent) or sessionStorage (session only)
 * @param expiresInSeconds How long the token should be valid, defaults to config value
 */
export const saveToken = (
  token: string, 
  rememberMe: boolean = false, 
  expiresInSeconds: number = config.auth.tokenExpiration
): void => {
  const storage = rememberMe ? localStorage : sessionStorage;
  
  // Create storage object with expiration
  const tokenObject: StoredToken = {
    value: token,
    expires: Date.now() + (expiresInSeconds * 1000)
  };
  
  storage.setItem(config.auth.tokenKey, JSON.stringify(tokenObject));
};

/**
 * Retrieves a valid authentication token from storage
 * @returns The token string if valid, null otherwise
 */
export const getToken = (): string | null => {
  // Try to get token from sessionStorage first, then localStorage
  const tokenJson = sessionStorage.getItem(config.auth.tokenKey) || 
                    localStorage.getItem(config.auth.tokenKey);
  
  if (!tokenJson) {
    return null;
  }
  
  try {
    const tokenObject = JSON.parse(tokenJson) as StoredToken;
    
    // Check if token is expired
    if (tokenObject.expires < Date.now()) {
      // Remove expired token
      removeToken();
      return null;
    }
    
    return tokenObject.value;
  } catch (error) {
    // If JSON parsing fails, likely an old format token
    // Try to use it directly for backward compatibility
    return tokenJson;
  }
};

/**
 * Removes the authentication token from all storages
 */
export const removeToken = (): void => {
  sessionStorage.removeItem(config.auth.tokenKey);
  localStorage.removeItem(config.auth.tokenKey);
};

/**
 * Refreshes the token expiration time
 * @param expiresInSeconds New expiration time in seconds
 * @returns True if refreshed, false if no valid token found
 */
export const refreshTokenExpiration = (
  expiresInSeconds: number = config.auth.tokenExpiration
): boolean => {
  // Try to get token from both storages
  const sessionTokenJson = sessionStorage.getItem(config.auth.tokenKey);
  const localTokenJson = localStorage.getItem(config.auth.tokenKey);
  
  if (sessionTokenJson) {
    try {
      const tokenObject = JSON.parse(sessionTokenJson) as StoredToken;
      tokenObject.expires = Date.now() + (expiresInSeconds * 1000);
      sessionStorage.setItem(config.auth.tokenKey, JSON.stringify(tokenObject));
      return true;
    } catch (error) {
      return false;
    }
  }
  
  if (localTokenJson) {
    try {
      const tokenObject = JSON.parse(localTokenJson) as StoredToken;
      tokenObject.expires = Date.now() + (expiresInSeconds * 1000);
      localStorage.setItem(config.auth.tokenKey, JSON.stringify(tokenObject));
      return true;
    } catch (error) {
      return false;
    }
  }
  
  return false;
};

export default {
  saveToken,
  getToken,
  removeToken,
  refreshTokenExpiration
}; 