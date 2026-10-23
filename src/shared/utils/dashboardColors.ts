import { COLOR_TOKENS } from '@utils/formatPulseChart';

/** Paleta dos dashboards nativos (US07.01), a mesma das telas atuais do produto. */
export const DASHBOARD_COLORS = {
  primary: COLOR_TOKENS.primary,
  cardTitle: COLOR_TOKENS.secondary,
  cardBorder: '#9FB3C8',
  text: '#1F2328',
  mutedText: '#595959',
  gridLine: '#E6EAEF',
  skeleton: '#E4E8ED',
  infoBackground: '#E8EFFA',
  errorBackground: '#F1C2B7',
  error: COLOR_TOKENS.critical,
  planned: '#5C91C5',
  accomplished: COLOR_TOKENS.warning
};

/** Paleta das telas atuais: primária, planejado × realizado e faixas de qualidade. */
export const SERIES_COLORS = [
  COLOR_TOKENS.primary,
  '#FF8C00',
  COLOR_TOKENS.adequate,
  '#1F60C4',
  COLOR_TOKENS.warning,
  COLOR_TOKENS.secondary,
  COLOR_TOKENS.critical,
  '#7B5EA7',
  '#2E9C9C',
  COLOR_TOKENS.axisText,
];
