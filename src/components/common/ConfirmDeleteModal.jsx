import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const ConfirmDeleteModal = ({ isOpen, onConfirm, onCancel, itemTitle = 'this item' }) => {
  return isOpen ? (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 right-0 bottom-0 z-[9998] flex items-center justify-center p-3 sm:p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Backdrop */}
        <motion.div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-md"
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-raised shadow-2xl p-6 sm:p-8 max-w-sm sm:rounded-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center">
              <AlertTriangle size={32} className="text-status-error" />
            </div>
          </div>

          {/* Title & Message */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-text-primary">Delete Record?</h2>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete <span className="font-semibold text-text-primary">"{itemTitle}"</span>? This action cannot be undone.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onCancel}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full rounded-lg bg-status-error px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null;
};

export default ConfirmDeleteModal;
