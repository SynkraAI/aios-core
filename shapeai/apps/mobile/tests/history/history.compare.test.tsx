import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = require('react')
    useEffect(cb, [])
  },
}))

jest.mock('../../src/services/analysis.service', () => ({
  listAnalyses: jest.fn(),
}))

import HistoryScreen from '../../app/(app)/history'
import { router } from 'expo-router'
import { listAnalyses } from '../../src/services/analysis.service'

const mockList = listAnalyses as jest.Mock
const mockPush = router.push as jest.Mock

const analysis1 = { id: 'a1', status: 'completed', scores: null, created_at: '2026-03-01T10:00:00Z', completed_at: '2026-03-01T10:05:00Z', top_development_areas: [] }
const analysis2 = { id: 'a2', status: 'completed', scores: null, created_at: '2026-04-01T10:00:00Z', completed_at: '2026-04-01T10:05:00Z', top_development_areas: [] }

describe('HistoryScreen — modo de seleção e comparativo', () => {
  beforeEach(() => jest.clearAllMocks())

  it('exibe botão "Comparar" no header', async () => {
    mockList.mockResolvedValue({ analyses: [analysis1, analysis2], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => expect(getByTestId('btn-comparar')).toBeTruthy())
  })

  it('ativa modo de seleção ao tocar "Comparar"', async () => {
    mockList.mockResolvedValue({ analyses: [analysis1, analysis2], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => fireEvent.press(getByTestId('btn-comparar')))
    expect(getByTestId('btn-cancelar-selecao')).toBeTruthy()
    expect(getByTestId('btn-ver-comparativo')).toBeTruthy()
  })

  it('"Ver comparativo" desabilitado com 0 selecionados', async () => {
    mockList.mockResolvedValue({ analyses: [analysis1, analysis2], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => fireEvent.press(getByTestId('btn-comparar')))
    const btn = getByTestId('btn-ver-comparativo')
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy()
  })

  it('"Ver comparativo" habilitado e navega com 2 selecionados', async () => {
    mockList.mockResolvedValue({ analyses: [analysis1, analysis2], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => fireEvent.press(getByTestId('btn-comparar')))
    fireEvent.press(getByTestId('history-item-a1'))
    fireEvent.press(getByTestId('history-item-a2'))
    fireEvent.press(getByTestId('btn-ver-comparativo'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('compare'))
  })

  it('"Cancelar" fecha o modo de seleção', async () => {
    mockList.mockResolvedValue({ analyses: [analysis1], has_more: false })
    const { getByTestId, queryByTestId } = render(<HistoryScreen />)
    await waitFor(() => fireEvent.press(getByTestId('btn-comparar')))
    fireEvent.press(getByTestId('btn-cancelar-selecao'))
    expect(queryByTestId('btn-cancelar-selecao')).toBeNull()
    expect(getByTestId('btn-comparar')).toBeTruthy()
  })
})
