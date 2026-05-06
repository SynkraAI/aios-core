import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'test-id' }),
}))

jest.mock('../../src/services/analysis.service', () => ({
  getAnalysisResult: jest.fn(),
}))

jest.mock('react-native-svg', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Circle: () => null,
    Text: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  }
})

import ReportScreen from '../../app/(app)/analysis/[id]/report'
import { getAnalysisResult } from '../../src/services/analysis.service'
import { router } from 'expo-router'

const mockGet = getAnalysisResult as jest.Mock
const mockPush = router.push as jest.Mock

const mockAnalysis = {
  id: 'test-id',
  status: 'completed',
  scores: {
    shoulders: 80,
    chest: 70,
    back: 75,
    arms: 65,
    core: 60,
    legs: 72,
    posture_score: 68,
    symmetry_score: 78,
  },
  report: {
    highlights: [
      { muscle_group: 'shoulders', title: 'Ombros fortes', description: 'Bom desenvolvimento.', score: 80 },
    ],
    development_areas: [
      { muscle_group: 'core', title: 'Core fraco', description: 'Precisa melhorar.', score: 40 },
    ],
  },
  workout_plan: { weeks: [] },
  completed_at: new Date().toISOString(),
}

describe('ReportScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renderiza seção Destaques com dados mockados', async () => {
    mockGet.mockResolvedValue(mockAnalysis)
    const { findByText } = render(<ReportScreen />)
    await findByText('Ombros fortes')
  })

  it('renderiza seção Áreas de Desenvolvimento', async () => {
    mockGet.mockResolvedValue(mockAnalysis)
    const { findByText } = render(<ReportScreen />)
    await findByText('Core fraco')
  })

  it('disclaimer sempre visível independente do conteúdo', async () => {
    mockGet.mockResolvedValue(mockAnalysis)
    const { findByText } = render(<ReportScreen />)
    await findByText(/estimativa baseada em análise visual/i)
  })

  it('botão "Ver Plano de Treino" navega para rota correta', async () => {
    mockGet.mockResolvedValue(mockAnalysis)
    const { findByText } = render(<ReportScreen />)
    const btn = await findByText(/Ver Plano de Treino/i)
    fireEvent.press(btn)
    expect(mockPush).toHaveBeenCalledWith('/(app)/analysis/test-id/workout')
  })

  it('exibe erro quando getAnalysisResult rejeita', async () => {
    mockGet.mockRejectedValue(new Error('Análise não encontrada'))
    const { findByText } = render(<ReportScreen />)
    await findByText('Análise não encontrada')
  })
})
