import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { listAnalyses } from '../../src/services/analysis.service'
import { AnalysisHistoryItem } from '../../src/components/history/AnalysisHistoryItem'
import type { AnalysisSummary } from '@shapeai/shared'
import { useFocusEffect } from 'expo-router'

export default function HistoryScreen() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const load = useCallback(async (resetPage = false) => {
    const targetPage = resetPage ? 1 : page
    try {
      const data = await listAnalyses(targetPage)
      if (resetPage) {
        setAnalyses(data.analyses)
        setPage(1)
      } else {
        setAnalyses((prev) => [...prev, ...data.analyses])
      }
      setHasMore(data.has_more)
    } catch {
      // mantém estado anterior em caso de erro
    }
  }, [page])

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true)
      load(true).finally(() => setIsLoading(false))
    }, [])
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await load(true)
    setIsRefreshing(false)
  }

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    try {
      const data = await listAnalyses(nextPage)
      setAnalyses((prev) => [...prev, ...data.analyses])
      setHasMore(data.has_more)
    } catch {
      setPage(page)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const toggleSelectMode = () => {
    setIsSelectMode(true)
    setSelectedIds([])
  }

  const cancelSelectMode = () => {
    setIsSelectMode(false)
    setSelectedIds([])
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleCompare = () => {
    if (selectedIds.length !== 2) return
    router.push(`/(app)/compare?id1=${selectedIds[0]}&id2=${selectedIds[1]}` as never)
  }

  const latestCompletedId = analyses.find((a) => a.status === 'completed')?.id

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    )
  }

  if (analyses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>Você ainda não fez nenhuma análise</Text>
        <Text style={styles.emptySubtitle}>Capture suas fotos para começar a acompanhar sua evolução.</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => router.push('/(app)/camera')} testID="btn-comecar-agora">
          <Text style={styles.startButtonText}>Começar agora</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        {isSelectMode ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.compareButton, selectedIds.length !== 2 && styles.compareButtonDisabled]}
              onPress={handleCompare}
              disabled={selectedIds.length !== 2}
              testID="btn-ver-comparativo"
            >
              <Text style={styles.compareButtonText}>Ver comparativo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelSelectMode} testID="btn-cancelar-selecao">
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={toggleSelectMode} testID="btn-comparar">
            <Text style={styles.compareLink}>Comparar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnalysisHistoryItem
            item={item}
            isLatest={item.id === latestCompletedId}
            isSelectMode={isSelectMode}
            isSelected={selectedIds.includes(item.id)}
            onSelect={() => toggleSelect(item.id)}
            onPress={
              item.status === 'completed'
                ? () => router.push(`/(app)/analysis/${item.id}/report` as never)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={isLoadingMore} testID="btn-carregar-mais">
              {isLoadingMore ? (
                <ActivityIndicator color="#4CAF50" />
              ) : (
                <Text style={styles.loadMoreText}>Carregar mais</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  centered: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compareLink: { color: '#4CAF50', fontSize: 15, fontWeight: '600' },
  compareButton: { backgroundColor: '#4CAF50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  compareButtonDisabled: { backgroundColor: '#1A3A1A', opacity: 0.5 },
  compareButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cancelText: { color: '#888', fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
  startButton: { backgroundColor: '#4CAF50', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadMoreButton: { alignItems: 'center', paddingVertical: 20 },
  loadMoreText: { color: '#4CAF50', fontSize: 15, fontWeight: '600' },
})
