import React from 'react';

const ModalViewer = ({ content, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <button onClick={onClose} className="close-button">Close</button>
      <h3>{content.title}</h3>
      {content.type === 'pdf' ? (
        <iframe src={content.content} title={content.title} width="100%" height="600px" />
      ) : (
        <a href={content.content} target="_blank" rel="noreferrer">Open Link</a>
      )}
    </div>
  </div>
);

export default ModalViewer;
