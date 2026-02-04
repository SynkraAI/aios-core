import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational alert message.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Your changes have been saved successfully!',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review your changes before continuing.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'An error occurred while processing your request.',
  },
};

export const WithTitle: Story = {
  args: {
    variant: 'info',
    title: 'Important Notice',
    children: 'This alert includes a title for better organization.',
  },
};

export const WithClose: Story = {
  args: {
    variant: 'warning',
    title: 'Action Required',
    children: 'You can dismiss this alert by clicking the close button.',
    onClose: () => alert('Alert closed'),
  },
};

export const CustomIcon: Story = {
  args: {
    variant: 'success',
    icon: <span>🎉</span>,
    title: 'Congratulations!',
    children: 'You have completed all tasks successfully.',
  },
};

export const LongContent: Story = {
  args: {
    variant: 'info',
    title: 'Detailed Information',
    children: (
      <>
        <p>This alert contains longer content to demonstrate how it handles multiple paragraphs.</p>
        <p>The alert component adjusts its height automatically based on the content provided.</p>
        <ul>
          <li>First point to consider</li>
          <li>Second point to consider</li>
          <li>Third point to consider</li>
        </ul>
      </>
    ),
    onClose: () => {},
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Alert variant="info" title="Info">
        Informational message
      </Alert>
      <Alert variant="success" title="Success">
        Success message
      </Alert>
      <Alert variant="warning" title="Warning">
        Warning message
      </Alert>
      <Alert variant="error" title="Error">
        Error message
      </Alert>
    </div>
  ),
};
