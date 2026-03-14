import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8 rounded-md transition-all', view === 'list' && 'bg-card shadow-sm text-foreground')}
        onClick={() => onChange('list')}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8 rounded-md transition-all', view === 'grid' && 'bg-card shadow-sm text-foreground')}
        onClick={() => onChange('grid')}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
    </div>
  );
}
