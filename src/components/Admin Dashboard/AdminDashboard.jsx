import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../User Dashboard/Header';
import TabsNav from './TabsNav';
import ManageResourcesTab from './ManageResourcesTab';
import PendingRequestsTab from './PendingRequestsTab';
import DownloadsTab from './DownloadsTab';
import AnalyticsTab from './AnalyticsTab';
import LogsTable from './LogsTable';
import RejectModal from './RejectModal';
import ConfirmModal from './ConfirmModal';
import '../../styles/Dashboard.css';

const AdminDashboard = (props) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending-requests');

  const {
    user,
    notifications,
    showNotifications,
    toggleNotifications,
    handleLogout,
    handleProfileClick,
    handleUserProfileClick,
    error,
    editResourceId,
    setEditResourceId,
    resourceName,
    setResourceName,
    resourceDetails,
    setResourceDetails,
    resourceType,
    setResourceType,
    handleFileChange,
    file,
    contentUrl,
    setContentUrl,
    handleUrlChange,
    handleAddResource,
    handleSaveEdit,
    handleClearForm,
    handleRecommendSearch,
    recommendSearch,
    setRecommendSearch,
    recommendations,
    handleAutoFill,
    filteredResources,
    searchTerm,
    setSearchTerm,
    paginatedResources,
    handleEditResource,
    handleDeleteResource,
    pageSize,
    resourcePage,
    setResourcePage,
    endResourceIndex,
    paginatedRequests,
    users,
    handleApprove,
    handleRejectClick,
    allRequests,
    requestPage,
    setRequestPage,
    endRequestIndex,
    paginatedDownloads,
    downloads,
    downloadPage,
    setDownloadPage,
    endDownloadIndex,
    barData,
    pieData,
    paginatedLogs,
    logPage,
    setLogPage,
    endLogIndex,
    logs,
    showRejectModal,
    rejectionReason,
    setRejectionReason,
    handleRejectSubmit,
    closeRejectModal,
    showConfirmModal,
    pendingResource,
    confirmAddResource,
    cancelAddResource,
  } = props;

  if (props.loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.5rem' }}>
          Loading...
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header
        user={user}
        unreadCount={notifications?.length || 0}
        toggleNotifications={toggleNotifications}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />

      {error && <div className="error">{error}</div>}

      <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'manage-resources' && (
        <>
          <ManageResourcesTab
            editResourceId={editResourceId}
            resourceName={resourceName}
            setResourceName={setResourceName}
            resourceDetails={resourceDetails}
            setResourceDetails={setResourceDetails}
            resourceType={resourceType}
            setResourceType={setResourceType}
            handleFileChange={handleFileChange}
            file={file}
            contentUrl={contentUrl}
            handleUrlChange={handleUrlChange}
            handleAddResource={handleAddResource}
            handleSaveEdit={handleSaveEdit}
            handleClearForm={handleClearForm}
            setEditResourceId={setEditResourceId}
            handleRecommendSearch={handleRecommendSearch}
            recommendSearch={recommendSearch}
            setRecommendSearch={setRecommendSearch}
            recommendations={recommendations}
            handleAutoFill={handleAutoFill}
            filteredResources={filteredResources}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            paginatedResources={paginatedResources}
            handleEditResource={handleEditResource}
            handleDeleteResource={handleDeleteResource}
            pageSize={pageSize}
            resourcePage={resourcePage}
            setResourcePage={setResourcePage}
            endResourceIndex={endResourceIndex}
          />
          <LogsTable
            paginatedLogs={paginatedLogs}
            logPage={logPage}
            setLogPage={setLogPage}
            pageSize={pageSize}
            endLogIndex={endLogIndex}
            logs={logs}
          />
        </>
      )}

      {activeTab === 'pending-requests' && (
        <PendingRequestsTab
          paginatedRequests={paginatedRequests}
          users={users}
          handleUserProfileClick={handleUserProfileClick}
          handleApprove={handleApprove}
          handleRejectClick={handleRejectClick}
          allRequests={allRequests}
          requestPage={requestPage}
          setRequestPage={setRequestPage}
          pageSize={pageSize}
          endRequestIndex={endRequestIndex}
        />
      )}

      {activeTab === 'downloads' && (
        <DownloadsTab
          paginatedDownloads={paginatedDownloads}
          users={users}
          handleUserProfileClick={handleUserProfileClick}
          downloads={downloads}
          downloadPage={downloadPage}
          setDownloadPage={setDownloadPage}
          pageSize={pageSize}
          endDownloadIndex={endDownloadIndex}
        />
      )}

      {activeTab === 'analytics-section' && (
        <AnalyticsTab barData={barData} pieData={pieData} />
      )}

      <RejectModal
        showRejectModal={showRejectModal}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleRejectSubmit={handleRejectSubmit}
        closeRejectModal={closeRejectModal}
      />

      <ConfirmModal
        showConfirmModal={showConfirmModal}
        pendingResource={pendingResource}
        confirmAddResource={confirmAddResource}
        cancelAddResource={cancelAddResource}
      />
    </div>
  );
};

export default AdminDashboard;
