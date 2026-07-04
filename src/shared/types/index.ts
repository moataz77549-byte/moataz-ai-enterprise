export type SupportedLocale = 'en' | 'ar';
export type SupportedTheme = 'light' | 'dark' | 'system';
export type Direction = 'ltr' | 'rtl';

export interface NavigationItem {
  labelKey: string;
  href: string;
  icon: string;
  section: string;
}

export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };
