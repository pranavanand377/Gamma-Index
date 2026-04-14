import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import useToastStore from '../../store/useToastStore';

const toastConfig = {
  success: {
    bg: 'bg-status-success/10 border-status-success/20',
    icon: CheckCircle,
    iconColor: 'text-status-success',
  },
  error: {
    bg: 'bg-status-error/10 border-status-error/20',
    icon: AlertCircle,
    iconColor: 'text-status-error',
  },
  info: {
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    icon: Info,
    iconColor: 'text-accent-cyan',
  },
};

const Toast = ({ id, message, type = 'success' }) => {
  const removeToast = useToastStore((s) => s.removeToast);
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${config.bg}`}
    >
      <Icon size={18} className={config.iconColor} />
      <span className="text-sm font-medium text-text-primary flex-1">{message}</span>
      <button
        onClick={() => removeToast(id)}
        className="p-1 text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-4 left-3 right-3 z-[9999] flex flex-col gap-2 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
