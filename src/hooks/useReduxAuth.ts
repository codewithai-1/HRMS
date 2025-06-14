import useAppSelector from './useAppSelector';
import useAppDispatch from './useAppDispatch';
import { login, register, logout, clearError } from '../store/authSlice';
import { LoginRequest, RegisterRequest } from '../types/index';

// Custom hook for authentication with Redux
const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  
  // Function to handle login
  const handleLogin = async (credentials: LoginRequest) => {
    return dispatch(login(credentials)).unwrap();
  };
  
  // Function to handle registration
  const handleRegister = async (userData: RegisterRequest) => {
    return dispatch(register(userData)).unwrap();
  };
  
  // Function to handle logout
  const handleLogout = async () => {
    return dispatch(logout()).unwrap();
  };
  
  // Function to clear error
  const handleClearError = () => {
    dispatch(clearError());
  };
  
  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

export default useReduxAuth; 