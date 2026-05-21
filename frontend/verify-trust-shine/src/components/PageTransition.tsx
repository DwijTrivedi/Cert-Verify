import { motion } from "framer-motion";
import { ReactNode } from "react";

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a page's root element with a smooth fade+slide-up entry / fade-up exit.
 * Uses Framer Motion — works with AnimatePresence in App.tsx.
 */
const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;
