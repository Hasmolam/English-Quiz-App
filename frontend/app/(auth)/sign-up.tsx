import * as React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { TactileButton } from '@/components/TactileButton';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [username, setUsername] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onSignUpPress = async () => {
    if (!username.trim() || !emailAddress.trim() || !password) {
      setErrorMessage('Lütfen tüm alanları eksiksiz doldurun.');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signUp(username.trim(), emailAddress.trim(), password);
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Kayıt işlemi başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              <Ionicons name="rocket" size={38} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Maceraya Katıl!</Text>
            <Text style={styles.brandSubtitle}>
              Profilini oluştur, İngilizce quizlerinde yarış ve XP kazan.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Hesap Oluştur</Text>
              <View style={styles.freePill}>
                <Ionicons name="gift" size={14} color="#16A34A" />
                <Text style={styles.freePillText}>Ücretsiz</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              Sadece birkaç saniyede başla ve liglere katıl!
            </Text>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  placeholder="kahraman_dilci"
                  placeholderTextColor="#94A3B8"
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Email Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta Adresi</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={emailAddress}
                  placeholder="ornek@email.com"
                  placeholderTextColor="#94A3B8"
                  onChangeText={(text) => {
                    setEmailAddress(text);
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
                  value={password}
                  placeholder="En az 6 karakter..."
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 3D Tactile Sign-Up Button */}
            <View style={styles.actionContainer}>
              <TactileButton
                title="Maceraya Başla"
                variant="success"
                size="lg"
                icon={<Ionicons name="rocket" size={20} color="#FFFFFF" />}
                loading={isLoading}
                onPress={onSignUpPress}
              />
            </View>
          </View>

          {/* Bottom Switch to Sign In */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerPrompt}>Zaten bir hesabın var mı?</Text>
            <Pressable
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.signInLinkButton}
              accessibilityRole="button"
              accessibilityLabel="Giriş yapma sayfasına git"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.signInLinkText}>Giriş Yap</Text>
                <Ionicons name="log-in" size={16} color="#16A34A" />
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
    marginBottom: 24,
  },
  mascotBadge: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#16A34A',
    borderBottomWidth: 6,
    borderBottomColor: '#15803D',
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
    paddingHorizontal: 12,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  freePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  freePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
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
  signInLinkButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signInLinkText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#22C55E',
  },
});