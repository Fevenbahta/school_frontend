import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
  actions?: (item: T) => React.ReactNode;
  searchKey?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, isLoading, page = 1, onPageChange, actions, searchKey,
}: Props<T>) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    return data.filter(item => {
      const val = item[searchKey];
      const str = typeof val === 'object' && val?.Valid ? val.String : String(val || '');
      return str.toLowerCase().includes(search.toLowerCase());
    });
  }, [data, search, searchKey]);

  return (
    <div className="space-y-4">
      {searchKey && (
        <Input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      )}

      <div className="glass-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              {columns.map(col => (
                <TableHead key={col.key} className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                  {col.label}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right text-muted-foreground font-semibold text-xs uppercase tracking-wider">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, i) => (
                <TableRow key={item.id || i} className="border-border/30 hover:bg-accent/30 transition-colors">
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(item) : (
                        typeof item[col.key] === 'object' && item[col.key]?.Valid !== undefined
                          ? item[col.key]?.Valid ? item[col.key].String : '—'
                          : String(item[col.key] ?? '—')
                      )}
                    </TableCell>
                  ))}
                  {actions && <TableCell className="text-right">{actions(item)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {onPageChange && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" disabled={data.length < 20} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
