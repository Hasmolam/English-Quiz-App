import * as React from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; // İkonlar için

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // 1. ADIM: KAYIT OLMA FONKSİYONU
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      alert("Hata: " + err.errors[0].message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ADIM: DOĞRULAMA FONKSİYONU
  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.replace("/");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      alert("Kod hatalı veya süre doldu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Başlamak için bilgilerinizi girin.</Text>
      </View>

      {!pendingVerification ? (
        // --- FORM EKRANI ---
        <View style={styles.form}>
          {/* Sosyal Butonlar (Görseldir, işlev eklemek gerekir) */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={20} color="white" />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="white" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>veya</Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Adresi</Text>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="ornek@email.com"
              placeholderTextColor="#666"
              onChangeText={setEmailAddress}
              style={styles.input}
            />
          </View>

          {/* Şifre Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              value={password}
              placeholder="Şifreniz..."
              placeholderTextColor="#666"
              secureTextEntry={true}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          {/* Kayıt Butonu */}
          <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Devam Et</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text style={styles.link}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // --- DOĞRULAMA KODU EKRANI ---
        <View style={styles.form}>
          <Text style={styles.title}>Emailini Kontrol Et</Text>
          <Text style={styles.subtitle}>{emailAddress} adresine gelen kodu gir.</Text>
          
          <TextInput
            value={code}
            placeholder="123456"
            placeholderTextColor="#666"
            onChangeText={setCode}
            style={[styles.input, { textAlign: 'center', letterSpacing: 5, fontSize: 24 }]}
          />
          
          <TouchableOpacity style={styles.button} onPress={onPressVerify} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Hesabı Doğrula</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// --- STYLES (TASARIM KODLARI) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111', // Koyu Arka Plan
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
  },
  form: {
    width: '100%',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  socialText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '500',
  },
  divider: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerText: {
    color: '#555',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#ccc',
    marginBottom: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1F1F1F',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6C47FF', // Clerk Moru
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#888',
  },
  link: {
    color: '#6C47FF',
    fontWeight: 'bold',
  },
});