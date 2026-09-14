import * as React from 'react';
import {
  Text,
  TextInput,
  Pressable,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { TactileButton } from '@/components/TactileButton';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onSignInPress = async () => {
    if (!identifier.trim() || !password) {
      setErrorMessage('Lütfen e-posta veya kullanıcı adı ile şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signIn(identifier.trim(), password);
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Mascot / Logo */}
          <View style={styles.brandHeader}>
            <View style={styles.mascotBadge}>
              <Ionicons name="game-controller" size={38} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>English Quest</Text>
            <Text style={styles.brandSubtitle}>Yarış, öğren ve liderlik kürsüsüne çık!</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Giriş Yap</Text>
            <Text style={styles.cardSubtitle}>
              İlerlemeni kaybetmemek için hesabına giriş yap.
            </Text>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Identifier Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta veya Kullanıcı Adı</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  value={identifier}
                  placeholder="ornek@email.com veya kullanici"
                  placeholderTextColor="#94A3B8"
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  textContentType="password"
                  value={password}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={({ pressed }) => [styles.eyeButton, { opacity: pressed ? 0.6 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>

            {/* 3D Tactile Login Button */}
            <View style={styles.actionContainer}>
              <TactileButton
                title="Giriş Yap"
                variant="primary"
                size="lg"
                icon={<Ionicons name="log-in" size={20} color="#FFFFFF" />}
                loading={isLoading}
                onPress={onSignInPress}
              />
            </View>
          </View>

          {/* Bottom Switch to Sign Up */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerPrompt}>Henüz bir hesabın yok mu?</Text>
            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
              style={styles.signUpLinkButton}
              accessibilityRole="button"
              accessibilityLabel="Hesap oluşturma sayfasına git"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.signUpLinkText}>Hemen Kayıt Ol</Text>
                <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  mascotBadge: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#4338CA',
    borderBottomWidth: 6,
    borderBottomColor: '#3730A3',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeButton: {
    padding: 6,
  },
  actionContainer: {
    marginTop: 8,
  },
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerPrompt: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  signUpLinkButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signUpLinkText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4F46E5',
  },
});