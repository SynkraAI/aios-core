import { View, Text, StyleSheet } from 'react-native'
import { Exercise, MUSCLE_EMOJI, formatRest } from '@shapeai/shared'

interface ExerciseItemProps {
  exercise: Exercise
}

export default function ExerciseItem({ exercise }: ExerciseItemProps) {
  const emoji = MUSCLE_EMOJI[exercise.muscle_group] ?? '💪'
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.name}>{exercise.name}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detail}>{exercise.sets} séries × {exercise.reps} reps</Text>
        <Text style={styles.detail}>Descanso: {formatRest(exercise.rest_seconds)}</Text>
      </View>
      {exercise.note && <Text style={styles.note}>{exercise.note}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  emoji: { fontSize: 20, marginRight: 8 },
  name: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  details: { flexDirection: 'row', gap: 16 },
  detail: { color: '#888', fontSize: 13 },
  note: { color: '#666', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
})
