import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
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
    <TouchableOpacity
      onPress={handleSignOut}
      className="bg-red-50 px-4 py-2 rounded-xl border border-red-200 active:opacity-75"
    >
      <Text className="text-red-600 font-semibold text-sm">Çıkış Yap</Text>
    </TouchableOpacity>
  );
};