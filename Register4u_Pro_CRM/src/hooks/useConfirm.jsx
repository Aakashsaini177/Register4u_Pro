import { useState } from "react";

/**
 * Custom hook for confirmation dialogs
 *
 * Usage:
 * const { confirm, ConfirmDialog } = useConfirm();
 *
 * // In your component JSX:
 * <ConfirmDialog />
 *
 * // When you need confirmation:
 * const confirmed = await confirm({
 *   title: "Delete Item",
 *   message: "Are you sure you want to delete this item?",
 * });
 *
 * if (confirmed) {
 *   // Proceed with action
 * }
 */
export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || "Confirm Action",
        message: options.message || "Are you sure you want to proceed?",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
      });
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  };

  const ConfirmDialogComponent = () => {
    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          onClick={handleCancel}
        />

        {/* Dialog */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    config.variant === "danger"
                      ? "bg-red-100 dark:bg-red-900/20"
                      : config.variant === "warning"
                      ? "bg-yellow-100 dark:bg-yellow-900/20"
                      : "bg-blue-100 dark:bg-blue-900/20"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${
                      config.variant === "danger"
                        ? "text-red-600 dark:text-red-400"
                        : config.variant === "warning"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {config.title}
                  </h3>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Message */}
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-16">
                {config.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-w-[100px]"
              >
                {config.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors min-w-[100px] ${
                  config.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : config.variant === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {config.confirmText}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
};
