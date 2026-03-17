import { useState, useEffect } from "react";
import Task from "./Task";
import CreateTaskMenu from "./CreateTaskMenu";
import PrevRoute from "./Route";

export default function Profile({ userEmail, isOwnProfile = false, onSignOut, onViewProfile, onRemoveFriend, pendingRequests, onAcceptRequest, onDeclineRequest, pendingDoctorRequests, onAcceptDoctorRequest, onDeclineDoctorRequest}) {

    const profileEmail = userEmail || localStorage.getItem("userEmail"); // If userEmail is not provided, use current user's email from localStorage
    const loggedInUserEmail = localStorage.getItem('userEmail'); // Get email of logged in user
    const userType = localStorage.getItem('userType'); // Get type of logged in user (doctor or normal)
    const isDoctor = userType === 'doctor'; // Check if user is doctor
    const availableAvatars = ['👤', '🦊', '🐻', '🦁', '🐸', '🐼', '🐯', '🐰', '🦅'];   // The list of avatars 
    const [isEditing, setIsEditing] = useState(false); // State for managing whether or not the user is editing their bio
    const [isSelectingPfp, setIsSelectingPfp] = useState(false); // State for managing whether or not the profile avatar menu is shown
    const [bio, setBio] = useState('Loading...'); // State for the viewed profile's bio
    const [username, setUsername] = useState('Walker'); // State for the viewed profile's username
    const [pfp, setPfp] = useState('👤'); // State for the viewed profile's avatar
    const [friendsList, setFriendsList] = useState([]); // State for logged in user's friends list
    const [friendsData, setFriendsData] = useState([]); // State for storing friends with their profile data
    const [addingFriend, setAddingFriend] = useState(false); // State for checking whether or not the user is adding a friend
    const [isAlreadyFriend, setIsAlreadyFriend] = useState(false); // Check for if already friends with a user
    const [friendshipChecked, setFriendshipChecked] = useState(isOwnProfile); // State that manages whether or not friendship has been checked, stops stuff being shown if there was an error with checking
    const [isAssignedUser, setIsAssignedUser] = useState(false); // Check for if the user is assigned to the logged in doctor
    const [assignedChecked, setAssignedChecked] = useState(!isDoctor); // State that manages whether or not user assignment has been checked, stops stuff being shown if there was an error with checking
    const [assignedDoctor, setAssignedDoctor] = useState(null); // State for a user's assigned doctor
    const [searchQuery, setSearchQuery] = useState(''); // State for managing the typed username/email
    const [searchResult, setSearchResult] = useState(null); // State containing the user showed after a search
    const [searchMessage, setSearchMessage] = useState(''); // State for erorr messages when searching
    const [assignedUserTasks, setAssignedUserTasks] = useState([]); // State containing the list of the viewed profile's assigned tasks
    const [showCreate, setShowCreate] = useState(false); // State for showing/hiding the creation menu
    const [taskName, setTaskName] = useState(''); // State for task name when assigning one
    const [taskDescription, setTaskDescription] = useState(''); // State for task description when assigning one
    const [taskDate, setTaskDate] = useState(''); // State for task completion date when assigning one
    const [viewedUserRecentRoutes, setViewedUserRecentRoutes] = useState([]); // State for the viewed friend's recent routes

    /*
    * Using this instead of just the account page so that different types of profiles can be loaded with just some small changes in content,
    * Own profile: pfp (editable), username, bio (editable), friends list, friends search, sign out
    * Friend's profile: pfp, username, bio
    * Other user's profile: pfp, username, bio, add friend
    * Own profile (doctor): unchangable pfp, username, email, users search, sign out
    * Assigned user's profile: pfp, username, email, list of assigned tasks, option to assign task
    * 
    * Still need to add removing friends and being able to see/change email and password etc
    */


    // Fetch data for currently viewed profile by email
    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileEmail) {
                return;
            }
            try {
                const response = await fetch(`/api/user/${profileEmail}`);
                const data = await response.json();
                if (response.ok) { // Load in profile data
                    setUsername(data.username || 'Walker');
                    setBio(data.bio || 'No bio added yet. Click below to add one!');
                    setPfp(data.pfp || '👤');
                    setFriendsList(data.friends || []);
                    return;
                }

                if (isOwnProfile && isDoctor) {
                    const doctorsResponse = await fetch('/getDoctors');
                    if (!doctorsResponse.ok) {
                        return;
                    }
                    const doctors = await doctorsResponse.json();
                    const doctor = doctors.find((doc) => doc.email === profileEmail); // Filter through doctors to find one currently logged in

                    if (doctor) {
                        setUsername(doctor.username || 'Doctor');
                        setPfp('🧑‍⚕️'); // Default avatar for doctors
                    }
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };
        fetchProfile();
    }, [profileEmail, isOwnProfile, isDoctor]);

    // Fetch friends' profile data (avatar and username) for displaying in friends list
    useEffect(() => {
        const fetchFriendsData = async () => {
            if (!isOwnProfile || friendsList.length === 0) { // Return if user has no friends or isn't on their own profile
                return;
            }
            try {
                const friendsProfileData = await Promise.all(
                    friendsList.slice(0, 3).map(async (friendUsername) => { // Friends list shows friends in groups of 3, so only need to load 3 at a time
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

    // Check if viewed user is already assigned to the logged in doctor
    useEffect(() => {
        const fetchAssignedStatus = async () => {
            if (!isDoctor || isOwnProfile || profileEmail === loggedInUserEmail) { // Can't assign yourself 
                setIsAssignedUser(false);
                setAssignedChecked(true);
                return;
            }

            setAssignedChecked(false);

            try {
                const response = await fetch('/getDoctors');
                if (!response.ok) {
                    setAssignedChecked(true);
                    return;
                }

                const doctors = await response.json();
                const currentDoctor = doctors.find((doc) => doc.email === loggedInUserEmail);
                const assignedEmails = currentDoctor?.userEmails || [];
                setIsAssignedUser(assignedEmails.includes(profileEmail)); // Check whether doctor's list of assigned users includes currently viewed profile
            } catch (error) {
                console.error('Failed to check assigned status', error);
            } finally {
                setAssignedChecked(true);
            }
        };
        fetchAssignedStatus();
    }, [isDoctor, isOwnProfile, profileEmail, loggedInUserEmail]);

    // If a normal user is assigned to a doctor, show that doctor on their own profile
    useEffect(() => {
        const fetchAssignedDoctor = async () => {
            if (!isOwnProfile || isDoctor || !profileEmail) {
                setAssignedDoctor(null);
                return;
            }
            try {
                const response = await fetch('/getDoctors');
                if (!response.ok) {
                    setAssignedDoctor(null);
                    return;
                }
                const doctors = await response.json();
                const doctor = doctors.find((doc) => (doc.userEmails || []).includes(profileEmail)); // Check if user email is included in a doctor's list of assigned users
                if (!doctor) { // if a doctor couldn't be found with the email in their list
                    setAssignedDoctor(null);
                    return;
                }
                setAssignedDoctor({ // Update assigned doctor
                    username: doctor.username || 'Doctor',
                    email: doctor.email || ''
                });
            } catch (error) {
                console.error('Failed to fetch assigned doctor', error);
                setAssignedDoctor(null);
            }
        };
        fetchAssignedDoctor();
    }, [isOwnProfile, isDoctor, profileEmail]);

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

    // Send doctor assignment request from a user's profile
    const handleSendDoctorAssignmentRequest = async () => {
        try {
            const response = await fetch(`/addUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail: loggedInUserEmail,
                    targetUsername: username, // User to send request to
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Failed to send doctor request.');
                return;
            }

            alert(`Doctor request sent to ${username}.`);
        } catch (err) {
            console.error('Doctor request error:', err);
            alert('Error sending doctor request.');
        }
    };

    // Show task create menu when assign task button is pressed
    const createTask = () => {
        setShowCreate(true);
    };

    // Get assigned tasks for the assigned user's profile being viewed
    const fetchAssignedUserTasks = async () => {
        if (!isAssignedUser || isOwnProfile || !profileEmail) {
            setAssignedUserTasks([]); // Reset assigned tasks to blank if viewing own profile or a non assigned user
            return;
        }

        try {
            const response = await fetch(`/getTasks?email=${encodeURIComponent(profileEmail)}`); // Get all tasks for assigned user
            if (response.ok) {
                const tasks = await response.json();
                const filtered = tasks.filter((task) => task.assignedBy === loggedInUserEmail);  // Filter for tasks assigned by the logged in doctor
                setAssignedUserTasks(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch assigned user tasks', error);
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (taskName.trim()) { // If there's a task name
            const newTask = {name: taskName, description: taskDescription, completionDate: taskDate, completed: false, email: profileEmail, assignedBy: loggedInUserEmail};

            try {
                const response = await fetch('/addTask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTask)
                });

                if (!response.ok) {
                    alert('couldnt add task');
                    return;
                }

                await response.json();
                await fetchAssignedUserTasks();
                setTaskName(''); // Reset task name, description and date and hide the creation menu
                setTaskDescription('');
                setTaskDate('');
                setShowCreate(false);
                alert('added task');
            } catch (err) {
                alert(err);
            }
        }
    };

    // Get the 3 most recent routes for the viewed user, if they are your friend
    useEffect(() => {
        const fetchViewedUserRecentRoutes = async () => {
            if (isOwnProfile || !username || !isAlreadyFriend || !friendshipChecked) { // Stop if viewed user isn't your friend
                setViewedUserRecentRoutes([]);
                return;
            }

            try {
                const viewedRoutesResponse = await fetch(`/showRoutesByUser/${encodeURIComponent(username)}`); // Fetch the routes for the viewed user
                if (!viewedRoutesResponse.ok) {
                    setViewedUserRecentRoutes([]);
                    return;
                }

                const viewedRoutesData = await viewedRoutesResponse.json();
                const allViewedRoutes = Array.isArray(viewedRoutesData) ? viewedRoutesData : [];
                const recentRoutes = [...allViewedRoutes]
                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) // Sort the routes from most recent to least
                    .slice(0, 3); // Only get 3 most recent routes

                setViewedUserRecentRoutes(recentRoutes);
            } catch (error) {
                console.error("Failed to load viewed user's recent routes", error);
                setViewedUserRecentRoutes([]);
            }
        };
        fetchViewedUserRecentRoutes();
    }, [isOwnProfile, username, friendshipChecked, isAlreadyFriend]);

    // Fetch tasks for the viewed assigned user
    useEffect(() => {
        fetchAssignedUserTasks();
    }, [isAssignedUser, isOwnProfile, profileEmail, loggedInUserEmail]);

    return (
        <div className="bg-white rounded-4xl shadow-xl p-8 w-full max-w-sm border border-gray-50 text-center relative mb-6">
      
            {/* ---------- User's avatar, only editable when on own profile ----------  */}

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

        {/* ---------- Username (and email on doctor profile) ---------- */}

        <h2 className="text-2xl font-black text-gray-800 tracking-tight"> {username} </h2>
        {isDoctor && (
            <p className="text-sm text-gray-500 mb-4">{profileEmail}</p>
        )}

        {/* ----------  User's bio (change to text area while editing if on own profile) ----------  */}

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

        {/* ---------- List of pending friend requests if on own profile ---------- */}

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

        {/* ---------- Show list of pending doctor requests if on own profile ---------- */}

        {isOwnProfile && pendingDoctorRequests && pendingDoctorRequests.length > 0 && !isDoctor && (
            <div className="w-full mb-6">
                <p className="text-xs uppercase font-black text-emerald-500 mb-2 text-left">
                    Doctor Requests ({pendingDoctorRequests.length})
                </p>
                <div className="space-y-2">
                    {pendingDoctorRequests.map((senderName) => (
                        <div key={senderName} className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                            <p className="font-bold text-gray-800 text-sm">
                                {senderName}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => onAcceptDoctorRequest && onAcceptDoctorRequest(senderName)} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer">
                                    ✓ Accept
                                </button>
                                <button onClick={() => onDeclineDoctorRequest && onDeclineDoctorRequest(senderName)} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors cursor-pointer">
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ---------- Friends list, only shown on own profile ---------- */}

        {isOwnProfile && !isDoctor && (
            <div className="w-full mb-8">
                <div className="bg-green-100 p-4 rounded-2xl w-full border border-green-100 shadow-sm">
                    <div className="relative flex flex-row items-center w-full">
                        <p className="text-lg uppercase font-black text-green-400 mb-1 mx-auto">
                            Friends
                        </p>
                        <span className="absolute right-0 text-lg font-black text-green-200 mb-1 py-2 px-4 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 select-none" onClick={() => setAddingFriend(!addingFriend)}> 
                           {addingFriend ? "x" : "+"}
                        </span>
                    </div>
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

        {/* ---------- List of doctor assigned tasks, only shown if logged in as a doctor and on an assigned user's profile ---------- */}

        {!isOwnProfile && isDoctor && assignedChecked && isAssignedUser && (
            <div className="bg-green-100 p-4 rounded-2xl w-full border border-green-100 shadow-sm">
                <h1 className="text-lg uppercase font-black text-green-400 mb-1"> Assigned Goals </h1>
                <div className="flex flex-col gap-2 justify-center mt-3 pt-3 border-t border-green-200/50">
                    {assignedUserTasks.map((task) => (
                        <Task key={task._id || task.id} name={task.name} description={task.description} completionDate={task.completionDate} taskCompleted={task.completed} onToggle={() => {}} />
                    ))}
                </div>

                {/* Button for assigning a task */}
                <CreateTaskMenu showCreate={showCreate} handleSubmit={handleTaskSubmit} taskName={taskName} setTaskName={setTaskName} taskDescription={taskDescription} setTaskDescription={setTaskDescription} taskDate={taskDate} setTaskDate={setTaskDate} setShowCreate={setShowCreate}/>
                <div className="mb-4 mt-2 px-5 text-center">
                    <button onClick={createTask} className="bg-white px-6 py-4 text-2xl cursor-pointer transition active:scale-95 rounded-lg hover:bg-gray-200 m-2">
                        Assign Task
                    </button>
                </div>
            </div>
        )}

        {/* ---------- Friend's recent routes ----------  */}

        {!isOwnProfile && !isDoctor && isAlreadyFriend && viewedUserRecentRoutes.length > 0 && (
            <div className="w-full mb-8">
                <div className="bg-green-100 p-4 rounded-2xl w-full border border-green-100 shadow-sm">
                    <p className="text-lg uppercase font-black text-green-400 mb-1">
                        Recent Routes
                    </p>
                    <div className="flex flex-col gap-2 justify-center mt-3 pt-3 border-t border-green-200/50">
                        {viewedUserRecentRoutes.map((route) => (
                            <PrevRoute key={route._id || route.id} route={route} />
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ---------- Add Friend button, only shown if not on own profile and not already friends ----------  */}

        {!isOwnProfile && friendshipChecked && !isAlreadyFriend && profileEmail !== loggedInUserEmail && !isDoctor && (
            <button onClick={handleSendViewedProfileRequest} className="w-full py-3 bg-green-50 text-green-600 hover:bg-green-100 font-black rounded-2xl transition-all border border-green-100 cursor-pointer mb-8">
                + Add Friend
            </button>
        )}

        {/* ---------- Remove Friend button, only shown if not on own profile and already friends ---------- */}

        {!isOwnProfile && friendshipChecked && isAlreadyFriend && profileEmail !== loggedInUserEmail && !isDoctor && (
            <button onClick={() => onRemoveFriend && onRemoveFriend(username)} className="w-full py-3 bg-red-100 text-red-500 hover:bg-red-200 font-black rounded-2xl transition-all border border-green-100 cursor-pointer mb-8">
                - Remove Friend
            </button>
        )}

        {/* ---------- Connect with user button, only shown if a doctor and not on own profile and not already connected ---------- */}

        {!isOwnProfile && profileEmail !== loggedInUserEmail && isDoctor && assignedChecked && !isAssignedUser && (
            <button onClick={handleSendDoctorAssignmentRequest} className="w-full py-3 bg-green-50 text-green-600 hover:bg-green-100 font-black rounded-2xl transition-all border border-green-100 cursor-pointer mb-8">
                + Connect with user
            </button>
        )}

         {/* ---------- Remove User button, only shown if not on own profile and they're an assigned user ---------- */}

        {!isOwnProfile && assignedChecked && isAssignedUser && profileEmail !== loggedInUserEmail && isDoctor && (
            <button className="w-full py-3 bg-red-100 text-red-500 hover:bg-red-200 font-black rounded-2xl transition-all border border-green-100 cursor-pointer mb-8">
                - Remove User
            </button>
        )}

        {/* ---------- Search for friends, only show on own profile ---------- */}
        
        {isOwnProfile && !isDoctor && addingFriend && (
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

        {/* ---------- Search for users by email, only show on own profile if doctor ---------- */}

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

        {/* ---------- Assigned doctor, only shown on normal users' own profiles if they have a doctor assigned ----------  */}

        {!isDoctor && isOwnProfile && assignedDoctor && (
            <div className="bg-green-100 p-4 rounded-2xl w-full border border-green-100 shadow-sm mb-6">
                <p className="text-lg uppercase font-black text-green-400 mb-1">
                    Assigned Doctor
                </p>
                <p className="font-bold text-gray-800 border-t border-green-200/50">
                    {assignedDoctor.username}
                </p>
                <p className="text-xs text-gray-600">
                    {assignedDoctor.email}
                </p>
            </div>
        )}

         {/* ---------- Sign out button if on own profile ---------- */}

        {isOwnProfile && (
            <button className="w-full py-3 bg-cyan-100 text-cyan-500 hover:bg-cyan-200 font-black rounded-2xl transition-all border border-blue-100 cursor-pointer mb-4">
                Edit Details
            </button>
        )}

        {/* ---------- Sign out button if on own profile ---------- */}

        {isOwnProfile && (
            <button onClick={() => onSignOut && onSignOut()} className="w-full py-3 bg-red-100 text-red-500 hover:bg-red-200 font-black rounded-2xl transition-all border border-red-100 cursor-pointer">
                Sign Out
            </button>
        )}
    </div>
    );
}