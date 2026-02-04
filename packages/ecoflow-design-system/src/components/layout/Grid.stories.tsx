import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'number',
    },
    gap: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const GridItem = ({ num }: { num: number }) => (
  <div
    style={{
      background: '#00BFA5',
      color: 'white',
      padding: '32px',
      borderRadius: '6px',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      minHeight: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {num}
  </div>
);

export const FourColumns: Story = {
  args: {
    columns: 4,
    gap: 6,
    children: (
      <>
        <GridItem num={1} />
        <GridItem num={2} />
        <GridItem num={3} />
        <GridItem num={4} />
        <GridItem num={5} />
        <GridItem num={6} />
        <GridItem num={7} />
        <GridItem num={8} />
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    gap: 6,
    children: (
      <>
        <GridItem num={1} />
        <GridItem num={2} />
        <GridItem num={3} />
        <GridItem num={4} />
        <GridItem num={5} />
        <GridItem num={6} />
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    columns: 2,
    gap: 6,
    children: (
      <>
        <GridItem num={1} />
        <GridItem num={2} />
        <GridItem num={3} />
        <GridItem num={4} />
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    columns: 4,
    gap: 2,
    children: (
      <>
        <GridItem num={1} />
        <GridItem num={2} />
        <GridItem num={3} />
        <GridItem num={4} />
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    columns: 3,
    gap: 12,
    children: (
      <>
        <GridItem num={1} />
        <GridItem num={2} />
        <GridItem num={3} />
      </>
    ),
  },
};

export const ResponsiveColumns: Story = {
  args: {
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    gap: 6,
    children: (
      <>
        <GridItem num={1} />
        <GridItem num={2} />
        <GridItem num={3} />
        <GridItem num={4} />
        <GridItem num={5} />
        <GridItem num={6} />
        <GridItem num={7} />
        <GridItem num={8} />
      </>
    ),
  },
};

export const CardGrid: Story = {
  render: () => (
    <Grid columns={3} gap={6}>
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <div
          key={num}
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#00BFA5' }}>Card {num}</h3>
          <p style={{ margin: 0, color: '#6B7280' }}>
            This is a card with some example content to demonstrate the grid layout.
          </p>
        </div>
      ))}
    </Grid>
  ),
};

export const MixedContentGrid: Story = {
  render: () => (
    <Grid columns={4} gap={4}>
      <div style={{ gridColumn: 'span 2' }}>
        <GridItem num={1} />
        <p style={{ textAlign: 'center', marginTop: '8px', color: '#6B7280' }}>Spans 2 columns</p>
      </div>
      <GridItem num={2} />
      <GridItem num={3} />
      <GridItem num={4} />
      <GridItem num={5} />
      <div style={{ gridColumn: 'span 2' }}>
        <GridItem num={6} />
        <p style={{ textAlign: 'center', marginTop: '8px', color: '#6B7280' }}>Spans 2 columns</p>
      </div>
    </Grid>
  ),
};
