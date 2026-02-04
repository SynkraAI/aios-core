import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default card with some content.',
  },
};

export const WithHeader: Story = {
  args: {
    header: <h3 style={{ margin: 0 }}>Card Header</h3>,
    children: 'This card has a header section.',
  },
};

export const WithFooter: Story = {
  args: {
    children: 'This card has a footer section.',
    footer: (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button>Cancel</button>
        <button>Submit</button>
      </div>
    ),
  },
};

export const Complete: Story = {
  args: {
    header: <h3 style={{ margin: 0 }}>Complete Card</h3>,
    children: 'This card has header, body, and footer sections.',
    footer: (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button>Cancel</button>
        <button>Submit</button>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    header: <h3 style={{ margin: 0 }}>Outlined Card</h3>,
    children: 'This card has an outlined style.',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    header: <h3 style={{ margin: 0 }}>Elevated Card</h3>,
    children: 'This card has an elevated style with shadow.',
  },
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
    header: <h3 style={{ margin: 0 }}>Hoverable Card</h3>,
    children: 'Hover over this card to see the effect.',
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <img
        src="https://picsum.photos/400/200"
        alt="Sample"
        style={{ width: '100%', display: 'block' }}
      />
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: 'This card has small padding.',
  },
};

export const MediumPadding: Story = {
  args: {
    padding: 'md',
    children: 'This card has medium padding (default).',
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: 'This card has large padding.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', maxWidth: '900px' }}>
      <Card variant="default" style={{ flex: '1 1 250px' }}>
        <h4 style={{ marginTop: 0 }}>Default</h4>
        <p>Default card variant</p>
      </Card>
      <Card variant="outlined" style={{ flex: '1 1 250px' }}>
        <h4 style={{ marginTop: 0 }}>Outlined</h4>
        <p>Outlined card variant</p>
      </Card>
      <Card variant="elevated" style={{ flex: '1 1 250px' }}>
        <h4 style={{ marginTop: 0 }}>Elevated</h4>
        <p>Elevated card variant</p>
      </Card>
    </div>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card variant="elevated" hoverable style={{ width: '300px' }}>
      <div style={{ padding: 0 }}>
        <img
          src="https://picsum.photos/300/200"
          alt="Product"
          style={{ width: '100%', display: 'block', borderRadius: '8px 8px 0 0' }}
        />
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Product Name</h3>
        <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
          A brief description of the product goes here.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$99.99</span>
          <button style={{ padding: '0.5rem 1rem' }}>Add to Cart</button>
        </div>
      </div>
    </Card>
  ),
};
