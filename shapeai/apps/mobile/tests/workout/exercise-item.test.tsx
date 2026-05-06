import React from 'react'
import { render } from '@testing-library/react-native'
import ExerciseItem from '../../src/components/workout/ExerciseItem'

const baseExercise = {
  name: 'Supino Reto',
  muscle_group: 'chest',
  sets: 4,
  reps: '8-12',
  rest_seconds: 90,
  note: null,
}

describe('ExerciseItem', () => {
  it('renderiza nome do exercício', () => {
    const { getByText } = render(<ExerciseItem exercise={baseExercise} />)
    expect(getByText('Supino Reto')).toBeTruthy()
  })

  it('renderiza séries e reps corretamente', () => {
    const { getByText } = render(<ExerciseItem exercise={baseExercise} />)
    expect(getByText('4 séries × 8-12 reps')).toBeTruthy()
  })

  it('formata descanso de 90s como "1min 30s"', () => {
    const { getByText } = render(<ExerciseItem exercise={baseExercise} />)
    expect(getByText('Descanso: 1min 30s')).toBeTruthy()
  })

  it('formata descanso de 60s como "1min"', () => {
    const { getByText } = render(
      <ExerciseItem exercise={{ ...baseExercise, rest_seconds: 60 }} />
    )
    expect(getByText('Descanso: 1min')).toBeTruthy()
  })

  it('formata descanso de 30s como "30s"', () => {
    const { getByText } = render(
      <ExerciseItem exercise={{ ...baseExercise, rest_seconds: 30 }} />
    )
    expect(getByText('Descanso: 30s')).toBeTruthy()
  })

  it('renderiza emoji de chest (💪)', () => {
    const { getByText } = render(<ExerciseItem exercise={baseExercise} />)
    expect(getByText('💪')).toBeTruthy()
  })

  it('renderiza emoji de legs (🦵)', () => {
    const { getByText } = render(
      <ExerciseItem exercise={{ ...baseExercise, muscle_group: 'legs' }} />
    )
    expect(getByText('🦵')).toBeTruthy()
  })

  it('usa emoji fallback (💪) para muscle_group desconhecido', () => {
    const { getByText } = render(
      <ExerciseItem exercise={{ ...baseExercise, muscle_group: 'unknown' }} />
    )
    expect(getByText('💪')).toBeTruthy()
  })

  it('renderiza nota quando presente', () => {
    const { getByText } = render(
      <ExerciseItem exercise={{ ...baseExercise, note: 'Contrair no topo' }} />
    )
    expect(getByText('Contrair no topo')).toBeTruthy()
  })

  it('não renderiza nota quando null', () => {
    const { queryByText } = render(<ExerciseItem exercise={baseExercise} />)
    expect(queryByText('Contrair no topo')).toBeNull()
  })
})
