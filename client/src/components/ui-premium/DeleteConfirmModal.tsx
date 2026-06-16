import { AlertTriangle } from "lucide-react";
import PremiumModal from "@/components/PremiumModal";

interface DeleteConfirmModalProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}

export default function DeleteConfirmModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
  confirmLabel = "Delete",
}: DeleteConfirmModalProps) {
  return (
    <PremiumModal open={open} onClose={onClose} className="max-w-sm">
      <div className="p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-red-100">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">{title}</h3>
        <p className="text-sm text-[#64748b] mb-5">{description}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </PremiumModal>
  );
}
