import { motion } from "framer-motion";
import { FileX } from "lucide-react";

const EmptyState = ({ title = "No data found", description = "Get started by creating your first item." }: { title?: string; description?: string }) => (
  <motion.div className="flex flex-col items-center justify-center py-16 text-center"
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
    <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-4">
      <FileX className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="font-display text-lg font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
  </motion.div>
);

export default EmptyState;
