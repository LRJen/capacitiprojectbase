import React from 'react';

const ConfirmModal = ({ showConfirmModal, pendingResource, confirmAddResource, cancelAddResource }) => {
  if (!showConfirmModal || !pendingResource) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Resource Addition</h3>
        <p><strong>Title:</strong> {pendingResource.title}</p>
        <p><strong>Description:</strong> {pendingResource.description}</p>
        <p><strong>Type:</strong> {pendingResource.type}</p>
        <p>
          <strong>Content:</strong>{' '}
          {pendingResource.type === 'pdf' ? 'PDF file uploaded' : pendingResource.content}
        </p>
        <div className="modal-actions">
          <button onClick={confirmAddResource} className="confirm-button">Confirm</button>
          <button onClick={cancelAddResource}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
