import type { Meta, StoryObj } from '@storybook/react'
import { systemColors, grayColors, labelColors, backgroundColors } from './colors'

const meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta

/**
 * Color Swatch Component for Storybook
 */
const ColorSwatch = ({
  name,
  light,
  dark,
}: {
  name: string
  light: string
  dark: string
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      minWidth: '120px',
    }}
  >
    <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 500 }}>{name}</div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: light,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.1)',
        }}
        title={`Light: ${light}`}
      />
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: dark,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        title={`Dark: ${dark}`}
      />
    </div>
    <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
      <div>{light}</div>
      <div>{dark}</div>
    </div>
  </div>
)

/**
 * iOS System Colors
 * Vibrant colors for buttons, links, and UI elements
 */
export const SystemColors: StoryObj = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>iOS System Colors</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {Object.entries(systemColors).map(([name, colors]) => (
          <ColorSwatch key={name} name={name} light={colors.light} dark={colors.dark} />
        ))}
      </div>
    </div>
  ),
}

/**
 * iOS Gray Colors
 * Neutral colors for backgrounds and UI elements
 */
export const GrayColors: StoryObj = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>iOS Gray Colors</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {Object.entries(grayColors).map(([name, colors]) => (
          <ColorSwatch key={name} name={name} light={colors.light} dark={colors.dark} />
        ))}
      </div>
    </div>
  ),
}

/**
 * iOS Label Colors
 * Semantic colors for text and labels
 */
export const LabelColors: StoryObj = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>iOS Label Colors</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {Object.entries(labelColors).map(([name, colors]) => (
          <ColorSwatch key={name} name={name} light={colors.light} dark={colors.dark} />
        ))}
      </div>
    </div>
  ),
}

/**
 * iOS Background Colors
 * System-defined background colors
 */
export const BackgroundColors: StoryObj = {
  render: () => (
    <div>
      <h2 style={{ marginBottom: '24px' }}>iOS Background Colors</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {Object.entries(backgroundColors).map(([name, colors]) => (
          <ColorSwatch key={name} name={name} light={colors.light} dark={colors.dark} />
        ))}
      </div>
    </div>
  ),
}
