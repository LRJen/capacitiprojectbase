import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, User, X, House } from 'lucide-react';
import '../styles/Dashboard.css';
import logo from '../assets/logo.png';
import { ref as dbRef, onValue, push, remove, set, query, orderByChild, equalTo } from 'firebase/database';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const pageSize = 5;
  const [resourcePage, setResourcePage] = useState(1);
  const [downloadPage, setDownloadPage] = useState(1);

  useEffect(() => {
    if (!user || !user.uid) {
      console.log('Dashboard - No user available');
      setLoading(false);
      navigate('/auth');
      return;
    }

    console.log('Dashboard - Starting fetches for UID:', user.uid);
    setLoading(true);

    let fetchesCompleted = 0;
    const totalFetches = 3;

    const checkAllFetchesComplete = () => {
      fetchesCompleted += 1;
      console.log(`Dashboard - Fetch completed, progress: ${fetchesCompleted}/${totalFetches}`);
      if (fetchesCompleted === totalFetches) {
        console.log('Dashboard - All fetches complete');
        setLoading(false);
      }
    };

    const resourcesRef = dbRef(db, 'resources');
    const resourcesUnsubscribe = onValue(
      resourcesRef,
      (snapshot) => {
        console.log('Dashboard - Resources snapshot received:', snapshot.exists());
        const data = snapshot.val();
        const resourceList = data
          ? Object.entries(data).map(([id, value]) => ({
              id,
              title: value.title || 'Untitled',
              description: value.description || '',
              type: value.type || 'unknown',
              content: value.content || '',
              status: value.status || 'available',
              createdAt: value.createdAt || '',
            }))
          : [];
        setResources(resourceList);
        console.log('Dashboard - Resources fetched:', resourceList.length);
        checkAllFetchesComplete();
      },
      (error) => {
        console.error('Dashboard - Resources fetch error:', error);
        setError('Failed to fetch resources: ' + error.message);
        checkAllFetchesComplete();
      }
    );

    const requestsRef = query(dbRef(db, 'requests'), orderByChild('userId'), equalTo(user.uid));
    const requestsUnsubscribe = onValue(
      requestsRef,
      (snapshot) => {
        console.log('Dashboard - Requests snapshot received:', snapshot.exists());
        const data = snapshot.val();
        const requestList = data
          ? Object.entries(data).map(([id, value]) => {
              const resource = resources.find((r) => r.id === value.resourceId) || { title: value.resourceId };
              const baseMessage = `Request for "${resource.title}"`;
              let message = baseMessage;
              if (value.status === 'approved') {
                message = `${baseMessage} approved`;
              } else if (value.status === 'rejected') {
                message = `${baseMessage} rejected${value.rejectionReason ? `: ${value.rejectionReason}` : ''}`;
              } else {
                message = `User requested "${resource.title}"`;
              }
              return {
                id,
                resourceId: value.resourceId,
                message: `${message} (${new Date(value.timestamp).toLocaleTimeString()})`,
                status: value.status,
                dismissible: true,
              };
            })
          : [];
        setNotifications(requestList);
        setUnreadCount(requestList.length);
        console.log('Dashboard - Requests fetched:', requestList.length);
        checkAllFetchesComplete();
      },
      (error) => {
        console.error('Dashboard - Requests fetch error:', error);
        setError('Failed to fetch requests: ' + error.message);
        checkAllFetchesComplete();
      }
    );

    const downloadsRef = dbRef(db, `userDownloads/${user.uid}`);
    const downloadsUnsubscribe = onValue(
      downloadsRef,
      (snapshot) => {
        console.log('Dashboard - Downloads snapshot received:', snapshot.exists());
        const data = snapshot.val();
        const downloadList = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
        setDownloads(downloadList);
        console.log('Dashboard - Downloads fetched:', downloadList.length);
        checkAllFetchesComplete();
      },
      (error) => {
        console.error('Dashboard - Downloads fetch error:', error);
        setError('Failed to fetch downloads: ' + error.message);
        checkAllFetchesComplete();
      }
    );

    return () => {
      console.log('Dashboard - Cleaning up');
      resourcesUnsubscribe();
      requestsUnsubscribe();
      downloadsUnsubscribe();
    };
  }, [user?.uid, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      setError('Logout failed: ' + error.message);
    }
  };

  const handleProfileClick = () => {
    console.log('Dashboard - Navigating to profile for UID:', user.uid);
    navigate('/profile');
  };

  const handleRequest = async (resourceId) => {
    try {
      const resource = resources.find((r) => r.id === resourceId);
      const request = {
        userId: user.uid,
        resourceId,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
      const newRequestRef = await push(dbRef(db, 'requests'), request);
      setNotifications((prev) => [
        ...prev,
        {
          id: newRequestRef.key,
          resourceId,
          message: `User requested "${resource ? resource.title : resourceId}" (${new Date().toLocaleTimeString()})`,
          status: 'pending',
          dismissible: true,
        },
      ]);
      setUnreadCount((prev) => prev + 1);
    } catch (error) {
      setError('Failed to request resource: ' + error.message);
    }
  };

  const handleCancelRequest = async (requestId, resourceId) => {
    try {
      await remove(dbRef(db, `requests/${requestId}`));
      setNotifications((prev) => prev.filter((notif) => notif.id !== requestId));
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      setError('Failed to cancel request: ' + error.message);
    }
  };

  const handleDownloadOrAccess = async (resource, isFromLibrary = false) => {
    try {
      if (isFromLibrary) {
        setModalContent(resource);
        setShowModal(true);
      } else {
        if (resource.type === 'pdf') {
          const link = document.createElement('a');
          link.href = resource.content;
          link.download = `${resource.title}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          window.open(resource.content, '_blank');
        }
        const downloadData = {
          title: resource.title,
          type: resource.type,
          content: resource.content,
          downloadedAt: new Date().toISOString(),
        };
        await set(dbRef(db, `userDownloads/${user.uid}/${resource.id}`), downloadData);
        await push(dbRef(db, 'downloads'), {
          userId: user.uid,
          resourceId: resource.id,
          title: resource.title,
          timestamp: new Date().toISOString(),
        });
        setNotifications((prev) => prev.filter((notif) => notif.resourceId !== resource.id));
        setDownloads((prev) => {
          const updatedDownloads = [...prev, { id: resource.id, ...downloadData }];
          return updatedDownloads.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
        });
      }
    } catch (error) {
      setError('Failed to handle resource: ' + error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const dismissNotification = (notifId) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notifId));
    setUnreadCount((prev) => prev - 1);
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  const applyTypeFilter = (resourcesList) => {
    if (resourceTypeFilter === 'all') return resourcesList;
    return resourcesList.filter((resource) => resource.type === resourceTypeFilter);
  };

  const filteredAvailableResources = applyTypeFilter(
    resources.filter((resource) => {
      const matchesStatus = resource.status === 'available';
      const hasPendingOrApproved = notifications.some(
        (notif) => notif.resourceId === resource.id && (notif.status === 'pending' || notif.status === 'approved')
      );
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && !hasPendingOrApproved && matchesSearch;
    })
  );

  const filteredPendingResources = applyTypeFilter(
    resources.filter((resource) =>
      notifications.some((notif) => notif.resourceId === resource.id && notif.status === 'pending') &&
      resource.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredApprovedResources = applyTypeFilter(
    resources.filter((resource) =>
      notifications.some((notif) => notif.resourceId === resource.id && notif.status === 'approved') &&
      resource.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredLibraryResources = applyTypeFilter(
    downloads.filter((download) =>
      download.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredRejectedResources = applyTypeFilter(
    resources.filter((resource) =>
      notifications.some((notif) => notif.resourceId === resource.id && notif.status === 'rejected') &&
      resource.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const paginateResources = (resourceList, page) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return resourceList.slice(startIndex, endIndex);
  };

  const displayedAvailableResources = paginateResources(filteredAvailableResources, resourcePage);
  const displayedPendingResources = paginateResources(filteredPendingResources, resourcePage);
  const displayedApprovedResources = paginateResources(filteredApprovedResources, resourcePage);
  const displayedRejectedResources = paginateResources(filteredRejectedResources, resourcePage);
  const displayedLibraryResources = paginateResources(filteredLibraryResources, downloadPage);

  const renderPagination = (totalItems, currentPage, setPage) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="page-button"
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          Previous
        </button>
        {pages}
        {endPage < totalPages && <span className="pagination-ellipsis">...</span>}
        {totalPages > maxVisiblePages && (
          <button
            className="page-button"
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </button>
        )}
        <button
          className="page-button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
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
      <header className="header">
        <Link to="/" className="logo">
          <img src={logo} className="logo" alt="CAPACITI logo" />
        </Link>
        <h1 className="title">Resource Hub Dashboard</h1>
        <div className="user-controls">
          <button className="notification-button" onClick={() => navigate('/')}>
            <House size={24} />
          </button>
          <button className="notification-button" onClick={toggleNotifications}>
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="close-card-button" onClick={closeNotifications}>
                  <X size={16} />
                </button>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="notification-item">
                    <span>{notif.message}</span>
                    {notif.dismissible && (
                      <button
                        className="dismiss-button"
                        onClick={() => dismissNotification(notif.id)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="notification-item">No notifications</div>
              )}
            </div>
          )}
          <button className="user-button" onClick={handleProfileClick}>
            <User size={24} /> <p>Username: {user.name}</p>
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={resourceTypeFilter}
          onChange={(e) => setResourceTypeFilter(e.target.value)}
          className="type-filter"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDFs</option>
          <option value="training">Training Materials</option>
          <option value="course">Courses</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'available' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('available');
            setResourcePage(1);
          }}
        >
          All Available Resources ({filteredAvailableResources.length})
        </button>
        <button
          className={`tab ${activeTab === 'myResources' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('myResources');
            setResourcePage(1);
          }}
        >
          My Resources ({filteredPendingResources.length + filteredApprovedResources.length + filteredRejectedResources.length})
        </button>
        <button
          className={`tab ${activeTab === 'myLibrary' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('myLibrary');
            setDownloadPage(1);
          }}
        >
          My Library ({filteredLibraryResources.length})
        </button>
      </div>

      <div className="resources-table">
        <h2>
          {activeTab === 'available' ? 'Available Resources' : 
           activeTab === 'myResources' ? 'My Resources' : 'My Library'}
        </h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              {activeTab !== 'available' && <th>File/Action</th>}
              {(activeTab === 'available' || activeTab === 'myResources') && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'available' ? displayedAvailableResources : 
              activeTab === 'myResources' ? [...displayedPendingResources, ...displayedApprovedResources, ...displayedRejectedResources] : displayedLibraryResources).map((resource) => {
              const pendingRequest = notifications.find((notif) => notif.resourceId === resource.id && notif.status === 'pending');
              const approvedRequest = notifications.find((notif) => notif.resourceId === resource.id && notif.status === 'approved');
              const rejectedRequest = notifications.find((notif) => notif.resourceId === resource.id && notif.status === 'rejected');
              return (
                <tr key={resource.id}>
                  <td>{resource.title}</td>
                  <td>{resource.description}</td>
                  <td>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</td>
                  <td>
                    {activeTab === 'myResources' && pendingRequest ? 'Pending' : 
                     activeTab === 'myResources' && approvedRequest ? 'Approved' : 
                     activeTab === 'myResources' && rejectedRequest ? 'Rejected' :
                     activeTab === 'myLibrary' ? 'Downloaded' : 
                     resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                  </td>
                  {activeTab !== 'available' && (
                    <td>
                      {(approvedRequest || activeTab === 'myLibrary') ? (
                        <button
                          className="action-button"
                          onClick={() => handleDownloadOrAccess(resource, activeTab === 'myLibrary')}
                        >
                          {activeTab === 'myLibrary' ? 'View' : (resource.type === 'pdf' ? 'Download PDF' : 'Access Link')}
                        </button>
                      ) : '-'}
                    </td>
                  )}
                  {(activeTab === 'available' || activeTab === 'myResources') && (
                    <td>
                      {pendingRequest ? (
                        <button
                          className="action-button cancel-button"
                          onClick={() => handleCancelRequest(pendingRequest.id, resource.id)}
                        >
                          Cancel Request
                        </button>
                      ) : activeTab === 'available' ? (
                        <button
                          className="action-button"
                          disabled={resource.status !== 'available'}
                          onClick={() => handleRequest(resource.id)}
                        >
                          Request
                        </button>
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {activeTab === 'myLibrary'
          ? renderPagination(filteredLibraryResources.length, downloadPage, setDownloadPage)
          : renderPagination(
              activeTab === 'available' ? filteredAvailableResources.length : (filteredPendingResources.length + filteredApprovedResources.length + filteredRejectedResources.length),
              resourcePage,
              setResourcePage
            )}
      </div>

      {showModal && modalContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '800px',
            height: '80%',
            position: 'relative',
            overflow: 'auto',
          }}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#70bdf4',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <h3>{modalContent.title}</h3>
            {modalContent.type === 'pdf' ? (
              <iframe
                src={modalContent.content}
                width="100%"
                height="90%"
                title={modalContent.title}
                style={{ border: 'none' }}
              />
            ) : (
              <a href={modalContent.content} target="_blank" rel="noopener noreferrer">
                Open Link
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;