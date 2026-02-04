import { ReactNode, HTMLAttributes, CSSProperties, useState } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';

export interface Column<T = any> {
  key: string;
  header: ReactNode;
  accessor?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T = any> extends Omit<HTMLAttributes<HTMLTableElement>, 'onChange'> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  getRowId?: (row: T, index: number) => string;
}

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  onSort,
  striped = false,
  hoverable = true,
  compact = false,
  getRowId = (row, index) => row.id?.toString() || index.toString(),
  className = '',
  style,
  ...props
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = data.map((row, index) => getRowId(row, index));
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedRows, rowId]);
    } else {
      onSelectionChange(selectedRows.filter((id) => id !== rowId));
    }
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    ...style,
  };

  const thStyle: CSSProperties = {
    padding: compact ? `${spacing[2]} ${spacing[3]}` : `${spacing[3]} ${spacing[4]}`,
    textAlign: 'left',
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    backgroundColor: colors.neutral[50],
    borderBottom: `${borders.borderWidth[2]} solid ${colors.neutral[200]}`,
  };

  const tdStyle: CSSProperties = {
    padding: compact ? `${spacing[2]} ${spacing[3]}` : `${spacing[3]} ${spacing[4]}`,
    borderBottom: `${borders.borderWidth.DEFAULT} solid ${colors.neutral[200]}`,
    color: colors.neutral[900],
  };

  const sortButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    padding: 0,
    marginLeft: spacing[4],
    cursor: 'pointer',
    color: colors.neutral[500],
    fontSize: typography.fontSize.xs,
  };

  return (
    <table className={className} style={tableStyle} {...props}>
      <thead>
        <tr>
          {selectable && (
            <th style={{ ...thStyle, width: '40px' }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                aria-label="Select all rows"
              />
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              style={{
                ...thStyle,
                ...(column.width && { width: column.width }),
                ...(column.sortable && { cursor: 'pointer' }),
              }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {column.header}
                {column.sortable && (
                  <button
                    type="button"
                    style={sortButtonStyle}
                    aria-label={`Sort by ${column.header}`}
                  >
                    {sortKey === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => {
          const rowId = getRowId(row, rowIndex);
          const isSelected = selectedRows.includes(rowId);

          const rowStyle: CSSProperties = {
            ...(striped && rowIndex % 2 === 1 && { backgroundColor: colors.neutral[50] }),
            ...(hoverable && { cursor: 'pointer' }),
            ...(isSelected && { backgroundColor: colors.primary[50] }),
          };

          return (
            <tr
              key={rowId}
              style={rowStyle}
              onMouseEnter={(e) => {
                if (hoverable && !isSelected) {
                  e.currentTarget.style.backgroundColor = colors.neutral[100];
                }
              }}
              onMouseLeave={(e) => {
                if (hoverable && !isSelected) {
                  e.currentTarget.style.backgroundColor =
                    striped && rowIndex % 2 === 1 ? colors.neutral[50] : 'transparent';
                }
              }}
            >
              {selectable && (
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} style={tdStyle}>
                  {column.accessor ? column.accessor(row) : row[column.key]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
