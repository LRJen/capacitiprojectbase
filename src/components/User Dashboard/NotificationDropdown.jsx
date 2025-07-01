import React from 'react';
import { X } from 'lucide-react';

const NotificationDropdown = ({ notifications, dismissNotification, close }) => (
  <div className="notification-dropdown">
    <div className="notification-header">
      <h3>Notifications</h3>
      <button onClick={close}><X size={16} /></button>
    </div>
    {notifications.length ? (
      notifications.map((n) => (
        <div key={n.id} className="notification-item">
          <span>{n.message}</span>
          {n.dismissible && (
            <button onClick={() => dismissNotification(n.id)}>
              <X size={16} />
            </button>
          )}
        </div>
      ))
    ) : (
      <div>No notifications</div>
    )}
  </div>
);
export default NotificationDropdown;
