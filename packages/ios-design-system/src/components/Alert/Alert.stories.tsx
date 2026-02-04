import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Alert } from './Alert'
import { Button } from '../Button'

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic alert with OK button
 */
export const Default: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Alert" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Alert Title"
          message="This is an alert message"
          buttons={[{ id: '1', label: 'OK', onPress: () => setVisible(false) }]}
        />
      </div>
    )
  },
}

/**
 * Alert with two buttons (horizontal layout)
 */
export const TwoButtons: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Alert" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Confirm Action"
          message="Are you sure you want to proceed?"
          buttons={[
            { id: '1', label: 'Cancel', style: 'cancel', onPress: () => setVisible(false) },
            { id: '2', label: 'OK', onPress: () => alert('Confirmed!') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Destructive alert
 */
export const Destructive: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Delete Item" variant="destructive" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Delete Item?"
          message="This action cannot be undone."
          buttons={[
            { id: '1', label: 'Cancel', style: 'cancel', onPress: () => setVisible(false) },
            { id: '2', label: 'Delete', style: 'destructive', onPress: () => alert('Deleted!') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Alert with three buttons (vertical layout)
 */
export const ThreeButtons: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Options" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Save Changes?"
          message="Do you want to save your changes before closing?"
          buttons={[
            { id: '1', label: 'Save', onPress: () => alert('Saved!') },
            { id: '2', label: "Don't Save", style: 'destructive', onPress: () => alert('Discarded!') },
            { id: '3', label: 'Cancel', style: 'cancel', onPress: () => setVisible(false) },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Alert without message
 */
export const NoMessage: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Show Alert" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Title Only"
          buttons={[
            { id: '1', label: 'Cancel', style: 'cancel', onPress: () => setVisible(false) },
            { id: '2', label: 'OK', onPress: () => alert('OK!') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Permission request alert
 */
export const PermissionRequest: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Request Permission" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Allow Access to Camera?"
          message="This app would like to access your camera to take photos."
          buttons={[
            { id: '1', label: "Don't Allow", style: 'cancel', onPress: () => alert('Denied') },
            { id: '2', label: 'Allow', onPress: () => alert('Granted!') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Sign out confirmation
 */
export const SignOut: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Sign Out" variant="secondary" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Sign Out?"
          message="Are you sure you want to sign out?"
          buttons={[
            { id: '1', label: 'Cancel', style: 'cancel', onPress: () => setVisible(false) },
            { id: '2', label: 'Sign Out', style: 'destructive', onPress: () => alert('Signed out!') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}

/**
 * Network error alert
 */
export const NetworkError: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div>
        <Button label="Simulate Error" onPress={() => setVisible(true)} />
        <Alert
          visible={visible}
          title="Network Error"
          message="Unable to connect to the server. Please check your internet connection and try again."
          buttons={[
            { id: '1', label: 'Cancel', style: 'cancel', onPress: () => setVisible(false) },
            { id: '2', label: 'Retry', onPress: () => alert('Retrying...') },
          ]}
          onDismiss={() => setVisible(false)}
        />
      </div>
    )
  },
}
