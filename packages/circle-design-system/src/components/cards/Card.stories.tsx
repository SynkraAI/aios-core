import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from '../buttons/Button';

const meta = {
  title: 'Components/Cards/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'bordered'],
      description: 'Card visual style variant',
    },
    hoverable: {
      control: 'boolean',
      description: 'Add hover effect',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default card
export const Default: Story = {
  args: {
    children: 'Default card content',
  },
};

// Elevated card
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'Elevated card with shadow',
  },
};

// Bordered card
export const Bordered: Story = {
  args: {
    variant: 'bordered',
    children: 'Bordered card with outline',
  },
};

// With header
export const WithHeader: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Header title="Card Title" />
      <Card.Body>
        This is a card with a header section. Headers typically contain a title
        and optional actions.
      </Card.Body>
    </Card>
  ),
};

// With header and actions
export const WithHeaderActions: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Header
        title="Project Dashboard"
        actions={
          <>
            <Button size="sm" variant="ghost">Edit</Button>
            <Button size="sm" variant="primary">Save</Button>
          </>
        }
      />
      <Card.Body>
        Card with header title and multiple action buttons.
      </Card.Body>
    </Card>
  ),
};

// With all sections
export const Complete: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Header title="Complete Card" />
      <Card.Body>
        <p style={{ margin: 0, marginBottom: '8px' }}>
          This card demonstrates all three sections working together.
        </p>
        <p style={{ margin: 0 }}>
          The header shows the title, the body contains the main content,
          and the footer can display actions or metadata.
        </p>
      </Card.Body>
      <Card.Footer>
        <span style={{ fontSize: '12px', color: '#737373' }}>Last updated: 2 hours ago</span>
        <Button size="sm">View Details</Button>
      </Card.Footer>
    </Card>
  ),
};

// Hoverable card
export const Hoverable: Story = {
  render: () => (
    <Card variant="elevated" hoverable>
      <Card.Header title="Hoverable Card" />
      <Card.Body>
        Hover over this card to see the elevation effect.
        Perfect for clickable cards or interactive elements.
      </Card.Body>
    </Card>
  ),
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
      <Card variant="default">
        <Card.Header title="Default Variant" />
        <Card.Body>Card with no shadow or border.</Card.Body>
      </Card>

      <Card variant="elevated">
        <Card.Header title="Elevated Variant" />
        <Card.Body>Card with shadow for depth.</Card.Body>
      </Card>

      <Card variant="bordered">
        <Card.Header title="Bordered Variant" />
        <Card.Body>Card with subtle border outline.</Card.Body>
      </Card>
    </div>
  ),
};

// Content examples
export const WithList: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Header title="Recent Activity" />
      <Card.Body>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>John commented on your post</li>
          <li style={{ marginBottom: '8px' }}>Sarah liked your photo</li>
          <li style={{ marginBottom: '8px' }}>New member joined the community</li>
        </ul>
      </Card.Body>
    </Card>
  ),
};

// Stats card
export const StatsCard: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Body>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#506CF0', marginBottom: '8px' }}>
            1,234
          </div>
          <div style={{ fontSize: '14px', color: '#737373' }}>
            Total Members
          </div>
        </div>
      </Card.Body>
    </Card>
  ),
};

// User card
export const UserCard: Story = {
  render: () => (
    <Card variant="elevated" hoverable>
      <Card.Body>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#506CF0',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            JD
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>John Doe</div>
            <div style={{ fontSize: '12px', color: '#737373' }}>john.doe@example.com</div>
          </div>
          <Button size="sm" variant="secondary">View Profile</Button>
        </div>
      </Card.Body>
    </Card>
  ),
};
