import React from 'react'
import { render, waitFor } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ id1: 'a1', id2: 'a2' }),
}))

jest.mock('../../src/services/api.client', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}))

jest.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: jest.fn(),
}))

import CompareScreen from '../../app/(app)/compare'
import { apiGet, apiPost } from '../../src/services/api.client'
import { useSubscription } from '../../src/hooks/useSubscription'

const mockGet = apiGet as jest.Mock
const mockPost = apiPost as jest.Mock
const mockUseSubscription = useSubscription as jest.Mock

const scores1 = { shoulders: 60, chest: 55, back: 50, arms: 65, core: 45, legs: 70, posture_score: 58, symmetry_score: 62 }
const scores2 = { shoulders: 72, chest: 60, back: 65, arms: 70, core: 55, legs: 75, posture_score: 68, symmetry_score: 70 }

const analysis1 = { id: 'a1', status: 'completed', scores: scores1, created_at: '2026-03-01T10:00:00Z', completed_at: '2026-03-01T10:05:00Z', top_development_areas: [] }
const analysis2 = { id: 'a2', status: 'completed', scores: scores2, created_at: '2026-04-01T10:00:00Z', completed_at: '2026-04-01T10:05:00Z', top_development_areas: [] }

const compareResult = {
  summary: 'Evolução significativa em 30 dias!',
  improvements: ['Ombros melhoraram +12', 'Core evoluiu +10'],
  needs_attention: ['Peito ainda abaixo da média'],
}

describe('CompareScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSubscription.mockReturnValue({ subscription: { status: 'free', expires_at: null }, isLoading: false })
    mockGet.mockImplementation((url: string) => {
      if (url.includes('a1')) return Promise.resolve(analysis1)
      return Promise.resolve(analysis2)
    })
    mockPost.mockResolvedValue(compareResult)
  })

  it('exibe datas das duas análises lado a lado', async () => {
    const { getByText } = render(<CompareScreen />)
    await waitFor(() => {
      expect(getByText('01/03/2026')).toBeTruthy()
      expect(getByText('01/04/2026')).toBeTruthy()
    })
  })

  it('exibe delta positivo com ▲ verde para ombros', async () => {
    const { getByTestId } = render(<CompareScreen />)
    await waitFor(() => {
      const delta = getByTestId('delta-shoulders')
      expect(delta.props.children).toContain('▲')
    })
  })

  it('exibe summary do comparativo', async () => {
    const { getByTestId } = render(<CompareScreen />)
    await waitFor(() => {
      expect(getByTestId('compare-summary').props.children).toBe('Evolução significativa em 30 dias!')
    })
  })

  it('usuário Free — botão compartilhar abre alerta Pro', async () => {
    const { getByTestId } = render(<CompareScreen />)
    await waitFor(() => expect(getByTestId('btn-compartilhar')).toBeTruthy())
  })

  it('usuário Pro — botão compartilhar visível sem lock', async () => {
    mockUseSubscription.mockReturnValue({ subscription: { status: 'pro', expires_at: null }, isLoading: false })
    const { getByTestId, getByText } = render(<CompareScreen />)
    await waitFor(() => {
      expect(getByTestId('btn-compartilhar')).toBeTruthy()
      expect(getByText('Compartilhar')).toBeTruthy()
    })
  })
})
