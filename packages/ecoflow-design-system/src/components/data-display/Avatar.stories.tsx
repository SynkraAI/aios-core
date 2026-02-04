import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    name: 'John Doe',
    src: 'https://i.pravatar.cc/150?img=1',
  },
};

export const Small: Story = {
  args: {
    name: 'John Doe',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    name: 'John Doe',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'John Doe',
    size: 'xl',
  },
};

export const Circle: Story = {
  args: {
    name: 'John Doe',
    shape: 'circle',
    src: 'https://i.pravatar.cc/150?img=2',
  },
};

export const Square: Story = {
  args: {
    name: 'John Doe',
    shape: 'square',
    src: 'https://i.pravatar.cc/150?img=3',
  },
};

export const CustomColor: Story = {
  args: {
    name: 'John Doe',
    fallbackColor: '#ff6b6b',
  },
};

export const SingleName: Story = {
  args: {
    name: 'Madonna',
  },
};

export const NoName: Story = {
  args: {},
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Avatar name="John Doe" size="sm" />
      <Avatar name="Jane Smith" size="md" />
      <Avatar name="Bob Johnson" size="lg" />
      <Avatar name="Alice Brown" size="xl" />
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Avatar name="User 1" src="https://i.pravatar.cc/150?img=4" size="md" />
      <Avatar name="User 2" src="https://i.pravatar.cc/150?img=5" size="md" />
      <Avatar name="User 3" src="https://i.pravatar.cc/150?img=6" size="md" />
      <Avatar name="User 4" src="https://i.pravatar.cc/150?img=7" size="md" />
    </div>
  ),
};

export const ShapeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Avatar name="Circle" shape="circle" src="https://i.pravatar.cc/150?img=8" size="lg" />
      <Avatar name="Square" shape="square" src="https://i.pravatar.cc/150?img=9" size="lg" />
    </div>
  ),
};
