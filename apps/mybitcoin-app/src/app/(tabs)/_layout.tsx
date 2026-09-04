import AppTabs from '@/components/app-tabs';

/**
 * Layout do grupo `(tabs)` — só monta o `AppTabs` (NativeTabs) já existente.
 * Os `name="index"`/`name="explore"` dos triggers resolvem para os irmãos
 * dentro deste mesmo grupo.
 */
export default function TabsLayout() {
  return <AppTabs />;
}
