// app/(home)/quiz.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '@/utils/api';

// Backend response types
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

interface QuizStartResponse {
  user_id: number;
  clerk_id: string;
  questions: QuizQuestion[];
}

interface AnswerResponse {
  correct: boolean;
  correct_answer: string;
  user_score: number;
  message: string;
}

interface WrongAnswer {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const { fetchWithAuth } = useApi();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Scores
  const [totalScore, setTotalScore] = useState(0); // Global score from DB
  const [sessionScore, setSessionScore] = useState(0); // Score earned in this session

  const [submitting, setSubmitting] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data: QuizStartResponse = await fetchWithAuth('/quiz/start');
      setQuestions(data.questions);
    } catch (error) {
      Alert.alert("Hata", "Quiz yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert("Uyarı", "Lütfen bir seçenek işaretleyin.");
      return;
    }

    setSubmitting(true);
    try {
      const response: AnswerResponse = await fetchWithAuth('/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({
          word_id: currentQuestion.id,
          answer: selectedOption
        })
      });

      setTotalScore(response.user_score);

      if (response.correct) {
        setSessionScore(prev => prev + 10);
      } else {
        // Track wrong answer
        setWrongAnswers(prev => [...prev, {
          question: currentQuestion.question,
          yourAnswer: selectedOption,
          correctAnswer: response.correct_answer
        }]);
      }

      setAnswerResult(response);

    } catch (error) {
      Alert.alert("Hata", "Cevap gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswerResult(null);
    } else {
      // Quiz finished - Update Daily Stats
      try {
        await fetchWithAuth('/quiz/finish', { method: 'POST' });
      } catch (e) {
        console.log("Finish update failed", e);
      }
      setIsFinished(true);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#9333ea" />
        <Text className="mt-4 text-gray-500">Sorular Hazırlanıyor...</Text>
      </View>
    );
  }

  // --- RESULTS SCREEN ---
  if (isFinished) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6 pt-10">
          <View className="items-center mb-8">
            <Ionicons name="trophy" size={80} color="#fbbf24" />
            <Text className="text-3xl font-bold mt-4 text-center">Tebrikler!</Text>
            <Text className="text-gray-500 text-lg mt-2 text-center">Quiz tamamlandı.</Text>
          </View>

          {/* Scores Card */}
          <View className="flex-row justify-between mb-8 space-x-4">
            <View className="flex-1 bg-purple-50 p-5 rounded-2xl items-center border border-purple-100">
              <Text className="text-gray-500 text-xs uppercase font-bold tracking-wider text-center">Bu Test Puanı</Text>
              <Text className="text-4xl font-extrabold text-purple-600 mt-2">+{sessionScore}</Text>
            </View>
            <View className="flex-1 bg-gray-50 p-5 rounded-2xl items-center border border-gray-200">
              <Text className="text-gray-500 text-xs uppercase font-bold tracking-wider text-center">Genel Puan</Text>
              <Text className="text-4xl font-extrabold text-gray-800 mt-2">{totalScore}</Text>
            </View>
          </View>

          {/* Wrong Answers List */}
          {wrongAnswers.length > 0 && (
            <View className="mb-10">
              <Text className="text-xl font-bold mb-4 text-red-600">Yanlış Cevaplar</Text>
              {wrongAnswers.map((item, index) => (
                <View key={index} className="bg-red-50 p-4 rounded-xl mb-3 border border-red-100">
                  <Text className="font-bold text-gray-800 text-lg mb-2">{item.question}</Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="close-circle" size={16} color="#dc2626" />
                    <Text className="text-red-700 ml-2 font-medium">Sizin Cevabınız: {item.yourAnswer}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text className="text-green-700 ml-2 font-medium">Doğru Cevap: {item.correctAnswer}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {wrongAnswers.length === 0 && (
            <View className="mb-10 bg-green-50 p-6 rounded-2xl items-center border border-green-100">
              <Ionicons name="star" size={40} color="#16a34a" />
              <Text className="text-green-800 font-bold text-lg mt-2">Mükemmel!</Text>
              <Text className="text-green-600 text-center">Hiç yanlışın yok. Harika gidiyorsun.</Text>
            </View>
          )}

        </ScrollView>

        <View className="p-6 pt-2 border-t border-gray-100 bg-white">
          <TouchableOpacity
            className="w-full bg-black py-4 rounded-2xl flex-row justify-center items-center shadow-lg"
            onPress={() => router.back()}
          >
            <Ionicons name="home" size={20} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text>Soru bulunamadı.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-5 pt-4">

        {/* --- HEADER --- */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-black">English Quiz</Text>

          <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
            <Text className="font-semibold text-purple-600">Oturum: {sessionScore}</Text>
          </View>
        </View>

        {/* --- PROGRESS BAR --- */}
        <View className="h-1.5 w-full bg-gray-200 rounded-full mb-6 relative">
          <View
            className="absolute left-0 top-0 h-full bg-purple-600 rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </View>

        {/* --- SORU ALANI --- */}
        <Text className="text-purple-600 font-bold mb-2 text-sm uppercase">
          Question {currentQuestionIndex + 1} / {questions.length}
        </Text>

        <Text className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
          What is the English for "{currentQuestion.question}"?
        </Text>

        {/* --- SEÇENEKLER --- */}
        <View className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrectAnswer = answerResult && option === answerResult.correct_answer;
            const isWrongSelection = answerResult && isSelected && !answerResult.correct;

            let borderColor = 'border-transparent';
            let bgColor = 'bg-white';
            let textColor = 'text-gray-500';

            if (answerResult) {
              if (isCorrectAnswer) {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50';
                textColor = 'text-green-700';
              } else if (isWrongSelection) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-50';
                textColor = 'text-red-700';
              }
            } else if (isSelected) {
              borderColor = 'border-purple-600';
              bgColor = 'bg-purple-50';
              textColor = 'text-black';
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => !answerResult && setSelectedOption(option)}
                activeOpacity={answerResult ? 1 : 0.8}
                disabled={!!answerResult}
                className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${borderColor} ${bgColor}`}
                style={borderColor === 'border-transparent' ? { borderColor: '#f3f4f6', borderWidth: 1 } : {}}
              >
                <Text className={`text-lg font-medium ${textColor}`}>
                  {option}
                </Text>

                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border ${isSelected || isCorrectAnswer
                    ? (isCorrectAnswer ? "bg-green-500 border-green-500" : (isWrongSelection ? "bg-red-500 border-red-500" : "bg-purple-600 border-purple-600"))
                    : "bg-white border-gray-300"
                    }`}
                >
                  {(isSelected || isCorrectAnswer) && (
                    <Feather
                      name={isCorrectAnswer ? "check" : (isWrongSelection ? "x" : "check")}
                      size={14}
                      color="white"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- FEEDBACK ALANI (Eğer cevaplandıysa) --- */}
        {answerResult && (
          <View className={`mt-6 p-4 rounded-xl ${answerResult.correct ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-center font-bold text-lg ${answerResult.correct ? 'text-green-800' : 'text-red-800'}`}>
              {answerResult.correct ? "Doğru Cevap! 🎉" : "Yanlış Cevap 😔"}
            </Text>
            <Text className="text-center text-gray-700 mt-1">
              {answerResult.message}
            </Text>
          </View>
        )}

      </View>

      {/* --- ALT BUTON (SUBMIT / NEXT) --- */}
      <View className="p-5 pb-8">
        <TouchableOpacity
          className={`w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg ${submitting ? 'bg-gray-400' : 'bg-black'}`}
          onPress={answerResult ? handleNextQuestion : handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white text-lg font-bold mr-2">
                {answerResult ? (currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results") : "Submit Answer"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}