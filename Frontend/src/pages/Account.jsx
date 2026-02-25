import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const navigate = useNavigate();
  
  // State variables
  const [isEditing, setIsEditing] = useState(false);
  const [isSelectingPfp, setIsSelectingPfp] = useState(false); // Controls the emoji menu
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  
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
        const response = await fetch(`/api/user/${userEmail}`);
        const data = await response.json();
        if (response.ok) {
          setUsername(data.username || 'Walker');
          setBio(data.bio || 'No bio added yet. Click edit to add one!');
          setPfp(data.pfp || '👤'); // Load the saved emoji!
          setFriendsList(data.friends || []);
          setPendingRequests(data.friendReq || []);
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
      const response = await fetch(`/api/user/update`, {
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
      await fetch(`/api/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, pfp: selectedEmoji }), // Send to DB
      });
    } catch (err) {
      console.error("Failed to save pfp:", err);
    }
  };

  // Search for a user
  const handleSearchUser = async () => {
    setSearchMessage('');
    setSearchResult(null);
    
    if (!searchQuery) return;

    try {
      const response = await fetch(`/getUserData?searchName=${searchQuery}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        setSearchMessage('User not found.');
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchMessage('Error searching for user.');
    }
  };

  //  Send the friend request
  const handleSendRequest = async () => {
    try {
      const response = await fetch(`/api/user/friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderEmail: userEmail, 
          targetUsername: searchResult.username 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSearchMessage(`Request sent to ${searchResult.username}!`);
        setSearchResult(null); // Clear the result after sending
        setSearchQuery(''); // Clear the search box
      } else {
        setSearchMessage(data.message || 'Failed to send request.');
      }
    } catch (err) {
      console.error("Request error:", err);
      setSearchMessage('Error sending request.');
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (senderUsername) => {
    try {
      const response = await fetch(`/api/user/accept-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, senderUsername }),
      });

      if (response.ok) {
        // Remove them from the inbox visually
        setPendingRequests(prev => prev.filter(name => name !== senderUsername));
        
        // Instantly add them to your live friends list!
        setFriendsList(prev => [...prev, senderUsername]); 
        
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
        // Remove them from the inbox visually
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

        {/* INBOX: PENDING REQUESTS */}
        {pendingRequests.length > 0 && (
          <div className="w-full mb-6">
            <p className="text-xs uppercase font-black text-blue-500 mb-2 text-left">
              Friend Requests ({pendingRequests.length})
            </p>
            <div className="space-y-2">
              {pendingRequests.map((senderName) => (
                <div key={senderName} className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <p className="font-bold text-gray-800 text-sm">@{senderName}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptRequest(senderName)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                    >
                      ✓ Accept
                    </button>
                    <button 
                      onClick={() => handleDeclineRequest(senderName)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIVE FRIENDS SECTION */}
        <div className="w-full mb-8">
          <div className="bg-orange-50 p-4 rounded-2xl w-full border border-orange-100 shadow-sm">
            <p className="text-xs uppercase font-black text-orange-400 mb-1">Friends</p>
            
            {/* The Live Count */}
            <p className="text-3xl font-black text-orange-700 mb-2">
              {friendsList.length}
            </p>

            {/* The Friend Preview List */}
            {friendsList.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-orange-200/50">
                {friendsList.slice(0, 3).map((friend) => (
                  <span key={friend} className="bg-orange-200 text-orange-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                    @{friend}
                  </span>
                ))}
                {friendsList.length > 3 && (
                  <span className="text-xs text-orange-500 font-bold self-center ml-1">
                    +{friendsList.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FRIENDS PLACEHOLDER */}
        <div className="w-full mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl w-full border border-gray-100">
            <p className="text-xs uppercase font-black text-gray-500 mb-2 text-left">Find Friends</p>
            
            {/* Search Bar */}
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="Search username..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-400"
              />
              <button 
                onClick={handleSearchUser}
                className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                Search
              </button>
            </div>

            {/* Feedback Message */}
            {searchMessage && <p className="text-xs font-bold text-center mt-2 text-blue-500">{searchMessage}</p>}

            {/* Display the Found User */}
            {searchResult && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{searchResult.pfp || '👤'}</div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800 text-sm">{searchResult.username}</p>
                  </div>
                </div>
                <button 
                  onClick={handleSendRequest}
                  className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-green-200"
                >
                  + Add
                </button>
              </div>
            )}
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