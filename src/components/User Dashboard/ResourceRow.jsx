import React from 'react';

const ResourceRow = ({ resource, notifications, tab, handleRequest, handleCancelRequest, handleDownloadOrAccess }) => {
  const notif = notifications.find((n) => n.resourceId === resource.id);
  const status = notif ? notif.status : resource.status;

  const actionButton = () => {
    if (tab === 'available') {
      return (
        <button className="action-button request" onClick={() => handleRequest(resource.id)}>
          Request
        </button>
      );
    } else if (tab === 'myResources') {
      if (notif?.status === 'pending') {
        return (
          <button className="action-button cancel-button" onClick={() => handleCancelRequest(notif.id, resource.id)}>
            Cancel
          </button>
        );
      }
      if (notif?.status === 'approved') {
        return (
          <button className="action-button download-button" onClick={() => handleDownloadOrAccess(resource)}>
            Download
          </button>
        );
      }
    } else if (tab === 'myLibrary') {
      return (
        <button className="action-button view-button" onClick={() => handleDownloadOrAccess(resource)}>
          View
        </button>
      );
    }
    return null;
  };

  return (
    <tr>
      <td>{resource.title}</td>
      <td>{resource.description}</td>
      <td>{resource.type}</td>
      <td>{status}</td>
      <td>{actionButton()}</td>
    </tr>
  );
};

export default ResourceRow;
