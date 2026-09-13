import { Link, useFocusEffect } from 'expo-router';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SignOutButton } from '@/components/SignOutButton';
import { Ionicons } from '@expo/vector-icons';
import "@/global.css";
import React, { useState, useCallback } from 'react';
import { useApi } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const { user, isAuthenticated } = useAuth();
  const { fetchWithAuth } = useApi();
  const [dailyStats, setDailyStats] = useState({ completed: 0, target: 5 });

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchDailyStats();
      }
    }, [isAuthenticated])
  );

  const fetchDailyStats = async () => {
    try {
      const data = await fetchWithAuth('/quiz/daily_progress');
      if (data) setDailyStats(data);
    } catch (e) {
      console.log("Stats fetch error", e);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="bg-purple-700 pt-16 pb-10 px-6 rounded-b-[40px] shadow-xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-purple-200 font-medium text-lg">Hoşgeldin,</Text>
            <Text className="text-white font-bold text-3xl">
              {user?.username || "Misafir"} 👋
            </Text>
          </View>
          <View className="bg-purple-600 p-3 rounded-full border border-purple-500">
            <Ionicons name="person" size={24} color="white" />
          </View>
        </View>

        <View className="mt-8 bg-purple-800 p-4 rounded-2xl flex-row items-center justify-between border border-purple-600">
          <View>
            <Text className="text-purple-300 text-xs uppercase font-bold tracking-wider">Günlük Hedef</Text>
            <View className="flex-row items-baseline mt-1">
              <Text className="text-white font-extrabold text-2xl">{dailyStats.completed}/{dailyStats.target}</Text>
              <Text className="text-purple-300 ml-1 text-sm">Quiz</Text>
            </View>
          </View>
          <Ionicons name="flame" size={32} color={dailyStats.completed >= dailyStats.target ? "#22c55e" : "#fbbf24"} />
        </View>
      </View>

      <View className="px-6 mt-8 pb-10">
        <Text className="text-gray-800 font-bold text-xl mb-4">Neler Yapalım?</Text>

        <View className="flex-row flex-wrap justify-between">
          <Link href="/quiz" asChild>
            <TouchableOpacity className="w-[48%] bg-purple-50 p-5 rounded-3xl mb-4 border border-purple-100 items-center shadow-sm active:scale-95 transform transition">
              <View className="bg-purple-100 p-4 rounded-full mb-3">
                <Ionicons name="play" size={28} color="#9333ea" />
              </View>
              <Text className="text-gray-900 font-bold text-lg text-center">Quiz Başlat</Text>
              <Text className="text-gray-500 text-xs text-center mt-1">Kelime bilgini sına</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/leaderboard" asChild>
            <TouchableOpacity className="w-[48%] bg-orange-50 p-5 rounded-3xl mb-4 border border-orange-100 items-center shadow-sm active:scale-95 transform transition">
              <View className="bg-orange-100 p-4 rounded-full mb-3">
                <Ionicons name="trophy" size={28} color="#ea580c" />
              </View>
              <Text className="text-gray-900 font-bold text-lg text-center">Liderlik</Text>
              <Text className="text-gray-500 text-xs text-center mt-1">Sıralamanı gör</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/stats" asChild>
            <TouchableOpacity className="w-full bg-blue-50 p-5 rounded-3xl mb-4 border border-blue-100 flex-row items-center shadow-sm active:scale-95 transform transition">
              <View className="bg-blue-100 p-4 rounded-full mr-4">
                <Ionicons name="stats-chart" size={28} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg">İstatistikler</Text>
                <Text className="text-gray-500 text-xs">Gelişimini takip et</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="mt-6">
          {isAuthenticated ? (
            <View className="bg-gray-100 rounded-2xl p-4 flex-row justify-between items-center">
              <View>
                <Text className="text-gray-800 font-semibold">{user?.username}</Text>
                <Text className="text-gray-500 text-xs">{user?.email}</Text>
              </View>
              <SignOutButton />
            </View>
          ) : (
            <View className="bg-gray-100 rounded-2xl p-6 items-center">
              <Text className="text-gray-800 font-bold text-lg mb-2">Hesabın var mı?</Text>
              <Text className="text-gray-500 text-center mb-6">İlerlemeni kaydetmek için giriş yapmalısın.</Text>

              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity className="bg-black w-full py-4 rounded-xl items-center mb-3">
                  <Text className="text-white font-bold">Giriş Yap</Text>
                </TouchableOpacity>
              </Link>

              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity className="bg-white border border-gray-300 w-full py-4 rounded-xl items-center">
                  <Text className="text-gray-900 font-bold">Kayıt Ol</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

      </View>
    </ScrollView>
  );
}
