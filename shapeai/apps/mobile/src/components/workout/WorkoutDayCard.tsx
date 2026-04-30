import { View, Text, StyleSheet } from 'react-native'
import type { WorkoutSession } from '@shapeai/shared'
import ExerciseItem from './ExerciseItem'

interface WorkoutDayCardProps {
  session: WorkoutSession
}

export default function WorkoutDayCard({ session }: WorkoutDayCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.day}>{session.day}</Text>
        <Text style={styles.focus}>{session.focus}</Text>
      </View>
      {session.exercises.map((exercise, index) => (
        <ExerciseItem key={index} exercise={exercise} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  header: { marginBottom: 12 },
  day: { color: '#4CAF50', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  focus: { color: '#fff', fontSize: 17, fontWeight: '700' },
})
