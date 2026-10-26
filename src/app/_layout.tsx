import { Anton_400Regular } from '@expo-google-fonts/anton/400Regular';
import { AtkinsonHyperlegible_400Regular } from '@expo-google-fonts/atkinson-hyperlegible/400Regular';
import { AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible/700Bold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { Unbounded_500Medium } from '@expo-google-fonts/unbounded/500Medium';
import { Unbounded_700Bold } from '@expo-google-fonts/unbounded/700Bold';
import { Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded/800ExtraBold';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider, useStore } from '../data/AppStore';
import i18n, { resolveLang } from '../i18n';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { Backdrop } from '../ui/graphics';
import { FxLayer, SheetProvider, ToastProvider } from '../ui/overlays';
import { UiStateProvider } from '../ui/uiState';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Anton_400Regular,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    Unbounded_500Medium,
    Unbounded_700Bold,
    Unbounded_800ExtraBold,
  });
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <Themed fontsReady={fontsLoaded || !!fontError} />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}

function Themed({ fontsReady }: { fontsReady: boolean }) {
  const { ready, settings } = useStore();
  // The static web export is pre-rendered without knowing the device theme. Until mounted we render
  // only a neutral shell, so hydration matches and the real colors are applied on the next render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const lang = resolveLang(settings.language);
  // Switch synchronously so the first frame after a change is already in the new language.
  if (mounted && i18n.language !== lang) i18n.changeLanguage(lang);
  const show = ready && fontsReady;
  useEffect(() => {
    if (show) SplashScreen.hideAsync().catch(() => {});
  }, [show]);
  if (!mounted) return <Skeleton />;
  return (
    <ThemeProvider pref={settings.theme}>
      <Body show={show} />
    </ThemeProvider>
  );
}

function Body({ show }: { show: boolean }) {
  const { c, dark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Backdrop />
      {show ? (
        <UiStateProvider>
          <ToastProvider>
            <SheetProvider>
              <Slot />
              <FxLayer />
            </SheetProvider>
          </ToastProvider>
        </UiStateProvider>
      ) : (
        <Skeleton />
      )}
    </View>
  );
}

/**
 * Calm placeholder while fonts and local data load (also what the static web export renders).
 * Theme-neutral on purpose: the page background comes from the body CSS, which follows the system theme.
 */
function Skeleton() {
  return (
    <View accessibilityLabel={i18n.t('app.loading')} style={{ flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center', padding: 16, paddingTop: 96, gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ height: 90, borderRadius: 16, backgroundColor: 'rgba(128,120,128,0.14)' }} />
      ))}
    </View>
  );
}
