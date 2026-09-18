import React from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal small">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center', padding: '30px 24px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="delete-icon">
              <Trash2 size={24} />
            </div>
          </div>
          <p className="desc">{description}</p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={isDeleting}>Cancel</button>
          <button className="btn btn-danger solid" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete forever'}
          </button>
        </div>
      </div>
    </div>
  );
};
