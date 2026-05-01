import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { AnalysisSummary } from '@shapeai/shared'

interface Props {
  item: AnalysisSummary
  isLatest: boolean
  onPress?: () => void
  isSelectMode?: boolean
  isSelected?: boolean
  onSelect?: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function AnalysisHistoryItem({ item, isLatest, onPress, isSelectMode, isSelected, onSelect }: Props) {
  const isClickable = !isSelectMode && item.status === 'completed' && !!onPress
  const isSelectable = isSelectMode && item.status === 'completed'

  const handlePress = () => {
    if (isSelectable && onSelect) onSelect()
    else if (isClickable && onPress) onPress()
  }

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={handlePress}
      activeOpacity={isClickable || isSelectable ? 0.7 : 1}
      testID={`history-item-${item.id}`}
    >
      <View style={styles.header}>
        <View style={styles.dateRow}>
          {isSelectMode && item.status === 'completed' && (
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} testID={`checkbox-${item.id}`}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          )}
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.badges}>
          {isLatest && item.status === 'completed' && (
            <View style={styles.badgeLatest}>
              <Text style={styles.badgeLatestText}>Atual</Text>
            </View>
          )}
          {item.status !== 'completed' && (
            <View style={[styles.badgeStatus, item.status === 'processing' ? styles.badgeProcessing : styles.badgeFailed]}>
              <Text style={styles.badgeStatusText}>
                {item.status === 'processing' ? 'Processando' : 'Falhou'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {item.top_development_areas.length > 0 ? (
        <View style={styles.areas}>
          {item.top_development_areas.map((area, i) => (
            <Text key={i} style={styles.area} numberOfLines={1}>• {area}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noAreas}>
          {item.status === 'completed' ? 'Relatório disponível' : 'Aguardando análise...'}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  containerSelected: { borderColor: '#4CAF50', backgroundColor: '#0D1F0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 15, fontWeight: '600', color: '#fff' },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: 6 },
  badgeLatest: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeLatestText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  badgeStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeProcessing: { backgroundColor: '#FF9800' },
  badgeFailed: { backgroundColor: '#F44336' },
  badgeStatusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  areas: { gap: 4 },
  area: { fontSize: 13, color: '#aaa', lineHeight: 18 },
  noAreas: { fontSize: 13, color: '#555', fontStyle: 'italic' },
})
