import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Feedback/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Basic Modal">
          <p>This is a basic modal with a title and content.</p>
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Modal with Footer"
          footer={
            <>
              <button onClick={() => setOpen(false)}>Cancel</button>
              <button onClick={() => setOpen(false)} style={{ marginLeft: '0.5rem' }}>
                Confirm
              </button>
            </>
          }
        >
          <p>This modal includes action buttons in the footer.</p>
        </Modal>
      </>
    );
  },
};

export const SmallSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Small Modal</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Small Modal" size="sm">
          <p>This is a small modal.</p>
        </Modal>
      </>
    );
  },
};

export const MediumSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Medium Modal</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Medium Modal" size="md">
          <p>This is a medium modal (default size).</p>
        </Modal>
      </>
    );
  },
};

export const LargeSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Large Modal</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Large Modal" size="lg">
          <p>This is a large modal with more space for content.</p>
        </Modal>
      </>
    );
  },
};

export const ExtraLargeSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Extra Large Modal</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Extra Large Modal" size="xl">
          <p>This is an extra large modal for comprehensive content.</p>
        </Modal>
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal with Long Content</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Long Content">
          <div>
            <p>This modal has long content that requires scrolling.</p>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>
                Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            ))}
          </div>
        </Modal>
      </>
    );
  },
};

export const NoOverlayClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="No Overlay Close"
          closeOnOverlayClick={false}
        >
          <p>Click outside won't close this modal. Use the X button or Escape key.</p>
        </Modal>
      </>
    );
  },
};

export const NoEscapeClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="No Escape Close"
          closeOnEscape={false}
        >
          <p>Pressing Escape won't close this modal. Use the X button or click outside.</p>
        </Modal>
      </>
    );
  },
};

export const ConfirmationDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button onClick={() => setOpen(true)}>Delete Item</button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm Deletion"
          size="sm"
          footer={
            <>
              <button onClick={() => setOpen(false)}>Cancel</button>
              <button
                onClick={() => {
                  alert('Item deleted');
                  setOpen(false);
                }}
                style={{ marginLeft: '0.5rem', backgroundColor: '#ef4444', color: 'white' }}
              >
                Delete
              </button>
            </>
          }
        >
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Modal>
      </>
    );
  },
};
