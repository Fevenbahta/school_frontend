import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, onAdd, addLabel, children }: Props) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onAdd && (
          <Button onClick={onAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            {addLabel || 'Add New'}
          </Button>
        )}
      </div>
    </div>
  );
}
