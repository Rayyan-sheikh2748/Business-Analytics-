import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, AlertCircle } from "lucide-react";

interface PremiumToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function PremiumToast({ message, type = "success", onClose }: PremiumToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        className={`fixed bottom-6 right-6 z-[110] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] border backdrop-blur-xl text-sm font-medium ${
          type === "success"
            ? "bg-[#0a0a0a]/95 text-white border-[#a0aecd]/30"
            : "bg-red-600/95 text-white border-red-400/40"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="w-4 h-4 text-[#a0aecd] flex-shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
        )}
        <span>{message}</span>
        <button type="button" onClick={onClose} className="p-0.5 opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
