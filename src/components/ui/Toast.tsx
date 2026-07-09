import { motion, AnimatePresence } from 'motion/react';
import { Check, Heart, Plus } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed bottom-8 right-8 z-[999] max-w-sm w-[calc(100vw-4rem)] p-5 rounded-2xl bg-white border border-[#F1E9E0] shadow-2xl shadow-black/10 flex items-center gap-4 cursor-pointer hover:shadow-3xl transition-shadow"
          onClick={onClose}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-green-50 text-green-600' :
            toast.type === 'error' ? 'bg-red-50 text-red-600' :
            'bg-[#B2945B]/5 text-[#B2945B]'
          }`}>
            {toast.type === 'success' ? <Check size={16} strokeWidth={2.5} /> :
             toast.type === 'error' ? <Plus size={16} className="rotate-45" strokeWidth={2.5} /> :
             <Heart size={16} className="fill-[#B2945B]" />}
          </div>
          <p className="font-sans text-xs font-bold leading-relaxed text-[#222]">
            {toast.message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
