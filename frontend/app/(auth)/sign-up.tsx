import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onSignUpPress = async () => {
    if (!username.trim() || !emailAddress.trim() || !password) {
      setErrorMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage("Kullanıcı adı en az 3 karakter olmalıdır.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signUp(username, emailAddress, password);
      router.replace("/");
    } catch (err: any) {
      setErrorMessage(err.message || "Kayıt işlemi başarısız. Bilgilerinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Quiz dünyasına katılmak için bilgilerinizi girin.</Text>
      </View>

      <View style={styles.form}>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Kullanıcı Adı Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            placeholder="kullanici_adi"
            placeholderTextColor="#666"
            onChangeText={(text) => {
              setUsername(text);
              if (errorMessage) setErrorMessage(null);
            }}
            style={styles.input}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Adresi</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={emailAddress}
            placeholder="ornek@email.com"
            placeholderTextColor="#666"
            onChangeText={(text) => {
              setEmailAddress(text);
              if (errorMessage) setErrorMessage(null);
            }}
            style={styles.input}
          />
        </View>

        {/* Şifre Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            value={password}
            placeholder="En az 6 karakter..."
            placeholderTextColor="#666"
            secureTextEntry={true}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage(null);
            }}
            style={styles.input}
          />
        </View>

        {/* Kayıt Butonu */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={onSignUpPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.link}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#3b1212',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#ccc',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1F1F1F',
    color: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#6C47FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#888',
  },
  link: {
    color: '#6C47FF',
    fontWeight: 'bold',
  },
});