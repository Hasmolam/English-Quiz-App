import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { ProgressBar } from '@/components/ProgressBar';
import { TactileButton } from '@/components/TactileButton';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

interface QuizStartResponse {
  user_id: number;
  questions: QuizQuestion[];
}

interface AnswerResponse {
  correct: boolean;
  correct_answer: string;
  user_score: number;
  user_level?: string;
  message: string;
}

interface WrongAnswer {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizScreen() {
  const router = useRouter();
  const { fetchWithAuth } = useApi();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [totalScore, setTotalScore] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [lives, setLives] = useState(3);

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
      Alert.alert('Hata', 'Quiz yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (option: string) => {
    if (!answerResult && !submitting) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert('Uyarı', 'Lütfen bir seçenek işaretleyin.');
      return;
    }

    setSubmitting(true);
    try {
      const response: AnswerResponse = await fetchWithAuth('/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({
          word_id: currentQuestion.id,
          answer: selectedOption,
        }),
      });

      setTotalScore(response.user_score);
      if (user) {
        updateUser({
          ...user,
          total_score: response.user_score,
          level: response.user_level || user.level,
        });
      }

      if (response.correct) {
        setSessionScore((prev) => prev + 10);
        setComboCount((prev) => prev + 1);
      } else {
        setComboCount(0);
        setLives((prev) => Math.max(0, prev - 1));
        setWrongAnswers((prev) => [
          ...prev,
          {
            question: currentQuestion.question,
            yourAnswer: selectedOption,
            correctAnswer: response.correct_answer,
          },
        ]);
      }

      setAnswerResult(response);
    } catch (error) {
      Alert.alert('Hata', 'Cevap gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerResult(null);
    } else {
      try {
        await fetchWithAuth('/quiz/finish', { method: 'POST' });
      } catch (e) {
        console.log('Finish update failed', e);
      }
      setIsFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswerResult(null);
    setSessionScore(0);
    setComboCount(0);
    setLives(3);
    setWrongAnswers([]);
    setIsFinished(false);
    loadQuiz();
  };

  // 1. LOADING SCREEN
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingTitle}>Sorular Hazırlanıyor...</Text>
          <Text style={styles.loadingSubtitle}>Kelimeler karıştırılıyor 🎲</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. CELEBRATION / RESULTS SCREEN
  if (isFinished) {
    const accuracy = questions.length > 0
      ? Math.round(((questions.length - wrongAnswers.length) / questions.length) * 100)
      : 0;

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trophy & Badge */}
          <View style={styles.resultTrophyContainer}>
            <View style={styles.trophyGlow}>
              <Ionicons name="trophy" size={84} color="#F59E0B" />
            </View>
            <Text style={styles.resultTitle}>Tebrikler!</Text>
            <Text style={styles.resultSubtitle}>Quiz Başarıyla Tamamlandı</Text>
          </View>

          {/* 3 Gamified Stats Badges */}
          <View style={styles.resultStatsRow}>
            <View style={[styles.resultStatCard, { borderColor: '#FDE68A', backgroundColor: '#FEFCE8' }]}>
              <Ionicons name="flash" size={24} color="#D97706" />
              <Text style={styles.resultStatVal}>+{sessionScore}</Text>
              <Text style={styles.resultStatLbl}>XP KAZANILDI</Text>
            </View>

            <View style={[styles.resultStatCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="pie-chart" size={24} color="#16A34A" />
              <Text style={styles.resultStatVal}>%{accuracy}</Text>
              <Text style={styles.resultStatLbl}>İSABET ORANI</Text>
            </View>

            <View style={[styles.resultStatCard, { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="flame" size={24} color="#EA580C" />
              <Text style={styles.resultStatVal}>+1</Text>
              <Text style={styles.resultStatLbl}>SERİ GÜNÜ</Text>
            </View>
          </View>

          {/* Perfect Score Banner or Mistakes Review */}
          {wrongAnswers.length === 0 ? (
            <View style={styles.perfectBanner}>
              <Ionicons name="star" size={32} color="#10B981" />
              <View style={styles.perfectTextWrap}>
                <Text style={styles.perfectTitle}>Mükemmel Skor! 🌟</Text>
                <Text style={styles.perfectSubtitle}>Tüm soruları doğru bildin, harikasın!</Text>
              </View>
            </View>
          ) : (
            <View style={styles.mistakesContainer}>
              <Text style={styles.mistakesHeader}>Geliştirilecek Kelimeler ({wrongAnswers.length})</Text>
              {wrongAnswers.map((item, index) => (
                <View key={index} style={styles.mistakeCard}>
                  <Text style={styles.mistakeQuestion}>🇹🇷 {item.question}</Text>
                  <View style={styles.mistakeRow}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <Text style={styles.mistakeWrong}>Senin cevabın: {item.yourAnswer}</Text>
                  </View>
                  <View style={styles.mistakeRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.mistakeCorrect}>Doğru cevap: {item.correctAnswer}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action CTAs */}
          <View style={styles.resultActions}>
            <TactileButton
              title="Tekrar Oyna"
              icon={<Ionicons name="refresh" size={20} color="#FFFFFF" />}
              variant="success"
              size="lg"
              onPress={handleRestartQuiz}
              style={{ marginBottom: 12 }}
            />
            <TactileButton
              title="Ana Sayfaya Dön"
              icon={<Ionicons name="home" size={18} color="#0F172A" />}
              variant="outline"
              size="md"
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. GAMEPLAY SCREEN
  const progressRatio = questions.length > 0 ? (currentQuestionIndex + 1) / questions.length : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Game Bar */}
      <View style={styles.gameHeader}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Quizi Kapat"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#64748B" />
        </Pressable>

        <View style={styles.headerProgressWrapper}>
          <ProgressBar progress={progressRatio} height={12} fillColor="#10B981" />
        </View>

        {/* Lives & Combo Indicator */}
        <View style={styles.headerStatusRow}>
          {comboCount > 1 && (
            <View style={styles.comboPill}>
              <Ionicons name="flame" size={14} color="#F97316" />
              <Text style={styles.comboText}>x{comboCount}</Text>
            </View>
          )}
          <View style={styles.livesPill}>
            <Ionicons name="heart" size={16} color="#EF4444" />
            <Text style={styles.livesText}>{lives}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gameContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Counter Pill */}
        <View style={styles.counterRow}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              SORU {currentQuestionIndex + 1} / {questions.length}
            </Text>
          </View>
          <Text style={styles.xpTipText}>+10 XP</Text>
        </View>

        {/* Mascot Prompt / Speech Bubble */}
        <View style={styles.promptBubble}>
          <Text style={styles.promptHelper}>Bu kelimenin İngilizce karşılığı nedir?</Text>
          <View style={styles.wordHighlightCard}>
            <Text style={styles.promptWord}>{currentQuestion.question}</Text>
            <Ionicons name="volume-high" size={24} color="#4F46E5" />
          </View>
        </View>

        {/* Options List (3D Tactile Buttons) */}
        <View style={styles.optionsList}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = answerResult && option === answerResult.correct_answer;
            const isWrong = answerResult && isSelected && !answerResult.correct;

            let cardBg = '#FFFFFF';
            let borderColor = '#E2E8F0';
            let borderBottomColor = '#CBD5E1';
            let textColor = '#0F172A';
            let badgeBg = '#F1F5F9';
            let badgeText = '#475569';

            if (answerResult) {
              if (isCorrect) {
                cardBg = '#F0FDF4';
                borderColor = '#86EFAC';
                borderBottomColor = '#16A34A';
                textColor = '#14532D';
                badgeBg = '#16A34A';
                badgeText = '#FFFFFF';
              } else if (isWrong) {
                cardBg = '#FEF2F2';
                borderColor = '#FCA5A5';
                borderBottomColor = '#DC2626';
                textColor = '#7F1D1D';
                badgeBg = '#DC2626';
                badgeText = '#FFFFFF';
              }
            } else if (isSelected) {
              cardBg = '#EEF2FF';
              borderColor = '#C7D2FE';
              borderBottomColor = '#4F46E5';
              textColor = '#312E81';
              badgeBg = '#4F46E5';
              badgeText = '#FFFFFF';
            }

            return (
              <Pressable
                key={index}
                onPress={() => handleSelectOption(option)}
                disabled={!!answerResult}
                accessibilityRole="button"
                accessibilityLabel={`Seçenek ${OPTION_LABELS[index]}: ${option}`}
                accessibilityState={{ selected: isSelected, disabled: !!answerResult }}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    borderBottomColor: borderBottomColor,
                    cursor: Platform.OS === 'web' && !answerResult ? 'pointer' : undefined,
                  },
                ]}
              >
                <View style={[styles.optionLetterBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.optionLetterText, { color: badgeText }]}>
                    {OPTION_LABELS[index]}
                  </Text>
                </View>

                <Text style={[styles.optionText, { color: textColor }]}>
                  {option}
                </Text>

                <View style={styles.optionStatusIcon}>
                  {isCorrect && <Ionicons name="checkmark-circle" size={24} color="#16A34A" />}
                  {isWrong && <Ionicons name="close-circle" size={24} color="#DC2626" />}
                  {!answerResult && isSelected && (
                    <Ionicons name="radio-button-on" size={20} color="#4F46E5" />
                  )}
                  {!answerResult && !isSelected && (
                    <Ionicons name="radio-button-off" size={20} color="#CBD5E1" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* 4. BOTTOM INTERACTION / DUOLINGO-STYLE FEEDBACK SHEET */}
      <View
        style={[
          styles.bottomSheet,
          answerResult
            ? (answerResult.correct ? styles.bottomSheetCorrect : styles.bottomSheetWrong)
            : styles.bottomSheetDefault,
        ]}
      >
        {answerResult ? (
          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackMessageRow}>
              <View
                style={[
                  styles.feedbackIconBadge,
                  { backgroundColor: answerResult.correct ? '#16A34A' : '#DC2626' },
                ]}
              >
                <Ionicons
                  name={answerResult.correct ? 'checkmark' : 'close'}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.feedbackTextWrap}>
                <Text
                  style={[
                    styles.feedbackTitle,
                    { color: answerResult.correct ? '#14532D' : '#7F1D1D' },
                  ]}
                >
                  {answerResult.correct ? 'Harika! Doğru Bildin' : 'Doğru Cevap:'}
                </Text>
                <Text
                  style={[
                    styles.feedbackSubtitle,
                    { color: answerResult.correct ? '#166534' : '#991B1B' },
                  ]}
                >
                  {answerResult.correct ? '+10 XP Eklendi!' : answerResult.correct_answer}
                </Text>
              </View>
            </View>

            <TactileButton
              title={currentQuestionIndex < questions.length - 1 ? 'Devam Et' : 'Sonuçları Gör'}
              icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
              variant={answerResult.correct ? 'success' : 'danger'}
              size="lg"
              onPress={handleNextQuestion}
            />
          </View>
        ) : (
          <View style={styles.submitContainer}>
            <TactileButton
              title="Cevabı Kontrol Et"
              icon={
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={selectedOption ? '#FFFFFF' : '#4F46E5'}
                />
              }
              variant={selectedOption ? 'primary' : 'outline'}
              size="lg"
              disabled={!selectedOption || submitting}
              loading={submitting}
              onPress={handleSubmit}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 32,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerProgressWrapper: {
    flex: 1,
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comboPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  comboText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#EA580C',
  },
  livesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  livesText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#DC2626',
  },
  gameContent: {
    padding: 20,
    paddingBottom: 24,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  xpTipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  promptBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  promptHelper: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  wordHighlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
  },
  promptWord: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 4,
    gap: 14,
  },
  optionLetterBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  optionLetterText: {
    fontSize: 15,
    fontWeight: '900',
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  optionStatusIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    padding: 20,
    borderTopWidth: 2,
  },
  bottomSheetDefault: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
  },
  bottomSheetCorrect: {
    backgroundColor: '#DCFCE7',
    borderTopColor: '#86EFAC',
  },
  bottomSheetWrong: {
    backgroundColor: '#FEE2E2',
    borderTopColor: '#FCA5A5',
  },
  feedbackContainer: {
    gap: 16,
  },
  feedbackMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  feedbackIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTextWrap: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  feedbackSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  submitContainer: {
    width: '100%',
  },
  // Result screen styles
  resultScrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  resultTrophyContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trophyGlow: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FEF3C7',
    borderWidth: 4,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  resultStatsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  resultStatCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  resultStatVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  resultStatLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  perfectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#86EFAC',
    borderBottomColor: '#22C55E',
    padding: 16,
    borderRadius: 20,
    width: '100%',
    gap: 14,
    marginBottom: 24,
  },
  perfectTextWrap: {
    flex: 1,
  },
  perfectTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#166534',
  },
  perfectSubtitle: {
    fontSize: 13,
    color: '#15803D',
    marginTop: 2,
  },
  mistakesContainer: {
    width: '100%',
    marginBottom: 24,
  },
  mistakesHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  mistakeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#FCA5A5',
    borderBottomColor: '#EF4444',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    gap: 6,
  },
  mistakeQuestion: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mistakeWrong: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  mistakeCorrect: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  resultActions: {
    width: '100%',
    marginTop: 8,
  },
});
