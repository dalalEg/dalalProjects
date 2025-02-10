// ProfilePage.jsx
'use client';

import { useState, useEffect } from 'react';
import ProfileCard from './components/ProfileCard';
import EditProfileForm from './components/EditProfileForm';
import styles from './profile/Profile.module.css';

const ProfilePage = () => {
  const [userId, setUserId] = useState(1);
  const [displayId, setDisplayId] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data whenever userId changes
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSave = async (updatedUser) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${displayId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedData = await response.json();
      setUser(updatedData); // Update local user state with the latest data
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      console.error('Failed to update user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false); // Exit edit mode without saving
  };

  const handleUserIdChange = (e) => {
    setDisplayId(Number(e.target.value))
    setUserId(Number(e.target.value)-1);
    setIsEditing(false); // Exit edit mode if a different user is selected
  };

  return (
    <div className={styles.container}>
      <h1>User Profile</h1>

      {/* User ID Selection */}
      <div className={styles.selector}>
        <label htmlFor="userId">Select User ID:</label>
        <select id="userId" value={displayId} onChange={handleUserIdChange}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>

      {/* Loading and Error States */}
      {loading && <p>Loading user data...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      {/* Display User Profile */}
      {user && !isEditing && (
        <ProfileCard user={user} onEdit={() => setIsEditing(true)} />
      )}

      {/* Edit Profile Form */}
      {isEditing && user && (
        <EditProfileForm user={user} onSave={handleSave} onCancel={handleCancel} />
      )}
    </div>
  );
};

export default ProfilePage;
