import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ActionSheet } from './ActionSheet'
import { Button } from '../Button'

const meta = {
  title: 'Components/ActionSheet',
  component: ActionSheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionSheet>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic action sheet with simple actions
 */
export const Default: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Action Sheet" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          actions={[
            { id: '1', label: 'Edit', onPress: () => alert('Edit') },
            { id: '2', label: 'Share', onPress: () => alert('Share') },
            { id: '3', label: 'Copy Link', onPress: () => alert('Copy') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Action sheet with title and message
 */
export const WithTitleAndMessage: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Action Sheet" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          title="Photo Options"
          message="Choose how you want to use this photo"
          actions={[
            { id: '1', label: 'Use as Wallpaper', onPress: () => alert('Wallpaper') },
            { id: '2', label: 'Share', onPress: () => alert('Share') },
            { id: '3', label: 'Save to Photos', onPress: () => alert('Save') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Action sheet with destructive action
 */
export const WithDestructiveAction: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Action Sheet" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          title="Are you sure?"
          message="This action cannot be undone"
          actions={[
            { id: '1', label: 'Edit', onPress: () => alert('Edit') },
            { id: '2', label: 'Duplicate', onPress: () => alert('Duplicate') },
            { id: '3', label: 'Delete', destructive: true, onPress: () => alert('Delete') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Action sheet with icons
 */
export const WithIcons: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Action Sheet" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          title="File Options"
          actions={[
            { id: '1', label: 'Edit', icon: '✏️', onPress: () => alert('Edit') },
            { id: '2', label: 'Share', icon: '📤', onPress: () => alert('Share') },
            { id: '3', label: 'Copy', icon: '📋', onPress: () => alert('Copy') },
            { id: '4', label: 'Delete', icon: '🗑️', destructive: true, onPress: () => alert('Delete') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Action sheet with disabled action
 */
export const WithDisabledAction: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Action Sheet" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          title="Document Options"
          actions={[
            { id: '1', label: 'Print', onPress: () => alert('Print') },
            { id: '2', label: 'Export PDF', disabled: true, onPress: () => alert('Export') },
            { id: '3', label: 'Share', onPress: () => alert('Share') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Action sheet with custom cancel label
 */
export const CustomCancelLabel: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Action Sheet" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          title="Choose Language"
          actions={[
            { id: '1', label: 'English', onPress: () => alert('English') },
            { id: '2', label: 'Español', onPress: () => alert('Español') },
            { id: '3', label: 'Français', onPress: () => alert('Français') },
          ]}
          cancelLabel="Close"
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Social sharing action sheet
 */
export const SocialSharing: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Share" icon="📤" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          title="Share to"
          actions={[
            { id: '1', label: 'Messages', icon: '💬', onPress: () => alert('Messages') },
            { id: '2', label: 'Mail', icon: '📧', onPress: () => alert('Mail') },
            { id: '3', label: 'Copy Link', icon: '🔗', onPress: () => alert('Copy') },
            { id: '4', label: 'More...', onPress: () => alert('More') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Photo actions example
 */
export const PhotoActions: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
          }}
        >
          🖼️
        </div>
        <Button label="Photo Options" onPress={() => setVisible(true)} />
        <ActionSheet
          visible={visible}
          title="Photo.jpg"
          message="3.2 MB • 4032 × 3024"
          actions={[
            { id: '1', label: 'Edit', icon: '✏️', onPress: () => alert('Edit') },
            { id: '2', label: 'Favorite', icon: '❤️', onPress: () => alert('Favorite') },
            { id: '3', label: 'Share', icon: '📤', onPress: () => alert('Share') },
            { id: '4', label: 'Duplicate', icon: '📋', onPress: () => alert('Duplicate') },
            { id: '5', label: 'Hide', onPress: () => alert('Hide') },
            { id: '6', label: 'Delete', icon: '🗑️', destructive: true, onPress: () => alert('Delete') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}
