import { useState } from 'react';
import toast from 'react-hot-toast';
import { Warning, X, Check } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ message, onConfirm, onCancel }: ConfirmDialogProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-warning-100 rounded-full">
            <Warning size={32} className="text-warning" weight="duotone" />
          </div>
          <h3 className="text-xl font-bold text-dark">{t('confirmDialog.title')}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <X size={20} weight="bold" />
            {t('confirmDialog.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-danger to-danger-dark text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <Check size={20} weight="bold" />
            {t('confirmDialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook pour utiliser le dialog de confirmation
export const useConfirm = () => {
  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const toastId = toast.custom(
        (t) => (
          <ConfirmDialog
            message={message}
            onConfirm={() => {
              toast.dismiss(toastId);
              resolve(true);
            }}
            onCancel={() => {
              toast.dismiss(toastId);
              resolve(false);
            }}
          />
        ),
        {
          duration: Infinity,
          position: 'top-center',
        }
      );
    });
  };

  return { confirm };
};

export default ConfirmDialog;
