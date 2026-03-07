import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';

export default function Account() {
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  
  const userEmail = localStorage.getItem('userEmail');

  // Fetch the profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch(`/api/user/${userEmail}`);
        const data = await response.json();
        if (response.ok) { // Load in profile info
          setFriendsList(data.friends || []);
          setPendingRequests(data.friendReq || []);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, [userEmail]);

  // Accept friend request
  const handleAcceptRequest = async (senderUsername) => {
    try {
      const response = await fetch(`/api/user/accept-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, senderUsername }),
      });

      if (response.ok) {
        setPendingRequests(prev => prev.filter(name => name !== senderUsername)); // Remove request from list of friend requests
        setFriendsList(prev => [...prev, senderUsername]); // Append user to list of friends 
        
        alert(`${senderUsername} is now your friend!`);
      } else {
        alert("Failed to accept the request.");
      }
    } catch (err) {
      console.error("Error accepting friend:", err);
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (senderUsername) => {
    try {
      const response = await fetch(`/api/user/decline-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, senderUsername }),
      });

      if (response.ok) {
        // Remove the declined request from the list of pending friend requests
        setPendingRequests(prev => prev.filter(name => name !== senderUsername));
      }
    } catch (err) {
      console.error("Error declining friend:", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  // Handle viewing a friend's profile
  const handleViewProfile = async (friendUsername) => {
    try {
      const response = await fetch(`/getUserData?searchName=${friendUsername}`);
      if (response.ok) {
        const data = await response.json();
        navigate(`/profile?email=${encodeURIComponent(data.email)}&username=${encodeURIComponent(data.username)}`);
      }
    } catch (err) {
      console.error("Error fetching friend data:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in">

      <div className="text-center mb-8 pt-6">
        <h1 className="text-4xl font-black text-green-700 mb-2">
          Account
        </h1>
        <p className="text-gray-600 font-medium">
          Manage your account!
        </p>
      </div>

      <Profile userEmail={userEmail} isOwnProfile={true} onSignOut={handleSignOut} onViewProfile={handleViewProfile} pendingRequests={pendingRequests} onAcceptRequest={handleAcceptRequest} onDeclineRequest={handleDeclineRequest}/>
    </div>
  );
}