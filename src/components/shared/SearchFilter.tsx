import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder?: string;
  filters?: { label: string; options: FilterOption[]; value: string; onChange: (v: string) => void }[];
}

export default function SearchFilter({ search, onSearchChange, placeholder = 'Search...', filters }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-8 bg-card"
        />
        <AnimatePresence>
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {filters?.map(f => (
        <div key={f.label} className="flex items-center gap-2 flex-wrap">
          {f.options.map(opt => (
            <Badge
              key={opt.value}
              variant={f.value === opt.value ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={() => f.onChange(f.value === opt.value ? '' : opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
