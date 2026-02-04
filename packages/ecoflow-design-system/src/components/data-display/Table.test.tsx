import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, Column } from './Table';

interface TestData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
];

const mockColumns: Column<TestData>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
];

describe('Table', () => {
  it('renders table with data', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders with selectable rows', () => {
    render(<Table columns={mockColumns} data={mockData} selectable />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4); // 1 header + 3 rows
  });

  it('handles select all checkbox', () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable
        onSelectionChange={onSelectionChange}
      />
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('handles individual row selection', () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable
        selectedRows={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first row

    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('handles sortable columns', () => {
    const onSort = vi.fn();
    const sortableColumns = mockColumns.map((col) => ({ ...col, sortable: true }));

    render(<Table columns={sortableColumns} data={mockData} sortable onSort={onSort} />);

    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader!);

    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('renders with striped rows', () => {
    const { container } = render(<Table columns={mockColumns} data={mockData} striped />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(3);
  });

  it('renders with hoverable rows', () => {
    const { container } = render(<Table columns={mockColumns} data={mockData} hoverable />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveStyle({ cursor: 'pointer' });
  });

  it('renders with compact spacing', () => {
    render(<Table columns={mockColumns} data={mockData} compact />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('uses custom accessor for column', () => {
    const columnsWithAccessor: Column<TestData>[] = [
      { key: 'name', header: 'Name', accessor: (row) => row.name.toUpperCase() },
      { key: 'email', header: 'Email' },
    ];

    render(<Table columns={columnsWithAccessor} data={mockData} />);
    expect(screen.getByText('JOHN DOE')).toBeInTheDocument();
  });

  it('uses custom getRowId function', () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable
        onSelectionChange={onSelectionChange}
        getRowId={(row) => `custom-${row.id}`}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(onSelectionChange).toHaveBeenCalledWith(['custom-1']);
  });

  it('applies custom className', () => {
    const { container } = render(
      <Table columns={mockColumns} data={mockData} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders empty table with no data', () => {
    render(<Table columns={mockColumns} data={[]} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(1); // Only header row
  });
});
