import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Table, Column } from './Table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const sampleData: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'inactive' },
];

const meta: Meta<typeof Table> = {
  title: 'Data Display/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const columns: Column<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
];

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
};

export const Striped: Story = {
  args: {
    columns,
    data: sampleData,
    striped: true,
  },
};

export const Hoverable: Story = {
  args: {
    columns,
    data: sampleData,
    hoverable: true,
  },
};

export const Compact: Story = {
  args: {
    columns,
    data: sampleData,
    compact: true,
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    return (
      <div>
        <Table
          columns={columns}
          data={sampleData}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
        />
        <p style={{ marginTop: '1rem' }}>
          Selected IDs: {selectedRows.join(', ') || 'None'}
        </p>
      </div>
    );
  },
};

export const WithSorting: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const sortableColumns: Column<User>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      { key: 'role', header: 'Role', sortable: true },
    ];

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
      setSortKey(key);
      setSortDirection(direction);
    };

    const sortedData = [...sampleData].sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey as keyof User];
      const bVal = b[sortKey as keyof User];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    });

    return (
      <div>
        <Table
          columns={sortableColumns}
          data={sortedData}
          sortable
          onSort={handleSort}
        />
        <p style={{ marginTop: '1rem' }}>
          Sorted by: {sortKey || 'None'} ({sortDirection})
        </p>
      </div>
    );
  },
};

export const WithCustomAccessor: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      {
        key: 'status',
        header: 'Status',
        accessor: (row: User) => (
          <span style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: row.status === 'active' ? '#10b981' : '#ef4444',
            color: 'white',
            fontSize: '0.875rem',
          }}>
            {row.status.toUpperCase()}
          </span>
        ),
      },
    ],
    data: sampleData,
  },
};

export const WithCustomWidth: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Name', width: '30%' },
      { key: 'email', header: 'Email', width: '40%' },
      { key: 'role', header: 'Role', width: '30%' },
    ],
    data: sampleData,
  },
};

export const EmptyTable: Story = {
  args: {
    columns,
    data: [],
  },
};

export const CompleteExample: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [sortKey, setSortKey] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const sortableColumns: Column<User>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      { key: 'role', header: 'Role', sortable: true },
      {
        key: 'status',
        header: 'Status',
        accessor: (row: User) => (
          <span style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: row.status === 'active' ? '#10b981' : '#ef4444',
            color: 'white',
            fontSize: '0.875rem',
          }}>
            {row.status.toUpperCase()}
          </span>
        ),
      },
    ];

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
      setSortKey(key);
      setSortDirection(direction);
    };

    const sortedData = [...sampleData].sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey as keyof User];
      const bVal = b[sortKey as keyof User];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    });

    return (
      <div>
        <Table
          columns={sortableColumns}
          data={sortedData}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          sortable
          onSort={handleSort}
          striped
          hoverable
        />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
          <p>Selected: {selectedRows.length} row(s)</p>
          <p>Sorted by: {sortKey || 'None'} ({sortDirection})</p>
        </div>
      </div>
    );
  },
};
