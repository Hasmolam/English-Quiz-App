import * as React from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; // İkonlar için

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // GİRİŞ YAPMA FONKSİYONU
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      
      // Giriş başarılıysa oturumu aktif et ve ana sayfaya yönlendir
      await setActive({ session: completeSignIn.createdSessionId });
      router.replace("/");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      // Hata mesajını kullanıcıya göster (Örn: Şifre yanlış)
      alert(err.errors[0]?.longMessage || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>Tekrar Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>Devam etmek için giriş yapın.</Text>
      </View>

      <View style={styles.form}>
        {/* Sosyal Butonlar (Görseldir) */}
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
          <Text style={styles.label}>Email Adresi veya Kullanıcı Adı</Text>
          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email..."
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
        
        <TouchableOpacity onPress={() => alert("Şifre sıfırlama henüz aktif değil.")} style={{alignSelf: 'flex-end', marginBottom: 20}}>
            <Text style={{color: '#6C47FF', fontSize: 12}}>Şifremi Unuttum?</Text>
        </TouchableOpacity>

        {/* Giriş Yap Butonu */}
        <TouchableOpacity style={styles.button} onPress={onSignInPress} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text style={styles.link}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// --- STYLES (Sign Up ile aynı tutarlılıkta) ---
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