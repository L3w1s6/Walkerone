import { useSearchParams, useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';

export default function FriendProfile() { // Used for searched for users too
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const friendEmail = searchParams.get('email');
  const friendUsername = searchParams.get('username');

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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-center mb-8 pt-6">
        <h1 className="text-4xl font-black text-green-700 mb-2">
          {friendUsername ? `${friendUsername}'s profile` : 'Profile'}
        </h1>
        <button onClick={() => navigate('/account')} className="text-green-600 text-sm font-bold hover:underline cursor-pointer">
          ← Back to Account
        </button>
      </div>

      {friendEmail ? (
        <Profile userEmail={friendEmail} isOwnProfile={false} onViewProfile={handleViewProfile}/>
      ) : (
        <div className="text-center text-gray-600">
          <p>No profile to display</p>
        </div>
      )}
    </div>
  );
}
