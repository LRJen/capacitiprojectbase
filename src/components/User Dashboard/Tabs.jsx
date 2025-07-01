import React from 'react';

const Tabs = ({ activeTab, setActiveTab, availableCount, myResourcesCount, libraryCount }) => (
  <div className="tabs">
    <button
      className={`tab ${activeTab === 'available' ? 'tab-active' : ''}`}
      onClick={() => setActiveTab('available')}
    >
      Available ({availableCount})
    </button>
    <button
      className={`tab ${activeTab === 'myResources' ? 'tab-active' : ''}`}
      onClick={() => setActiveTab('myResources')}
    >
      My Resources ({myResourcesCount})
    </button>
    <button
      className={`tab ${activeTab === 'myLibrary' ? 'tab-active' : ''}`}
      onClick={() => setActiveTab('myLibrary')}
    >
      My Library ({libraryCount})
    </button>
  </div>
);
export default Tabs;
