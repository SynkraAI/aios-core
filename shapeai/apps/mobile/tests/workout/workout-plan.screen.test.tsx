import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'analysis-1' }),
}))

jest.mock('../../src/services/analysis.service', () => ({
  getAnalysisResult: jest.fn(),
}))

jest.mock('../../src/services/profile.service', () => ({
  getUserProfile: jest.fn(),
}))

import WorkoutScreen from '../../app/(app)/analysis/[id]/workout'
import { getAnalysisResult } from '../../src/services/analysis.service'
import { getUserProfile } from '../../src/services/profile.service'
import { router } from 'expo-router'

const mockGetAnalysis = getAnalysisResult as jest.Mock
const mockGetProfile = getUserProfile as jest.Mock
const mockPush = router.push as jest.Mock
const mockBack = router.back as jest.Mock

const mockWeeks = [
  {
    week_number: 1,
    sessions: [
      {
        day: 'Segunda-feira',
        focus: 'Peito e Ombros',
        exercises: [
          { name: 'Supino Reto', muscle_group: 'chest', sets: 4, reps: '8-12', rest_seconds: 90, note: null },
        ],
      },
    ],
  },
  {
    week_number: 2,
    sessions: [
      {
        day: 'Terça-feira',
        focus: 'Costas e Bíceps',
        exercises: [
          { name: 'Puxada Alta', muscle_group: 'back', sets: 4, reps: '10-12', rest_seconds: 60, note: null },
        ],
      },
    ],
  },
]

const mockAnalysis = {
  id: 'analysis-1',
  status: 'completed',
  scores: {
    shoulders: 80, chest: 70, back: 75, arms: 65,
    core: 60, legs: 72, posture_score: 68, symmetry_score: 78,
  },
  workout_plan: { weeks: mockWeeks },
  completed_at: new Date().toISOString(),
}

const mockProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  height_cm: 175,
  weight_kg: 80,
  biological_sex: 'M',
  primary_goal: 'hypertrophy',
  updated_at: new Date().toISOString(),
}

describe('WorkoutScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renderiza tabs de semana com dados mockados', async () => {
    mockGetAnalysis.mockResolvedValue(mockAnalysis)
    mockGetProfile.mockResolvedValue(mockProfile)
    const { findByText } = render(<WorkoutScreen />)
    await findByText('Semana 1')
    await findByText('Semana 2')
  })

  it('renderiza exercícios da semana selecionada', async () => {
    mockGetAnalysis.mockResolvedValue(mockAnalysis)
    mockGetProfile.mockResolvedValue(mockProfile)
    const { findByText } = render(<WorkoutScreen />)
    await findByText('Supino Reto')
    await findByText('Peito e Ombros')
  })

  it('exibe label do objetivo em PT-BR no header', async () => {
    mockGetAnalysis.mockResolvedValue(mockAnalysis)
    mockGetProfile.mockResolvedValue(mockProfile)
    const { findByText } = render(<WorkoutScreen />)
    await findByText('Hipertrofia')
  })

  it('troca semana ao pressionar tab', async () => {
    mockGetAnalysis.mockResolvedValue(mockAnalysis)
    mockGetProfile.mockResolvedValue(mockProfile)
    const { findByText } = render(<WorkoutScreen />)
    const tab2 = await findByText('Semana 2')
    fireEvent.press(tab2)
    await findByText('Costas e Bíceps')
  })

  it('botão "Nova Análise" navega para CameraScreen', async () => {
    mockGetAnalysis.mockResolvedValue(mockAnalysis)
    mockGetProfile.mockResolvedValue(mockProfile)
    const { findByText } = render(<WorkoutScreen />)
    const btn = await findByText('Nova Análise')
    fireEvent.press(btn)
    expect(mockPush).toHaveBeenCalledWith('/(app)/camera')
  })

  it('botão "Voltar" chama router.back()', async () => {
    mockGetAnalysis.mockResolvedValue(mockAnalysis)
    mockGetProfile.mockResolvedValue(mockProfile)
    const { findByText } = render(<WorkoutScreen />)
    const btn = await findByText('← Voltar')
    fireEvent.press(btn)
    expect(mockBack).toHaveBeenCalled()
  })

  it('exibe erro quando getAnalysisResult rejeita', async () => {
    mockGetAnalysis.mockRejectedValue(new Error('Falha ao carregar análise'))
    mockGetProfile.mockResolvedValue(mockProfile)
    const { findByText } = render(<WorkoutScreen />)
    await findByText('Falha ao carregar análise')
  })
})
