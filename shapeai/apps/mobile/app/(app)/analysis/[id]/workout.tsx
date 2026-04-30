import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import {
  type WorkoutWeek,
  type PrimaryGoal,
  GOAL_LABEL,
  getScoreColor,
  calculateOverallScore,
} from '@shapeai/shared'
import { getAnalysisResult } from '../../../../src/services/analysis.service'
import { getUserProfile } from '../../../../src/services/profile.service'
import WorkoutDayCard from '../../../../src/components/workout/WorkoutDayCard'

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [weeks, setWeeks] = useState<WorkoutWeek[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [goal, setGoal] = useState<PrimaryGoal | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([getAnalysisResult(id), getUserProfile()])
      .then(([analysis, profile]) => {
        setWeeks(analysis.workout_plan.weeks as unknown as WorkoutWeek[])
        setOverallScore(calculateOverallScore(analysis.scores))
        setGoal(profile.primary_goal)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (error || weeks.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Plano de treino não disponível.'}</Text>
      </View>
    )
  }

  const scoreColor = getScoreColor(overallScore)
  const goalLabel = goal ? GOAL_LABEL[goal] : '—'
  const currentWeek = weeks[selectedWeek]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.goalLabel}>{goalLabel}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
            <Text style={styles.scoreBadgeText}>{overallScore}</Text>
          </View>
          <TouchableOpacity
            style={styles.newAnalysisBtn}
            onPress={() => router.push('/(app)/camera')}
          >
            <Text style={styles.newAnalysisBtnText}>Nova Análise</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Week tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {weeks.map((week, index) => (
          <TouchableOpacity
            key={week.week_number}
            style={[styles.tab, selectedWeek === index && styles.tabActive]}
            onPress={() => setSelectedWeek(index)}
          >
            <Text style={[styles.tabText, selectedWeek === index && styles.tabTextActive]}>
              Semana {week.week_number}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Days list */}
      <ScrollView style={styles.daysScroll} contentContainerStyle={styles.daysContent}>
        {currentWeek?.sessions.map((session, index) => (
          <WorkoutDayCard key={index} session={session} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#888', fontSize: 16, textAlign: 'center', padding: 24 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: { flex: 1, gap: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  goalLabel: { color: '#fff', fontSize: 20, fontWeight: '700' },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreBadgeText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  newAnalysisBtn: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  newAnalysisBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  tabsScroll: { maxHeight: 52 },
  tabsContent: { paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  tabActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  daysScroll: { flex: 1 },
  daysContent: { padding: 20, paddingBottom: 40 },
})
