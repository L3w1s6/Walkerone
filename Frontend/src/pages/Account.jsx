import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const navigate = useNavigate();
  
  // State variables
  const [isEditing, setIsEditing] = useState(false);
  const [isSelectingPfp, setIsSelectingPfp] = useState(false); // Controls the emoji menu
  
  const [bio, setBio] = useState('Loading...');
  const [username, setUsername] = useState('Walker');
  const [pfp, setPfp] = useState('👤'); // Default profile picture
  
  const userEmail = localStorage.getItem('userEmail');

  // The list of avatars 
  const availableEmojis = ['👤', '🦊', '🐻', '🦁', '🐸', '🐼', '🐯', '🐰', '🦅'];

  // Fetch the profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch(`http://${window.location.hostname}:8000/api/user/${userEmail}`);
        const data = await response.json();
        if (response.ok) {
          setUsername(data.username || 'Walker');
          setBio(data.bio || 'No bio added yet. Click edit to add one!');
          setPfp(data.pfp || '👤'); // Load the saved emoji!
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, [userEmail]);

  // Save the new Bio
  const handleSaveBio = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, bio: bio }),
      });
      if (response.ok) setIsEditing(false);
    } catch (err) {
      console.error("Failed to save bio:", err);
    }
  };

  // Save the new Profile Picture
  const handleSavePfp = async (selectedEmoji) => {
    setPfp(selectedEmoji); // Instantly change it on screen
    setIsSelectingPfp(false); // Close the menu
    
    try {
      await fetch(`http://${window.location.hostname}:8000/api/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, pfp: selectedEmoji }), // Send to DB
      });
    } catch (err) {
      console.error("Failed to save pfp:", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center p-6 mt-10 w-full animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 w-full max-w-sm border border-gray-50 text-center relative">
        
        {/* PROFILE PICTURE SECTION */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div 
            onClick={() => setIsSelectingPfp(!isSelectingPfp)}
            className="w-full h-full bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white cursor-pointer hover:bg-green-200 transition-colors"
            title="Click to change avatar!"
          >
            {pfp}
          </div>
          
          {/* THE EMOJI MENU (Pops up when clicking the picture) */}
          {isSelectingPfp && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-2xl p-3 z-10 w-48 grid grid-cols-3 gap-2">
              {availableEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSavePfp(emoji)}
                  className="text-2xl hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{username}</h2>
        
        {/* BIO SECTION */}
        <div className="mt-4 mb-8">
          {isEditing ? (
            <div className="space-y-3">
              <textarea 
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-sm"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
              />
              <button 
                onClick={handleSaveBio}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full"
              >
                Save Bio
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 italic text-sm px-4">"{bio}"</p>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-green-600 text-xs font-bold mt-2 hover:underline"
              >
                Edit Bio
              </button>
            </div>
          )}
        </div>

        {/* FRIENDS PLACEHOLDER */}
        <div className="w-full mb-8">
          <div className="bg-orange-50 p-4 rounded-2xl w-full">
            <p className="text-xs uppercase font-black text-orange-400 mb-1">Friends</p>
            <p className="text-2xl font-bold text-orange-700">0</p>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          className="w-full py-3 bg-red-50 text-red-500 hover:bg-red-100 font-black rounded-2xl transition-all border border-red-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}