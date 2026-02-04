import type { Meta, StoryObj } from '@storybook/react'
import { textStyles } from './typography'

const meta = {
  title: 'Design Tokens/Typography',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta

/**
 * Typography Specimen Component
 */
const TypeSpecimen = ({ name, style }: { name: string; style: any }) => (
  <div
    style={{
      marginBottom: '24px',
      paddingBottom: '24px',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
    }}
  >
    <div
      style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#666',
        marginBottom: '8px',
        fontFamily: 'monospace',
      }}
    >
      {name}
    </div>
    <div style={style}>The quick brown fox jumps over the lazy dog</div>
    <div
      style={{
        fontSize: '11px',
        color: '#999',
        marginTop: '8px',
        fontFamily: 'monospace',
      }}
    >
      {style.fontSize} / {style.lineHeight} / {style.fontWeight} /{' '}
      {style.letterSpacing}
    </div>
  </div>
)

/**
 * iOS Text Styles
 * SF Pro Dynamic Type text styles
 */
export const TextStyles: StoryObj = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '32px' }}>iOS Text Styles</h2>
      <p style={{ marginBottom: '32px', color: '#666' }}>
        Based on SF Pro font family and Apple's Dynamic Type system
      </p>

      {Object.entries(textStyles).map(([name, style]) => (
        <TypeSpecimen key={name} name={name} style={style} />
      ))}
    </div>
  ),
}

/**
 * iOS Hierarchy Example
 * Shows how text styles work together in a typical iOS screen
 */
export const TypographyHierarchy: StoryObj = {
  render: () => (
    <div style={{ maxWidth: '428px', padding: '20px' }}>
      <div style={{ ...textStyles.largeTitle, marginBottom: '24px' }}>
        Large Title
      </div>
      <div style={{ ...textStyles.title1, marginBottom: '16px' }}>
        Title 1 Heading
      </div>
      <div style={{ ...textStyles.body, marginBottom: '16px' }}>
        This is body text. It's the default text style for most content in iOS applications.
        The body style uses SF Pro Text at 17 points with comfortable line height.
      </div>
      <div style={{ ...textStyles.headline, marginBottom: '12px' }}>
        Headline for Emphasis
      </div>
      <div style={{ ...textStyles.subheadline, marginBottom: '16px' }}>
        Subheadline for secondary information and labels
      </div>
      <div style={{ ...textStyles.callout, marginBottom: '16px' }}>
        Callout text is used for highlighted information or action items that need
        attention but aren't quite headlines.
      </div>
      <div style={{ ...textStyles.footnote, marginBottom: '12px' }}>
        Footnote text is used for captions, timestamps, and secondary information that
        doesn't need as much prominence.
      </div>
      <div style={{ ...textStyles.caption1 }}>Caption 1 for small labels</div>
      <div style={{ ...textStyles.caption2 }}>Caption 2 for metadata</div>
    </div>
  ),
}
