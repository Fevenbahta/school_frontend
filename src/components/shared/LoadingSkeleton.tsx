import { motion } from 'framer-motion';

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-24 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-8 w-16 rounded-lg bg-muted/40 animate-pulse" />
          <div className="h-2.5 w-32 rounded-full bg-muted/30 animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted/40 animate-pulse" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className={`h-4 rounded-full bg-muted/40 animate-pulse`} style={{ width: `${60 + Math.random() * 30}%`, animationDelay: `${i * 100}ms` }} />
        </td>
      ))}
      <td className="p-4">
        <div className="flex gap-2 justify-end">
          <div className="w-8 h-8 rounded-md bg-muted/30 animate-pulse" />
          <div className="w-8 h-8 rounded-md bg-muted/30 animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="h-10 w-72 rounded-lg bg-muted/30 animate-pulse" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <div className="h-3 w-20 rounded-full bg-muted/50 animate-pulse" />
              </th>
            ))}
            <th className="p-4" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GridCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-muted/40 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-full bg-muted/50 animate-pulse" />
          <div className="h-3 w-1/2 rounded-full bg-muted/30 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-muted/20 animate-pulse" />
        <div className="h-3 w-2/3 rounded-full bg-muted/20 animate-pulse" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 rounded-lg bg-muted/30 animate-pulse" />
        <div className="h-8 w-20 rounded-lg bg-muted/30 animate-pulse" />
      </div>
    </motion.div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted/40 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-muted/30 animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted/30 animate-pulse" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      {/* Table */}
      <TableSkeleton />
    </motion.div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-3 border-muted border-t-secondary"
      />
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  );
}
