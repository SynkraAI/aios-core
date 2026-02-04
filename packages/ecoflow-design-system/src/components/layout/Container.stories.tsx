import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
    padding: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBox = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: '#E0F7F4',
      border: '2px dashed #00BFA5',
      padding: '32px',
      borderRadius: '8px',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

export const Default: Story = {
  args: {
    children: (
      <DemoBox>
        <strong>Default Container (xl - 1280px)</strong>
        <p>Content is centered with default padding (24px)</p>
      </DemoBox>
    ),
  },
};

export const Small: Story = {
  args: {
    maxWidth: 'sm',
    children: (
      <DemoBox>
        <strong>Small Container (sm - 640px)</strong>
        <p>Mobile landscape width</p>
      </DemoBox>
    ),
  },
};

export const Medium: Story = {
  args: {
    maxWidth: 'md',
    children: (
      <DemoBox>
        <strong>Medium Container (md - 768px)</strong>
        <p>Tablet width</p>
      </DemoBox>
    ),
  },
};

export const Large: Story = {
  args: {
    maxWidth: 'lg',
    children: (
      <DemoBox>
        <strong>Large Container (lg - 1024px)</strong>
        <p>Desktop width</p>
      </DemoBox>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    maxWidth: 'xl',
    children: (
      <DemoBox>
        <strong>Extra Large Container (xl - 1280px)</strong>
        <p>Large desktop width - MAIN TARGET</p>
      </DemoBox>
    ),
  },
};

export const ExtraExtraLarge: Story = {
  args: {
    maxWidth: '2xl',
    children: (
      <DemoBox>
        <strong>2XL Container (2xl - 1536px)</strong>
        <p>Extra large width</p>
      </DemoBox>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    maxWidth: 'full',
    children: (
      <DemoBox>
        <strong>Full Width Container</strong>
        <p>No max-width constraint (100%)</p>
      </DemoBox>
    ),
  },
};

export const CustomPadding: Story = {
  args: {
    maxWidth: 'lg',
    padding: 12,
    children: (
      <DemoBox>
        <strong>Custom Padding (48px)</strong>
        <p>Extra padding using spacing scale</p>
      </DemoBox>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    maxWidth: 'lg',
    padding: 0,
    children: (
      <DemoBox>
        <strong>No Padding</strong>
        <p>Content touches edges</p>
      </DemoBox>
    ),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ background: '#F9FAFB', padding: '40px 0' }}>
      <Container maxWidth="sm">
        <DemoBox>
          <strong>sm (640px)</strong>
        </DemoBox>
      </Container>
      <div style={{ height: '24px' }} />
      <Container maxWidth="md">
        <DemoBox>
          <strong>md (768px)</strong>
        </DemoBox>
      </Container>
      <div style={{ height: '24px' }} />
      <Container maxWidth="lg">
        <DemoBox>
          <strong>lg (1024px)</strong>
        </DemoBox>
      </Container>
      <div style={{ height: '24px' }} />
      <Container maxWidth="xl">
        <DemoBox>
          <strong>xl (1280px) - Default</strong>
        </DemoBox>
      </Container>
      <div style={{ height: '24px' }} />
      <Container maxWidth="2xl">
        <DemoBox>
          <strong>2xl (1536px)</strong>
        </DemoBox>
      </Container>
    </div>
  ),
};
