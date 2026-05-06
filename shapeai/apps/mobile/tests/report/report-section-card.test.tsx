import React from 'react'
import { render } from '@testing-library/react-native'
import ReportSectionCard from '../../src/components/report/ReportSectionCard'

const baseSection = {
  muscle_group: 'shoulders',
  title: 'Ombros fortes',
  description: 'Bom desenvolvimento de deltóide.',
  score: 80,
}

describe('ReportSectionCard', () => {
  it('renderiza title e description', () => {
    const { getByText } = render(<ReportSectionCard section={baseSection} variant="highlight" />)
    expect(getByText('Ombros fortes')).toBeTruthy()
    expect(getByText('Bom desenvolvimento de deltóide.')).toBeTruthy()
  })

  it('renderiza score badge', () => {
    const { getByText } = render(<ReportSectionCard section={baseSection} variant="highlight" />)
    expect(getByText('80')).toBeTruthy()
  })

  it('renderiza emoji correto para shoulders', () => {
    const { getByText } = render(<ReportSectionCard section={baseSection} variant="highlight" />)
    expect(getByText('🏋️')).toBeTruthy()
  })

  it('renderiza emoji correto para core', () => {
    const { getByText } = render(
      <ReportSectionCard section={{ ...baseSection, muscle_group: 'core' }} variant="development" />
    )
    expect(getByText('🎯')).toBeTruthy()
  })

  it('usa emoji fallback para muscle_group desconhecido', () => {
    const { getByText } = render(
      <ReportSectionCard section={{ ...baseSection, muscle_group: 'unknown_group' }} variant="development" />
    )
    expect(getByText('💡')).toBeTruthy()
  })
})
