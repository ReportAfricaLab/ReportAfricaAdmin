import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

export function useThemeColors() {
  const { isDarkMode } = useAppStore();
  return isDarkMode ? theme.colors.dark : theme.colors.light;
}
