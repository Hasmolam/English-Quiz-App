// app/(home)/quiz.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Yönlendirme için

export default function QuizScreen() {
  const router = useRouter(); // Geri butonu ve yönlendirme için
  const [selectedOption, setSelectedOption] = useState<number | null>(0); 

  // Görseldeki veriler
  const questionData = {
    current: 1,
    total: 2,
    timer: "2:00",
    text: "If a car travels 200 miles in 4 hours, what is its average speed?",
    options: ["40 Mph", "50 Mph", "60 Mph", "70 Mph"]
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-5 pt-4">
        
        {/* --- HEADER --- */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            onPress={() => router.back()} // Geri butonu çalışsın
            className="p-2 bg-gray-100 rounded-full"
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          
          <Text className="text-lg font-bold text-black">Aptitude Test</Text>
          
          <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
            <Ionicons name="time-outline" size={16} color="black" />
            <Text className="ml-1 font-semibold">{questionData.timer}</Text>
          </View>
        </View>

        {/* --- PROGRESS BAR --- */}
        {/* Gri arka plan */}
        <View className="h-1.5 w-full bg-gray-200 rounded-full mb-6 relative">
             {/* Mor ilerleme çubuğu (Yarı yarıya dolu) */}
            <View className="absolute left-0 top-0 h-full w-1/2 bg-purple-600 rounded-full" />
        </View>

        {/* --- SORU ALANI --- */}
        <Text className="text-purple-600 font-bold mb-2 text-sm uppercase">
          Question {questionData.current} of {questionData.total}
        </Text>
        
        <Text className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
          {questionData.text}
        </Text>

        {/* --- SEÇENEKLER --- */}
        <View className="space-y-4">
          {questionData.options.map((option, index) => {
            const isSelected = selectedOption === index;
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedOption(index)}
                activeOpacity={0.8}
                // Seçiliyse mor border ve mor arka plan, değilse beyaz
                className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                  isSelected 
                    ? "bg-purple-50 border-purple-600" 
                    : "bg-white border-transparent"
                }`}
                style={!isSelected ? { borderColor: '#f3f4f6', borderWidth: 1 } : {}}
              >
                <Text className={`text-lg font-medium ${isSelected ? "text-black" : "text-gray-500"}`}>
                  {option}
                </Text>

                {/* Radio Button Yuvarlağı */}
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border ${
                    isSelected 
                      ? "bg-purple-600 border-purple-600" 
                      : "bg-white border-gray-300"
                  }`}
                >
                  {isSelected && <Feather name="check" size={14} color="white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>

      {/* --- ALT BUTON (NEXT) --- */}
      <View className="p-5 pb-8">
        <TouchableOpacity 
          className="w-full bg-black py-4 rounded-2xl flex-row justify-center items-center shadow-lg"
          onPress={() => console.log("Sonraki soruya geç")}
        >
          <Text className="text-white text-lg font-bold mr-2">Next</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}