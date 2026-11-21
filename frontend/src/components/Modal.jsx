import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, description, onClose, busy, children }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="modal-heading">
        <div><h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></div>
        <button className="icon-button" type="button" onClick={onClose} disabled={busy} aria-label="Đóng">
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
