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
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { getAnalysisResult, AnalysisResult, BodyComposition, MuscleScores } from '../../../../src/services/analysis.service'

const FAT_CATEGORY_LABEL: Record<string, string> = {
  muito_magro: 'Muito magro',
  magro: 'Magro',
  atlético: 'Atlético',
  médio: 'Médio',
  acima_media: 'Acima da média',
  obeso: 'Obeso',
}

const BODY_TYPE_LABEL: Record<string, string> = {
  ectomorfo: 'Ectomorfo',
  mesomorfo: 'Mesomorfo',
  endomorfo: 'Endomorfo',
  misto: 'Misto',
}

const MUSCLE_LABEL: Record<string, string> = {
  quadriceps: 'Quadríceps',
  glutes: 'Glúteos',
  calves: 'Panturrilhas',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  chest: 'Peitoral',
  abs: 'Abdômen',
  traps: 'Trapézio',
  lats: 'Dorsal',
}

const MUSCLE_ORDER = ['chest', 'lats', 'traps', 'biceps', 'triceps', 'abs', 'quadriceps', 'glutes', 'calves']

function ScoreGauge({ score }: { score: number }) {
  const radius = 60
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius
  const filled = circumference * (score / 100)
  const size = (radius + strokeWidth) * 2

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#1E1E1E" strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="#4CAF50" strokeWidth={strokeWidth} fill="none"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        rotation="-90" origin={`${size / 2}, ${size / 2}`}
      />
      <SvgText x={size / 2} y={size / 2} textAnchor="middle" dy="0.3em"
        fontSize="28" fontWeight="bold" fill="#fff">
        {score}
      </SvgText>
    </Svg>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#4CAF50' : score >= 50 ? '#FF9800' : '#F44336'
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${score}%` as `${number}%`, backgroundColor: color }]} />
    </View>
  )
}

function BodyCompositionCard({ data }: { data: BodyComposition }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Composição Corporal</Text>
      <View style={s.grid}>
        <View style={s.stat}>
          <Text style={s.statValue}>{data.body_fat_estimate.toFixed(1)}%</Text>
          <Text style={s.statLabel}>Gordura corporal</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{FAT_CATEGORY_LABEL[data.body_fat_category] ?? data.body_fat_category}</Text>
          <Text style={s.statLabel}>Categoria</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{BODY_TYPE_LABEL[data.body_type] ?? data.body_type}</Text>
          <Text style={s.statLabel}>Biotipo</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{data.fat_distribution}</Text>
          <Text style={s.statLabel}>Distribuição</Text>
        </View>
      </View>
      {data.fat_areas.length > 0 && (
        <View style={s.tagRow}>
          <Text style={s.tagLabel}>Gordura localizada:</Text>
          <View style={s.tags}>
            {data.fat_areas.map((area) => (
              <View key={area} style={s.tag}>
                <Text style={s.tagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

function SummaryCard({ title, text, variant }: { title: string; text: string; variant: 'strength' | 'weakness' }) {
  const isStrength = variant === 'strength'
  return (
    <View style={[s.summaryCard, isStrength ? s.summaryStrength : s.summaryWeakness]}>
      <Text style={[s.summaryTitle, isStrength ? s.summaryTitleGreen : s.summaryTitleOrange]}>
        {title}
      </Text>
      <Text style={s.summaryText}>{text}</Text>
    </View>
  )
}

function MuscleBreakdown({ muscle_scores }: { muscle_scores: MuscleScores }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Pontuação Muscular</Text>
      {MUSCLE_ORDER.map((key) => {
        const data = muscle_scores[key as keyof MuscleScores]
        if (!data) return null
        return (
          <View key={key} style={s.muscleRow}>
            <View style={s.muscleHeader}>
              <Text style={s.muscleName}>{MUSCLE_LABEL[key] ?? key}</Text>
              <Text style={s.muscleScore}>{data.score}</Text>
            </View>
            <ScoreBar score={data.score} />
            {data.note ? <Text style={s.muscleNote}>{data.note}</Text> : null}
          </View>
        )
      })}
    </View>
  )
}

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getAnalysisResult(id)
      .then(setAnalysis)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
  }

  if (error || !analysis) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error ?? 'Relatório não encontrado.'}</Text>
      </View>
    )
  }

  const bc = analysis.body_composition
  const overallScore = bc?.overall_score ?? analysis.scores.overall_score ?? 50

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(app)/history')}>
          <Text style={s.historyBtn}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {/* Score geral */}
      <View style={s.gaugeContainer}>
        <Text style={s.gaugeLabel}>Score Geral</Text>
        <ScoreGauge score={overallScore} />
        {bc?.overall_assessment ? (
          <Text style={s.assessment}>"{bc.overall_assessment}"</Text>
        ) : null}
      </View>

      {/* Composição corporal */}
      {bc && <BodyCompositionCard data={bc} />}

      {/* Resumos de pontos fortes/fracos */}
      {bc?.strengths_summary ? (
        <SummaryCard title="Pontos Fortes" text={bc.strengths_summary} variant="strength" />
      ) : null}
      {bc?.weaknesses_summary ? (
        <SummaryCard title="Pontos a Desenvolver" text={bc.weaknesses_summary} variant="weakness" />
      ) : null}

      {/* Breakdown muscular */}
      {bc?.muscle_scores && <MuscleBreakdown muscle_scores={bc.muscle_scores} />}

      {/* Plano de treino */}
      <TouchableOpacity
        style={s.workoutButton}
        onPress={() => router.push(`/(app)/analysis/${id}/workout`)}
      >
        <Text style={s.workoutButtonText}>Ver Plano de Treino →</Text>
      </TouchableOpacity>

      <View style={s.disclaimer}>
        <Text style={s.disclaimerText}>
          Este relatório é uma estimativa baseada em análise visual e não substitui avaliação
          profissional de saúde. Consulte um profissional antes de iniciar qualquer programa de exercícios.
        </Text>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 24, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#888', fontSize: 16, textAlign: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  historyBtn: { color: '#888', fontSize: 14 },

  gaugeContainer: { alignItems: 'center', marginBottom: 28, gap: 12 },
  gaugeLabel: { color: '#888', fontSize: 14 },
  assessment: { color: '#4CAF50', fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 8, lineHeight: 20 },

  card: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
    gap: 14,
  },
  cardTitle: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { flex: 1, minWidth: '45%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2, textAlign: 'center' },
  statLabel: { color: '#666', fontSize: 11, textAlign: 'center' },

  tagRow: { gap: 6 },
  tagLabel: { color: '#888', fontSize: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#2A1A00', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FF9800' },
  tagText: { color: '#FF9800', fontSize: 12 },

  summaryCard: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1 },
  summaryStrength: { backgroundColor: '#0D1F0D', borderColor: '#2E5E2E' },
  summaryWeakness: { backgroundColor: '#1F1200', borderColor: '#5E3A00' },
  summaryTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryTitleGreen: { color: '#4CAF50' },
  summaryTitleOrange: { color: '#FF9800' },
  summaryText: { color: '#ccc', fontSize: 14, lineHeight: 21 },

  muscleRow: { gap: 6, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  muscleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muscleName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  muscleScore: { color: '#4CAF50', fontSize: 15, fontWeight: '700' },
  muscleNote: { color: '#666', fontSize: 12, lineHeight: 18 },

  workoutButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  workoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  disclaimer: { backgroundColor: '#111', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#1E1E1E' },
  disclaimerText: { color: '#555', fontSize: 12, lineHeight: 18, textAlign: 'center' },
})

const barStyles = StyleSheet.create({
  track: { height: 6, backgroundColor: '#1E1E1E', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
})
