import React from 'react';
import { Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export const SignOutButton = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Oturumu kapat ve çıkış yap"
      onPress={handleSignOut}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
      })}
      className="bg-red-50 px-4 py-2 rounded-xl border border-red-200"
    >
      <Text className="text-red-600 font-semibold text-sm">Çıkış Yap</Text>
    </Pressable>
  );
};