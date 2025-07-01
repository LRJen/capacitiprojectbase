import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onValue, ref as dbRef, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import Header from './Header';
import SearchBar from './SearchBar';
import Tabs from './Tabs';
import ResourcesTable from './ResourcesTable';
import Pagination from './Pagination';
import NotificationDropdown from './NotificationDropdown';
import ModalViewer from './ModalViewer';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('available');

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const pageSize = 5;
  const [resourcePage, setResourcePage] = useState(1);
  const [downloadPage, setDownloadPage] = useState(1);

  useEffect(() => {
    if (!user?.uid) return navigate('/auth');

    const totalFetches = 3;
    let completed = 0;

    const complete = () => {
      completed += 1;
      if (completed === totalFetches) setLoading(false);
    };

    const resourcesRef = dbRef(db, 'resources');
    const unsubscribeResources = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setResources(list);
      complete();
    });

    const requestsRef = query(dbRef(db, 'requests'), orderByChild('userId'), equalTo(user.uid));
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      const notificationList = list.map((req) => ({
        id: req.id,
        resourceId: req.resourceId,
        status: req.status,
        message: `${req.status === 'approved' ? '✅' : req.status === 'rejected' ? '❌' : '⏳'} Request for "${req.resourceId}"`,
        dismissible: true,
      }));
      setNotifications(notificationList);
      setUnreadCount(notificationList.length);
      complete();
    });

    const downloadsRef = dbRef(db, `userDownloads/${user.uid}`);
    const unsubscribeDownloads = onValue(downloadsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setDownloads(list);
      complete();
    });

    return () => {
      unsubscribeResources();
      unsubscribeRequests();
      unsubscribeDownloads();
    };
  }, [user?.uid, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  return (
    <div className="dashboard-container">
      <Header
        user={user}
        unreadCount={unreadCount}
        onProfileClick={() => navigate('/profile')}
        onLogout={handleLogout}
        toggleNotifications={() => setShowNotifications(!showNotifications)}
      />
      {showNotifications && (
        <NotificationDropdown
          notifications={notifications}
          dismissNotification={(id) =>
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }
          close={() => setShowNotifications(false)}
        />
      )}

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={resourceTypeFilter}
        setFilter={setResourceTypeFilter}
      />

      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableCount={resources.length}
        libraryCount={downloads.length}
        myResourcesCount={notifications.length}
      />

      <ResourcesTable
        activeTab={activeTab}
        resources={resources}
        notifications={notifications}
        downloads={downloads}
        searchQuery={searchQuery}
        filter={resourceTypeFilter}
        handleRequest={() => {}}
        handleCancelRequest={() => {}}
        handleDownloadOrAccess={(resource) => {
          setModalContent(resource);
          setShowModal(true);
        }}
      />

      <Pagination
        currentPage={activeTab === 'myLibrary' ? downloadPage : resourcePage}
        setPage={activeTab === 'myLibrary' ? setDownloadPage : setResourcePage}
        totalItems={
          activeTab === 'myLibrary' ? downloads.length : resources.length
        }
        pageSize={pageSize}
      />

      {showModal && (
        <ModalViewer content={modalContent} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
