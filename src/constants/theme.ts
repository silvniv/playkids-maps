export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  primary: '#2563EB',
  secondary: '#10B981',
  border: '#E5E7EB',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const spacing = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };

export const borderRadius = { sm: 10, md: 14, lg: 18 };

export const typography = {
  title: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;
