/**
 * EcoFlow Design System - Demo Example
 *
 * Este arquivo demonstra todos os componentes do design system
 * em um layout completo de dashboard.
 */

import React, { useState } from 'react';
import {
  // Typography
  Heading,
  Text,

  // Layout
  Container,
  Stack,
  Grid,
  Spacer,

  // Navigation
  Sidebar,
  TopBar,
  Breadcrumb,
  Tabs,

  // Forms
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Switch,

  // Data Display
  Badge,
  Avatar,
  StatusIndicator,
  Card,
  Table,

  // Feedback
  Alert,
  Loading,
  Progress,
  Modal,
  Toast,
} from '@fosc/ecoflow-design-system';

export const EcoFlowDemo = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        items={[
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            href: '#dashboard',
          },
          {
            id: 'projects',
            label: 'Projects',
            icon: '📁',
            href: '#projects',
            badge: { label: '12', variant: 'primary' },
          },
          {
            id: 'team',
            label: 'Team',
            icon: '👥',
            href: '#team',
            children: [
              { id: 'members', label: 'Members', href: '#members' },
              { id: 'roles', label: 'Roles', href: '#roles' },
            ],
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            href: '#settings',
          },
        ]}
        activeItemId="dashboard"
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <TopBar
          logo={
            <Heading level="h3" weight="bold" style={{ margin: 0 }}>
              EcoFlow
            </Heading>
          }
          search={{
            placeholder: 'Search projects, tasks, people...',
            onSearch: (value) => console.log('Search:', value),
          }}
          userMenu={{
            user: {
              name: 'Luiz Fosc',
              email: 'luiz@example.com',
              avatar: 'https://i.pravatar.cc/150?img=12',
            },
            menuItems: [
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
              { id: 'logout', label: 'Logout', icon: '🚪' },
            ],
          }}
        />

        {/* Content Area */}
        <Container size="xl" style={{ padding: '2rem', flex: 1 }}>
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '#home' },
              { label: 'Projects', href: '#projects' },
              { label: 'EcoFlow Demo' },
            ]}
          />

          <Spacer size="lg" />

          {/* Page Header */}
          <Stack direction="vertical" gap="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Heading level="h1">Project Dashboard</Heading>
                <Text size="lg" color="secondary">
                  Manage your projects and track progress
                </Text>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="outline" size="md">
                  Export
                </Button>
                <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
                  New Project
                </Button>
              </div>
            </div>

            {/* Alert Example */}
            <Alert
              variant="info"
              title="New Feature Available"
              closable
            >
              Check out our new project templates to get started faster!
            </Alert>

            {/* Tabs Navigation */}
            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'tasks', label: 'Tasks', badge: { label: '24', variant: 'primary' } },
                { id: 'team', label: 'Team', icon: '👥' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* Stats Grid */}
            <Grid columns={4} gap="md">
              <Card padding="md" hoverable>
                <Stack direction="vertical" gap="sm">
                  <Text size="sm" color="secondary" weight="medium">
                    ACTIVE PROJECTS
                  </Text>
                  <Heading level="h2">12</Heading>
                  <Badge variant="success" size="sm">+3 this week</Badge>
                </Stack>
              </Card>

              <Card padding="md" hoverable>
                <Stack direction="vertical" gap="sm">
                  <Text size="sm" color="secondary" weight="medium">
                    COMPLETED TASKS
                  </Text>
                  <Heading level="h2">847</Heading>
                  <Progress value={75} size="sm" />
                </Stack>
              </Card>

              <Card padding="md" hoverable>
                <Stack direction="vertical" gap="sm">
                  <Text size="sm" color="secondary" weight="medium">
                    TEAM MEMBERS
                  </Text>
                  <Heading level="h2">24</Heading>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Avatar name="John Doe" size="sm" />
                    <Avatar name="Jane Smith" size="sm" />
                    <Avatar name="Mike Wilson" size="sm" />
                    <Avatar name="+21 more" size="sm" />
                  </div>
                </Stack>
              </Card>

              <Card padding="md" hoverable>
                <Stack direction="vertical" gap="sm">
                  <Text size="sm" color="secondary" weight="medium">
                    SYSTEM STATUS
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusIndicator status="online" size="md" />
                    <Text weight="semibold">All Systems Operational</Text>
                  </div>
                  <Text size="sm" color="secondary">Last updated: 2 min ago</Text>
                </Stack>
              </Card>
            </Grid>

            {/* Projects Table */}
            <Card padding="lg">
              <Stack direction="vertical" gap="md">
                <Heading level="h3">Recent Projects</Heading>

                <Table
                  columns={[
                    { key: 'name', label: 'Project Name', sortable: true },
                    { key: 'status', label: 'Status' },
                    { key: 'progress', label: 'Progress' },
                    { key: 'team', label: 'Team' },
                    { key: 'dueDate', label: 'Due Date', sortable: true },
                  ]}
                  data={[
                    {
                      id: '1',
                      name: 'EcoFlow Design System',
                      status: <Badge variant="success">Active</Badge>,
                      progress: <Progress value={92} size="sm" />,
                      team: (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Avatar name="John" size="sm" />
                          <Avatar name="Jane" size="sm" />
                          <Avatar name="Mike" size="sm" />
                        </div>
                      ),
                      dueDate: '2026-02-15',
                    },
                    {
                      id: '2',
                      name: 'Mobile App Redesign',
                      status: <Badge variant="warning">In Progress</Badge>,
                      progress: <Progress value={45} size="sm" />,
                      team: (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Avatar name="Sarah" size="sm" />
                          <Avatar name="Tom" size="sm" />
                        </div>
                      ),
                      dueDate: '2026-03-01',
                    },
                    {
                      id: '3',
                      name: 'API Documentation',
                      status: <Badge variant="info">Planning</Badge>,
                      progress: <Progress value={15} size="sm" />,
                      team: (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Avatar name="Alex" size="sm" />
                        </div>
                      ),
                      dueDate: '2026-03-15',
                    },
                  ]}
                  striped
                  hoverable
                />
              </Stack>
            </Card>

            {/* Forms Example */}
            <Card padding="lg">
              <Stack direction="vertical" gap="md">
                <Heading level="h3">Quick Actions</Heading>

                <Grid columns={2} gap="lg">
                  <div>
                    <Input
                      label="Project Name"
                      placeholder="Enter project name"
                      helperText="Choose a descriptive name"
                      fullWidth
                    />
                  </div>

                  <div>
                    <Select
                      label="Priority"
                      options={[
                        { value: 'low', label: 'Low Priority' },
                        { value: 'medium', label: 'Medium Priority' },
                        { value: 'high', label: 'High Priority' },
                        { value: 'critical', label: 'Critical' },
                      ]}
                      fullWidth
                    />
                  </div>
                </Grid>

                <div>
                  <Text weight="medium" style={{ marginBottom: '0.5rem' }}>
                    Notification Settings
                  </Text>
                  <Stack direction="vertical" gap="sm">
                    <Checkbox label="Email notifications" defaultChecked />
                    <Checkbox label="Push notifications" defaultChecked />
                    <Checkbox label="Weekly summary" />
                  </Stack>
                </div>

                <div>
                  <Text weight="medium" style={{ marginBottom: '0.5rem' }}>
                    Project Type
                  </Text>
                  <Stack direction="vertical" gap="sm">
                    <Radio name="type" label="Internal Project" value="internal" />
                    <Radio name="type" label="Client Project" value="client" defaultChecked />
                    <Radio name="type" label="Open Source" value="opensource" />
                  </Stack>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Switch defaultChecked />
                  <Text>Enable collaboration features</Text>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" size="md">
                    Cancel
                  </Button>
                  <Button variant="primary" size="md" onClick={() => setShowToast(true)}>
                    Save Settings
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </div>

      {/* Modal Example */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Create Project
            </Button>
          </div>
        }
      >
        <Stack direction="vertical" gap="md">
          <Input label="Project Name" placeholder="Enter project name" fullWidth />
          <Input
            label="Description"
            placeholder="Brief description"
            helperText="Optional: Add a description"
            fullWidth
          />
          <Select
            label="Template"
            options={[
              { value: 'blank', label: 'Blank Project' },
              { value: 'website', label: 'Website Project' },
              { value: 'app', label: 'App Project' },
            ]}
            fullWidth
          />
        </Stack>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          variant="success"
          message="Settings saved successfully!"
          position="top-right"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default EcoFlowDemo;
