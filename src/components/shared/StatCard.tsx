import { motion } from 'framer-motion';

interface Props {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

export default function StatCard({ title, value, icon: Icon, description }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-heading font-bold mt-2 text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary" />
        </div>
      </div>
    </motion.div>
  );
}
