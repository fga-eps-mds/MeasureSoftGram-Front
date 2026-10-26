const supportedLngs = ['en', 'pt'];

export const ni18nConfig = {
  fallbackLng: supportedLngs,
  supportedLngs,
  ns: [
    'translation',
    'landing',
    'home',
    'about',
    'sidebar',
    'settings',
    'releases',
    'repositories',
    'overview',
    'header',
    'latest_value_table',
    'graphic_chart'
  ],
  react: {
    useSuspense: false
  }
};
