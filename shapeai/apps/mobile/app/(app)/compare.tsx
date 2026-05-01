import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { apiGet, apiPost } from '../../src/services/api.client'
import { useSubscription } from '../../src/hooks/useSubscription'
import type { AnalysisSummary } from '@shapeai/shared'

interface CompareResult {
  summary: string
  improvements: string[]
  needs_attention: string[]
}

const MUSCLE_LABELS: Record<string, string> = {
  shoulders: 'Ombros',
  chest: 'Peito',
  back: 'Costas',
  arms: 'Braços',
  core: 'Core',
  legs: 'Pernas',
  posture_score: 'Postura',
  symmetry_score: 'Simetria',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function calcOverall(scores: Record<string, number>): number {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}

export default function CompareScreen() {
  const { id1, id2 } = useLocalSearchParams<{ id1: string; id2: string }>()
  const { subscription } = useSubscription()
  const isPro = subscription?.status === 'pro'
  const compareRef = useRef<View>(null)

  const [a1, setA1] = useState<AnalysisSummary | null>(null)
  const [a2, setA2] = useState<AnalysisSummary | null>(null)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    Promise.all([
      apiGet<AnalysisSummary>(`/analyses/${id1}`),
      apiGet<AnalysisSummary>(`/analyses/${id2}`),
    ])
      .then(([r1, r2]) => {
        setA1(r1)
        setA2(r2)
        setIsLoading(false)
        setIsComparing(true)
        return apiPost<CompareResult>('/analyses/compare', { analysis_id_1: id1, analysis_id_2: id2 })
      })
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setIsComparing(false))
  }, [id1, id2])

  const handleShare = async () => {
    if (!isPro) {
      Alert.alert('Recurso Pro', 'O compartilhamento é exclusivo para assinantes Pro.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Assinar Pro', onPress: () => router.push('/(app)/paywall') },
      ])
      return
    }
    Alert.alert('Compartilhar', 'Funcionalidade disponível após instalação de react-native-view-shot.')
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    )
  }

  const scores1 = (a1 as unknown as { scores: Record<string, number> })?.scores ?? {}
  const scores2 = (a2 as unknown as { scores: Record<string, number> })?.scores ?? {}
  const overall1 = calcOverall(scores1)
  const overall2 = calcOverall(scores2)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="btn-voltar">
          <Text style={styles.back}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} testID="btn-compartilhar">
          <Text style={[styles.shareBtn, !isPro && styles.shareBtnFree]}>
            {isPro ? 'Compartilhar' : 'Compartilhar 🔒'}
          </Text>
        </TouchableOpacity>
      </View>

      <View ref={compareRef} testID="compare-container">
        {/* Datas e scores gerais */}
        <View style={styles.datesRow}>
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>{a1 ? formatDate(a1.created_at) : '—'}</Text>
            <View style={[styles.overallBadge, { backgroundColor: overall1 >= 70 ? '#4CAF50' : overall1 >= 50 ? '#FF9800' : '#F44336' }]}>
              <Text style={styles.overallText}>{overall1}</Text>
            </View>
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>{a2 ? formatDate(a2.created_at) : '—'}</Text>
            <View style={[styles.overallBadge, { backgroundColor: overall2 >= 70 ? '#4CAF50' : overall2 >= 50 ? '#FF9800' : '#F44336' }]}>
              <Text style={styles.overallText}>{overall2}</Text>
            </View>
          </View>
        </View>

        {/* Barras por grupo muscular */}
        <Text style={styles.sectionTitle}>Comparativo por grupo muscular</Text>
        {Object.keys(MUSCLE_LABELS).map((key) => {
          const v1 = scores1[key] ?? 0
          const v2 = scores2[key] ?? 0
          const delta = v2 - v1
          return (
            <View key={key} style={styles.muscleRow} testID={`muscle-row-${key}`}>
              <Text style={styles.muscleLabel}>{MUSCLE_LABELS[key]}</Text>
              <View style={styles.barsContainer}>
                <View style={[styles.bar, styles.bar1, { width: `${v1}%` }]} />
                <View style={[styles.bar, styles.bar2, { width: `${v2}%` }]} />
              </View>
              <Text style={[styles.delta, delta > 0 ? styles.deltaPositive : delta < 0 ? styles.deltaNegative : styles.deltaNeutral]}
                testID={`delta-${key}`}>
                {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '—'}
              </Text>
            </View>
          )
        })}

        {/* O que mudou */}
        <Text style={styles.sectionTitle}>O que mudou</Text>
        {isComparing ? (
          <ActivityIndicator color="#4CAF50" style={styles.loadingCompare} />
        ) : result ? (
          <View style={styles.resultCard}>
            <Text style={styles.summary} testID="compare-summary">{result.summary}</Text>
            {result.improvements.length > 0 && (
              <>
                <Text style={styles.resultLabel}>Evoluções</Text>
                {result.improvements.map((item, i) => (
                  <Text key={i} style={styles.resultItem}>✅ {item}</Text>
                ))}
              </>
            )}
            {result.needs_attention.length > 0 && (
              <>
                <Text style={styles.resultLabel}>Ainda em foco</Text>
                {result.needs_attention.map((item, i) => (
                  <Text key={i} style={styles.resultItem}>🎯 {item}</Text>
                ))}
              </>
            )}
          </View>
        ) : (
          <Text style={styles.noResult}>Não foi possível gerar o comparativo. Tente novamente.</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  centered: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { color: '#4CAF50', fontSize: 16 },
  shareBtn: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
  shareBtnFree: { color: '#888' },
  datesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  dateCard: { alignItems: 'center', gap: 8, flex: 1 },
  dateLabel: { color: '#aaa', fontSize: 13 },
  overallBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  overallText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  vs: { color: '#555', fontSize: 16, fontWeight: '700', marginHorizontal: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 16, marginTop: 8 },
  muscleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  muscleLabel: { color: '#aaa', fontSize: 12, width: 64 },
  barsContainer: { flex: 1, gap: 3 },
  bar: { height: 6, borderRadius: 3, minWidth: 4 },
  bar1: { backgroundColor: '#555' },
  bar2: { backgroundColor: '#4CAF50' },
  delta: { width: 52, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  deltaPositive: { color: '#4CAF50' },
  deltaNegative: { color: '#F44336' },
  deltaNeutral: { color: '#555' },
  loadingCompare: { marginTop: 16 },
  resultCard: { backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#222' },
  summary: { color: '#ddd', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  resultLabel: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  resultItem: { color: '#ccc', fontSize: 14, lineHeight: 22, marginBottom: 4 },
  noResult: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 16 },
})
