import type { Meta, StoryObj } from '@storybook/react';
import { Loading } from './Loading';

const meta: Meta<typeof Loading> = {
  title: 'Feedback/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['spinner', 'dots', 'pulse'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Spinner: Story = {
  args: {
    variant: 'spinner',
  },
};

export const Dots: Story = {
  args: {
    variant: 'dots',
  },
};

export const Pulse: Story = {
  args: {
    variant: 'pulse',
  },
};

export const WithLabel: Story = {
  args: {
    variant: 'spinner',
    label: 'Loading data...',
  },
};

export const Small: Story = {
  args: {
    variant: 'spinner',
    size: 'sm',
    label: 'Small spinner',
  },
};

export const Medium: Story = {
  args: {
    variant: 'spinner',
    size: 'md',
    label: 'Medium spinner',
  },
};

export const Large: Story = {
  args: {
    variant: 'spinner',
    size: 'lg',
    label: 'Large spinner',
  },
};

export const CustomColor: Story = {
  args: {
    variant: 'spinner',
    color: '#ff6b6b',
    label: 'Custom color',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
      <Loading variant="spinner" label="Spinner" />
      <Loading variant="dots" label="Dots" />
      <Loading variant="pulse" label="Pulse" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <Loading variant="spinner" size="sm" label="Small" />
      <Loading variant="spinner" size="md" label="Medium" />
      <Loading variant="spinner" size="lg" label="Large" />
    </div>
  ),
};

export const FullPageLoader: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        width: '600px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
      }}
    >
      <Loading variant="spinner" size="lg" label="Loading content..." />
    </div>
  ),
};
