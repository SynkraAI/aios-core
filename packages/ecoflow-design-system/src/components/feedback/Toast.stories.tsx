import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Feedback/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    position: {
      control: 'select',
      options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="info"
          message="This is an informational message"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const Success: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="success"
          message="Changes saved successfully!"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const Warning: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="warning"
          message="Please review your changes"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const Error: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="error"
          message="An error occurred while processing your request"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const WithTitle: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="success"
          title="Success"
          message="Your profile has been updated"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const TopLeft: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="info"
          message="Top left position"
          position="top-left"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const TopCenter: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="info"
          message="Top center position"
          position="top-center"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const TopRight: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="info"
          message="Top right position (default)"
          position="top-right"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const BottomLeft: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="info"
          message="Bottom left position"
          position="bottom-left"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const BottomCenter: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="info"
          message="Bottom center position"
          position="bottom-center"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const BottomRight: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Toast</button>
        <Toast
          variant="info"
          message="Bottom right position"
          position="bottom-right"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={0}
        />
      </>
    );
  },
};

export const AutoDismiss: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <>
        <button onClick={() => setVisible(true)}>Show Auto-Dismiss Toast</button>
        <Toast
          variant="success"
          message="This toast will auto-dismiss in 5 seconds"
          visible={visible}
          onClose={() => setVisible(false)}
          duration={5000}
        />
      </>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [visibleInfo, setVisibleInfo] = useState(true);
    const [visibleSuccess, setVisibleSuccess] = useState(true);
    const [visibleWarning, setVisibleWarning] = useState(true);
    const [visibleError, setVisibleError] = useState(true);

    return (
      <>
        <button
          onClick={() => {
            setVisibleInfo(true);
            setVisibleSuccess(true);
            setVisibleWarning(true);
            setVisibleError(true);
          }}
        >
          Show All Toasts
        </button>
        <Toast
          variant="info"
          message="Info notification"
          position="top-right"
          visible={visibleInfo}
          onClose={() => setVisibleInfo(false)}
          duration={0}
        />
        <Toast
          variant="success"
          message="Success notification"
          position="top-right"
          visible={visibleSuccess}
          onClose={() => setVisibleSuccess(false)}
          duration={0}
          style={{ top: '5rem' }}
        />
        <Toast
          variant="warning"
          message="Warning notification"
          position="top-right"
          visible={visibleWarning}
          onClose={() => setVisibleWarning(false)}
          duration={0}
          style={{ top: '9rem' }}
        />
        <Toast
          variant="error"
          message="Error notification"
          position="top-right"
          visible={visibleError}
          onClose={() => setVisibleError(false)}
          duration={0}
          style={{ top: '13rem' }}
        />
      </>
    );
  },
};
