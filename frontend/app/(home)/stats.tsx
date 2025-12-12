import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface UserStats {
    total_score: number;
    level: string;
    rank: number;
    total_players: number;
}

export default function StatsScreen() {
    const router = useRouter();
    const { fetchWithAuth } = useApi();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            const data = await fetchWithAuth('/quiz/stats');
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-2 pb-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900">İstatistikler</Text>
            </View>

            <ScrollView
                className="flex-1 bg-gray-50 p-5"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Main Stats Card */}
                <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-lg">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-blue-100 font-medium text-lg">Toplam Puan</Text>
                        <Ionicons name="star" size={24} color="#fcd34d" />
                    </View>
                    <Text className="text-white font-extrabold text-5xl mb-2">{stats?.total_score}</Text>
                    <Text className="text-blue-200">Harika gidiyorsun!</Text>
                </View>

                {/* Grid Stats */}
                <View className="flex-row flex-wrap justify-between">
                    {/* Level Card */}
                    <View className="w-[48%] bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm">
                        <View className="bg-purple-100 w-12 h-12 rounded-2xl items-center justify-center mb-3">
                            <Ionicons name="school" size={24} color="#9333ea" />
                        </View>
                        <Text className="text-gray-500 font-bold text-xs uppercase mb-1">Seviye</Text>
                        <Text className="text-gray-900 font-bold text-2xl">{stats?.level}</Text>
                    </View>

                    {/* Rank Card */}
                    <View className="w-[48%] bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm">
                        <View className="bg-orange-100 w-12 h-12 rounded-2xl items-center justify-center mb-3">
                            <Ionicons name="podium" size={24} color="#ea580c" />
                        </View>
                        <Text className="text-gray-500 font-bold text-xs uppercase mb-1">Sıralama</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-gray-900 font-bold text-2xl">#{stats?.rank}</Text>
                            <Text className="text-gray-400 text-sm ml-1">/ {stats?.total_players}</Text>
                        </View>
                    </View>
                </View>

                {/* Progress Card (Example) */}
                <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="bg-green-100 p-2 rounded-xl mr-3">
                                <Ionicons name="trending-up" size={20} color="#16a34a" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">Başarı Oranı</Text>
                        </View>
                        <Text className="text-green-600 font-bold text-lg">%85</Text>
                    </View>

                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View className="h-full bg-green-500 w-[85%] rounded-full" />
                    </View>
                    <Text className="text-gray-400 text-xs mt-3 text-center">Son 10 oyundaki performansın</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
