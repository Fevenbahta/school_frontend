import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

const UnauthorizedPage = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <motion.div className="text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <ShieldX className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Unauthorized</h1>
      <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
      <Link to="/"><Button>Go Home</Button></Link>
    </motion.div>
  </div>
);

export default UnauthorizedPage;
