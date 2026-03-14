import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

interface Props {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', description = 'Get started by adding your first item.', action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-secondary" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
