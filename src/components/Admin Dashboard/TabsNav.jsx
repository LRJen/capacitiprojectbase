import React from 'react';

const TabsNav = ({ activeTab, setActiveTab }) => (
  <div className="tabs">
      <div
        className={`tab ${activeTab === 'pending-requests' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('pending-requests')}
      >   
      Pending Requests
      </div>
      <div
        className={`tab ${activeTab === 'manage-resources' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('manage-resources')}
      >
      Manage Resources
      </div>
       
      
      <div
        className={`tab ${activeTab === 'downloads' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('downloads')}
      >
        Downloads
      </div>
      
      <div
        className={`tab ${activeTab === 'analytics-section' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('analytics-section')}
      >
        Analytics
      </div>
  </div>
);

export default TabsNav;
