import { View, Text, StyleSheet } from 'react-native'

export interface ReportSection {
  muscle_group: string
  title: string
  description: string
  score: number
}

const MUSCLE_EMOJI: Record<string, string> = {
  shoulders: '🏋️',
  chest: '💪',
  back: '🔙',
  arms: '💪',
  core: '🎯',
  legs: '🦵',
  posture_score: '📐',
  symmetry_score: '⚖️',
}

interface ReportSectionCardProps {
  section: ReportSection
  variant: 'highlight' | 'development'
}

export default function ReportSectionCard({ section, variant }: ReportSectionCardProps) {
  const emoji = MUSCLE_EMOJI[section.muscle_group] ?? '💡'
  const accentColor = variant === 'highlight' ? '#4CAF50' : '#FF9800'
  const scoreBg = variant === 'highlight' ? '#1B3A1B' : '#3A2800'

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>{section.title}</Text>
          <Text style={styles.description}>{section.description}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreBg }]}>
          <Text style={[styles.scoreText, { color: accentColor }]}>{section.score}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  emoji: { fontSize: 28, width: 36 },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  description: { color: '#888', fontSize: 13, lineHeight: 18 },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
})
