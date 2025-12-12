import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store'; // Bunu eklemeyi unutma
import "@/global.css"

// 1. Token Cache Mekanizması (Oturumun kapanmaması için gerekli)
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// 🛑 GEÇİCİ AYAR: Auth işlemini devre dışı bırakmak için true kalsın
const BYPASS_AUTH = true;

// Bu anahtarı .env dosyan okunamıyorsa tırnak içine direkt yapıştır: "pk_test_..."
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// Splash Screen'in otomatik gizlenmesini engelle
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Eğer Bypass açıksa, yönlendirme kontrolü yapma
    if (BYPASS_AUTH) return;

    const inTabsGroup = segments[0] === '(auth)';
    
    if (isSignedIn && inTabsGroup) {
      router.replace('/'); // Giriş yaptıysa ana sayfaya at
    } else if (!isSignedIn && !inTabsGroup) {
      router.replace('/sign-in'); // Giriş yapmadıysa login sayfasına at
    }
  }, [isSignedIn, isLoaded]);

  return <Slot />;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. .env dosyasını kontrol et veya anahtarı koda yapıştır.');
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}