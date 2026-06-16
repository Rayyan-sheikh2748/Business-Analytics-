import { Link } from "wouter";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f5f9] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl w-full max-w-md p-8 text-center"
      >
        <div className="w-14 h-14 bg-[#a0aecd]/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-[#0a0a0a]" />
        </div>
        <h1 className="text-2xl font-semibold text-[#0a0a0a] tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-[#64748b]">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <Link href="/">
          <button type="button" className="btn-primary mt-6 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
