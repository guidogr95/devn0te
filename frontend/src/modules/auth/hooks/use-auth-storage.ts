import { TOKEN_KEY } from "devnote/core/constants/storage";
import { useLocalStorage } from "devnote/modules/shared/hooks/use-local-storage";

export function useAuthStorage() {
  const [token, setToken] = useLocalStorage<string>(TOKEN_KEY);

  const login = (token: string) => {
    setToken(token);
  };

  const logout = () => {
    setToken(null);
  };

  return {
    isAuthenticated: !!token,
    login,
    logout
  };
}
