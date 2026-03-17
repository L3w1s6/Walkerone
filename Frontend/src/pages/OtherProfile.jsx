import { useSearchParams, useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';

export default function OtherProfile() {
  const userType = localStorage.getItem('userType'); // Get type of logged in user (doctor or normal)
  const isDoctor = userType === 'doctor'; // Check if user is doctor
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const friendEmail = searchParams.get('email');
  const friendUsername = searchParams.get('username');
  const userEmail = localStorage.getItem('userEmail');

  // Fetch friend's email and navigate to their profile page
  const handleViewProfile = (friendUsername) => {
    const fetchAndNavigate = async () => {
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
    fetchAndNavigate();
  };

  // Remove friend function
  const handleRemoveFriend = async (friendUsername) => {
    if (!confirm(`Remove ${friendUsername} from your friends?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/user/remove-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, friendUsername }),
      });

      if (response.ok) {
        alert(`${friendUsername} has been removed from your friends.`);
        navigate('/account');
      } else {
        alert("Failed to remove friend.");
      }
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-center mb-8 pt-6">
        <h1 className="text-4xl font-black text-green-700 mb-2">
          {friendUsername ? `${friendUsername}'s profile` : 'Profile'}
        </h1>
        {!isDoctor &&
        <button onClick={() => navigate('/account')} className="text-green-600 text-sm font-bold hover:underline cursor-pointer">
          ← Back to Account
        </button>
        }
        {isDoctor &&
        <button onClick={() => navigate('/assignedUsers')} className="text-green-600 text-sm font-bold hover:underline cursor-pointer">
          ← Back to Assigned Users
        </button>
        }
      </div>

      {friendEmail ? (
        <Profile 
          userEmail={friendEmail} 
          isOwnProfile={false} 
          onViewProfile={handleViewProfile}
          onRemoveFriend={handleRemoveFriend}
        />
      ) : (
        <div className="text-center text-gray-600">
          <p>No profile to display</p>
        </div>
      )}
    </div>
  );
}