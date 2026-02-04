import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
    },
    gap: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ children, color = '#00BFA5' }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      background: color,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '6px',
      fontWeight: 600,
      minWidth: '100px',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

export const VerticalStack: Story = {
  args: {
    direction: 'vertical',
    gap: 4,
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
};

export const HorizontalStack: Story = {
  args: {
    direction: 'horizontal',
    gap: 4,
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    direction: 'vertical',
    gap: 2,
    children: (
      <>
        <Box>Gap 2 (8px)</Box>
        <Box>Tightly Spaced</Box>
        <Box>Items</Box>
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    direction: 'vertical',
    gap: 8,
    children: (
      <>
        <Box>Gap 8 (32px)</Box>
        <Box>Widely Spaced</Box>
        <Box>Items</Box>
      </>
    ),
  },
};

export const AlignCenter: Story = {
  args: {
    direction: 'vertical',
    align: 'center',
    gap: 4,
    children: (
      <>
        <Box>Centered</Box>
        <Box>All items centered</Box>
        <Box>In container</Box>
      </>
    ),
  },
};

export const JustifySpaceBetween: Story = {
  args: {
    direction: 'horizontal',
    justify: 'space-between',
    gap: 4,
    style: { width: '100%' },
    children: (
      <>
        <Box>Left</Box>
        <Box>Center</Box>
        <Box>Right</Box>
      </>
    ),
  },
};

export const HorizontalCentered: Story = {
  args: {
    direction: 'horizontal',
    align: 'center',
    justify: 'center',
    gap: 4,
    style: { minHeight: '200px', background: '#F9FAFB', borderRadius: '8px' },
    children: (
      <>
        <Box>Fully</Box>
        <Box>Centered</Box>
        <Box>Content</Box>
      </>
    ),
  },
};

export const WithWrap: Story = {
  args: {
    direction: 'horizontal',
    wrap: true,
    gap: 4,
    style: { maxWidth: '400px' },
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
        <Box>Item 4</Box>
        <Box>Item 5</Box>
        <Box>Item 6</Box>
      </>
    ),
  },
};

export const MixedContent: Story = {
  render: () => (
    <Stack direction="vertical" gap={6}>
      <h2 style={{ margin: 0 }}>Card Layout Example</h2>
      <Stack direction="horizontal" gap={4} wrap>
        <Box color="#00BFA5">Card 1</Box>
        <Box color="#FFB800">Card 2</Box>
        <Box color="#00BFA5">Card 3</Box>
      </Stack>
      <Stack direction="horizontal" gap={2} align="center">
        <Box color="#374151">Button</Box>
        <Box color="#6B7280">Cancel</Box>
      </Stack>
    </Stack>
  ),
};
