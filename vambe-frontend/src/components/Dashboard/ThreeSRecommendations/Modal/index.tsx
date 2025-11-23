'use client';

import { useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';
import styles from './styles.module.css';

interface ModalProps {
  title: string;
  description: string;
  onClose: () => void;
  category?: 'start' | 'stop' | 'spiceUp';
}

function Modal({ title, description, onClose, category }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    previousActiveElement.current = document.activeElement as HTMLElement;

    if (modalRef.current) {
      modalRef.current.focus();
    }

    document.addEventListener('keydown', handleEscape);

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';

      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className={styles.modal} ref={modalRef} tabIndex={-1}>
        <div className={styles.modalHeader}>
          <h2 
            id="modal-title" 
            className={`${styles.modalTitle} ${category ? styles[`modalTitle${category === 'spiceUp' ? 'SpiceUp' : category.charAt(0).toUpperCase() + category.slice(1)}`] : ''}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar modal"
            type="button"
          >
            <X className={styles.closeIcon} />
          </button>
        </div>
        <div className={styles.modalContent}>
          <p id="modal-description" className={styles.modalDescription}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(Modal);
