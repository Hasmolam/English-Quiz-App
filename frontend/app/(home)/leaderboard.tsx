import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface LeaderboardUser {
    id: number;
    username?: string;
    email?: string;
    total_score: number;
    level?: string;
}

export default function LeaderboardScreen() {
    const router = useRouter();
    const { fetchWithAuth } = useApi();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const data = await fetchWithAuth('/quiz/leaderboard');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, index }: { item: LeaderboardUser, index: number }) => {
        let medalColor = 'text-gray-600';
        let bgColor = 'bg-white';

        if (index === 0) {
            medalColor = 'text-yellow-500';
            bgColor = 'bg-yellow-50 border-yellow-200';
        } else if (index === 1) {
            medalColor = 'text-gray-400';
            bgColor = 'bg-gray-50 border-gray-200';
        } else if (index === 2) {
            medalColor = 'text-orange-500';
            bgColor = 'bg-orange-50 border-orange-200';
        }

        const displayName = item.username || item.email?.split('@')[0] || `User ${item.id}`;

        return (
            <View className={`flex-row items-center p-4 mb-3 rounded-2xl border ${bgColor} shadow-sm`}>
                <View className="w-8 items-center justify-center mr-3">
                    {index < 3 ? (
                        <Ionicons name="trophy" size={24} className={medalColor} style={{ color: index === 0 ? '#eab308' : index === 1 ? '#9ca3af' : '#f97316' }} />
                    ) : (
                        <Text className="text-gray-500 font-bold text-lg">#{index + 1}</Text>
                    )}
                </View>

                <View className="flex-1">
                    <Text className="font-bold text-gray-800 text-lg">{displayName}</Text>
                    <Text className="text-xs text-gray-500">{item.level || 'A1'}</Text>
                </View>

                <View className="bg-purple-100 px-3 py-1 rounded-full">
                    <Text className="text-purple-700 font-bold">{item.total_score} Pts</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-2 pb-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900">Liderlik Tablosu</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#9333ea" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <View className="items-center mt-10">
                            <Text className="text-gray-500">Henüz veri yok.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
