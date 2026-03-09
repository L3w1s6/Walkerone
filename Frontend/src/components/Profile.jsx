import { useState, useEffect } from 'react';

export default function Profile({ userEmail, isOwnProfile = false, onSignOut, onViewProfile, pendingRequests, onAcceptRequest, onDeclineRequest}) {

    const profileEmail = userEmail || localStorage.getItem('userEmail'); // If userEmail is not provided, use current user's email from localStorage
    const loggedInUserEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType'); // Get type of logged in user (doctor or normal)
    const isDoctor = userType === 'doctor'; // Check if user is doctor
    const [isEditing, setIsEditing] = useState(false); // State for managing whether or not the user is editing their bio
    const [isSelectingPfp, setIsSelectingPfp] = useState(false); // State for managing whether or not the profile avatar menu is shown
    const [bio, setBio] = useState('Loading...');
    const [username, setUsername] = useState('Walker');
    const [pfp, setPfp] = useState('👤'); // Set default profile avatar
    const [friendsList, setFriendsList] = useState([]);
    const [friendsData, setFriendsData] = useState([]); // Store friends with their profile data
    const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
    const [friendshipChecked, setFriendshipChecked] = useState(isOwnProfile);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchMessage, setSearchMessage] = useState('');
    const availableAvatars = ['👤', '🦊', '🐻', '🦁', '🐸', '🐼', '🐯', '🐰', '🦅'];   // The list of avatars 

    /*
    * Using this instead of just the account page so that different types of profiles can be loaded with just some small changes in content,
    * Own profile: pfp (editable), username, bio (editable), friends list, friends search, sign out
    * Friend's profile: pfp, username, bio
    * Other user's profile: pfp, username, bio, add friend
    * Own profile (doctor): unchangable pfp, username, email, users search, sign out
    * 
    * Still need to add doctor and their users, and removing friends
    */


    // Fetch the profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileEmail) return;
            try {
                const response = await fetch(`/api/user/${profileEmail}`);
                const data = await response.json();
                if (response.ok) { // Load in profile info
                    setUsername(data.username || 'Walker');
                    setBio(data.bio || 'No bio added yet. Click below to add one!');
                    setPfp(data.pfp || '👤');
                    setFriendsList(data.friends || []);
                    return;
                }

                if (isOwnProfile && isDoctor) {
                    const doctorsResponse = await fetch('/getDoctors');
                    if (!doctorsResponse.ok) return;

                    const doctors = await doctorsResponse.json();
                    const doctor = doctors.find((doc) => doc.email === profileEmail); // Filter through doctors to find one currently logged in

                    if (doctor) {
                        setUsername(doctor.username || 'Doctor');
                        setPfp('🧑‍⚕️');
                    }
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };
        fetchProfile();
    }, [profileEmail, isOwnProfile, isDoctor]);

    // Fetch friends' profile data (avatar and username)
    useEffect(() => {
        const fetchFriendsData = async () => {
            if (!isOwnProfile || friendsList.length === 0) return;
            
            try {
                const friendsProfileData = await Promise.all(
                    friendsList.slice(0, 3).map(async (friendUsername) => {
                        try {
                            const response = await fetch(`/getUserData?searchName=${friendUsername}`);
                            if (response.ok) {
                                const data = await response.json();
                                return {
                                    username: data.username,
                                    pfp: data.pfp || '👤'
                                };
                            }
                        } catch (error) {
                            console.error(`Failed to fetch friend ${friendUsername}:`, error);
                        }
                        return { username: friendUsername, pfp: '👤' };
                    })
                );
                setFriendsData(friendsProfileData);
            } catch (error) {
                console.error("Failed to load friends data", error);
            }
        };
        fetchFriendsData();
    }, [friendsList, isOwnProfile]);

    // Check if the viewed user is in the logged in user's friend list 
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (isOwnProfile) {
                setFriendshipChecked(true);
                return;
            }

            setFriendshipChecked(false);

            try {
                const response = await fetch(`/api/user/${loggedInUserEmail}`); // Get the logged in user's details
                const data = await response.json();

                if (response.ok) {
                    const loggedInUserFriends = data.friends || [];
                    setIsAlreadyFriend(loggedInUserFriends.includes(username)); // Check whether the viewed user is in the logged in user's friend list
                }
            } catch (error) {
                console.error("Failed to check friendship status", error);
            } finally {
                setFriendshipChecked(true);
            }
        };

        fetchCurrentUser();
    }, [isOwnProfile, loggedInUserEmail, username]);

    // Handle saving bio edits when on own profile
    const handleSaveBio = async () => {
        try {
            const response = await fetch(`/api/user/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profileEmail, bio: bio }), // Send updated bio
            });
            if (response.ok) {
                setIsEditing(false); // No longer editing bio
            }
        } catch (err) {
            console.error("Failed to save bio:", err);
        }
    };

    // Handle saving profile picture changes when on own profile
    const handleSavePfp = async (selectedEmoji) => {
        setPfp(selectedEmoji); // Set profile picture to selected avatar
        setIsSelectingPfp(false); // Close the menu
        
        try {
            await fetch(`/api/user/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profileEmail, pfp: selectedEmoji }), // Send updated profile to DB
            });
        } catch (err) {
            console.error("Failed to save pfp:", err);
        }
    };

    // Search for a user by username or email
    const handleSearchUser = async () => {
        setSearchMessage('');
        setSearchResult(null);
        
        if (!searchQuery) return;

        try {
            const queryParam = isDoctor && isOwnProfile // Doctors can search for users via email, regular users can by username
                ? `searchEmail=${searchQuery}` 
                : `searchName=${searchQuery}`;
            const response = await fetch(`/getUserData?${queryParam}`);
            
            if (response.ok) {
                const data = await response.json();
                setSearchResult(data); // Update search result with found user
            } else {
                setSearchMessage('User not found.');
            }
        } catch (err) {
            console.error("Search error:", err);
            setSearchMessage('Error searching for user.');
        }
    };

    // Send friend request from a user's profile
    const handleSendViewedProfileRequest = async () => {
        try {
            const response = await fetch(`/api/user/friend-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail: loggedInUserEmail,
                    targetUsername: username, // User to send request to
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Failed to send request.');
            }
        } catch (err) {
            console.error("Request error:", err);
            alert('Error sending request.');
        }
    };

    return (
        <div className="bg-white rounded-4xl shadow-xl p-8 w-full max-w-sm border border-gray-50 text-center relative mb-6">
      
            {/* User's avatar, only editable when on own profile */}
            <div className="relative w-24 h-24 mx-auto mb-4">
                <span onClick={() => isOwnProfile && setIsSelectingPfp(!isSelectingPfp)}
                    className={`w-full h-full bg-green-100 text-green-600 rounded-full select-none flex items-center justify-center text-5xl shadow-inner border-4 border-white ${isOwnProfile && !isDoctor ? 'cursor-pointer hover:bg-green-200 transition-colors' : ''}`}>
                    {pfp}
                </span>
                {/* Menu containing user avatar options */}
                {isOwnProfile && isSelectingPfp && !isDoctor && (
                    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-2xl p-3 z-10 w-48 grid grid-cols-3 gap-2">
                        {availableAvatars.map((avatar) => (
                            <button key={avatar} onClick={() => handleSavePfp(avatar)} className="text-2xl hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer">
                                {avatar}
                            </button>
                        ))}
                    </div>
                )}
            </div>

        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{username}</h2>
        
        {/* Display doctor email if viewing doctor profile */}
        {isDoctor && (
            <p className="text-sm text-gray-500 mb-4">{profileEmail}</p>
        )}
      
            {/* User's bio (change to text area while editing) if on own profile */}
            { !isDoctor &&
            <div className="mt-4 mb-8">
                {isOwnProfile && isEditing ? (
                    <div className="space-y-3">
                        <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows="3" className="w-full p-3 border rounded-xl bg-gray-50  outline-none text-sm"/>
                        <button onClick={handleSaveBio} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full cursor-pointer">
                            Save Bio
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500 italic text-sm px-4">
                            {bio}
                        </p>
                        {isOwnProfile && (
                            <button onClick={() => setIsEditing(true)} className="text-green-600 text-xs font-bold mt-2 hover:underline cursor-pointer">
                                Edit Bio
                            </button>
                        )}
                    </div>
                )}
            </div>
            }

            {/* Show list of pending friend requests if on own profile */}
            {isOwnProfile && pendingRequests && pendingRequests.length > 0 && !isDoctor && (
                <div className="w-full mb-6">
                    <p className="text-xs uppercase font-black text-blue-500 mb-2 text-left">
                        Friend Requests ({pendingRequests.length})
                    </p>
                    <div className="space-y-2">
                        {pendingRequests.map((senderName) => (
                            <div key={senderName} className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                                <p className="font-bold text-gray-800 text-sm">
                                    {senderName}
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => onAcceptRequest && onAcceptRequest(senderName)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer">
                                        ✓ Accept
                                    </button>
                                    <button onClick={() => onDeclineRequest && onDeclineRequest(senderName)} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors cursor-pointer">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends list, only showed on own profile */}
            {isOwnProfile && !isDoctor && (
                <div className="w-full mb-8">
                    <div className="bg-green-100 p-4 rounded-2xl w-full border border-green-100 shadow-sm">
                        <p className="text-xs uppercase font-black text-green-400 mb-1">
                            Friends
                        </p>
                        <p className="text-3xl font-black text-green-700 mb-2">
                            {friendsList.length}
                        </p>

                        {friendsList.length > 0 && ( // Only show list if the user has friends
                            <div className="flex flex-col gap-2 justify-center mt-3 pt-3 border-t border-green-200/50">
                                {friendsData.map((friend) => (
                                    <button key={friend.username} onClick={() => onViewProfile && onViewProfile(friend.username)} className="w-full p-3 bg-cyan-100 rounded-xl flex items-center justify-between shadow-sm cursor-pointer transition hover:bg-cyan-200 hover:scale-105">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{friend.pfp}</span>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-800 text-lg">{friend.username}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-400 text-xs font-bold">View →</span>
                                    </button>
                                ))}
                                {friendsList.length > 3 && (
                                    <span className="text-xs text-green-500 font-bold self-center ml-1">
                                        +{friendsList.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Friend button, only shown if not on own profile and not already friends */}
            {!isOwnProfile && friendshipChecked && !isAlreadyFriend && profileEmail !== loggedInUserEmail && !isDoctor && (
                <button onClick={handleSendViewedProfileRequest} className="w-full py-3 bg-green-50 text-green-600 hover:bg-green-100 font-black rounded-2xl transition-all border border-green-100 cursor-pointer mb-8">
                    + Add Friend
                </button>
            )}

            {/* Search for friends, only show on own profile */}
            {isOwnProfile && !isDoctor && (
                <div className="w-full mb-8">
                    <div className="bg-gray-50 p-4 rounded-2xl w-full border border-gray-100">
                        <p className="text-xs uppercase font-black text-gray-500 mb-2 text-left">
                            Find Friends
                        </p>
                        
                        {/* Search bar */}
                        <div className="flex gap-2 mb-2">
                            <input type="text" placeholder="Search username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-400"/>
                            <button onClick={handleSearchUser} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                                Search
                            </button>
                        </div>

                        {searchMessage && <p className="text-xs font-bold text-center mt-2 text-blue-500">{searchMessage}</p>}

                        {/* Display the found user */}
                        {searchResult && (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onViewProfile && onViewProfile(searchResult.username)}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{searchResult.pfp || '👤'}</span>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800 text-sm">{searchResult.username}</p>
                                    </div>
                                </div>
                                <span className="text-gray-400 text-xs font-bold">View →</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Search for users by email, only show on own profile if doctor */}
            {isOwnProfile && isDoctor && (
                <div className="w-full mb-8">
                    <div className="bg-gray-50 p-4 rounded-2xl w-full border border-gray-100">
                        <p className="text-xs uppercase font-black text-gray-500 mb-2 text-left">
                            Find Users
                        </p>
                        
                        {/* Search bar */}
                        <div className="flex gap-2 mb-2">
                            <input type="email" value={searchQuery}  onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by email..." className="flex-1 p-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-400"/>
                            <button onClick={() => handleSearchUser()} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                                Search
                            </button>
                        </div>

                        {searchMessage && <p className="text-xs font-bold text-center mt-2 text-blue-500">{searchMessage}</p>}

                        {/* Display the found user */}
                        {searchResult && (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onViewProfile && onViewProfile(searchResult.username)}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{searchResult.pfp || '👤'}</span>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800 text-sm">{searchResult.username}</p>
                                        <p className="text-xs text-gray-500">{searchResult.email}</p>
                                    </div>
                                </div>
                                <span className="text-gray-400 text-xs font-bold">View →</span>
                            </div>
                        )}
                    </div>
                </div>
            )}



            {/* Sign out button if on own profile */}
            {isOwnProfile && (
                <button onClick={() => onSignOut && onSignOut()} className="w-full py-3 bg-red-100 text-red-500 hover:bg-red-200 font-black rounded-2xl transition-all border border-red-100 cursor-pointer">
                    Sign Out
                </button>
            )}
        </div>
    );
}