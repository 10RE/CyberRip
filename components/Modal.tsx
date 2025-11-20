import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  isOpen: boolean;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border-4 border-gray-400 p-1 w-full max-w-lg relative shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <div className="border-2 border-gray-500 p-4 bg-[#1a1a1a]">
          <div className="flex justify-between items-center mb-6 border-b-2 border-gray-600 pb-2">
            <h2 className="text-yellow-400 text-xl text-center uppercase tracking-widest animate-pulse">{title}</h2>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-red-500 hover:text-red-400 text-xl"
              >
                [X]
              </button>
            )}
          </div>
          <div className="text-gray-300 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};