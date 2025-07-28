import React from 'react';

const TabsNav = ({ activeTab, setActiveTab }) => (
  <div className="tabs">
    <div
      className={`tab ${activeTab === 'manage-resources' ? 'active' : ''}`}
      onClick={() => setActiveTab('manage-resources')}
    >
      Manage Resources
    </div>
    <div
      className={`tab ${activeTab === 'pending-requests' ? 'active' : ''}`}
      onClick={() => setActiveTab('pending-requests')}
    >
      Pending Requests
    </div>
    <div
      className={`tab ${activeTab === 'downloads' ? 'active' : ''}`}
      onClick={() => setActiveTab('downloads')}
    >
      Downloads
    </div>
    <div
      className={`tab ${activeTab === 'analytics-section' ? 'active' : ''}`}
      onClick={() => setActiveTab('analytics-section')}
    >
      Analytics
    </div>
  </div>
);

export default TabsNav;
