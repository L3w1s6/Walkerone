import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AssignedUsers() {
    const navigate = useNavigate();
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAssignedUsers = async () => {
            try {
                const userEmail = localStorage.getItem('userEmail'); // Get logged in user's email
                const userType = localStorage.getItem('userType'); // Get type of user (doctor or regular)

                if (userType !== "doctor") {
                    setError("You must be logged in as a doctor to view assigned users.");
                    return;
                }

                // Get emails of all doctors and check which one is currently logged in
                const doctorsResponse = await fetch('/getDoctors');
                const doctors = await doctorsResponse.json();
                const doctor = doctors.find(doc => doc.email === userEmail);

                // Get doctor's assigned users and hydrate them with profile data for display cards.
                const assignedEmails = doctor?.userEmails || [];

                const assignedUsersData = await Promise.all(
                    assignedEmails.map(async (email) => {
                        try {
                            const userResponse = await fetch(`/api/user/${encodeURIComponent(email)}`);
                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                return {email, username: userData.username || email, pfp: userData.pfp || '👤',};
                            }
                        } catch (profileError) {
                            console.error(`Failed to fetch assigned user profile for ${email}:`, profileError);
                        }
                        return {email, username: email, pfp: '👤',};
                    })
                );

                setAssignedUsers(assignedUsersData);

            } catch (err) {
                setError('Failed to load assigned users.');
            }
        };
        fetchAssignedUsers();
    }, []);

    const handleViewProfile = (user) => {
        navigate(`/profile?email=${encodeURIComponent(user.email)}&username=${encodeURIComponent(user.username)}`);
    };

    if (error) { // Return error screen if there's an error
        return (
            <div className="p-4 flex flex-col items-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col items-center">
            <div className="text-center mb-8 pt-6">
                <h1 className="text-4xl font-black text-green-700 mb-2">
                    Assigned Users
                </h1>
                <p className="text-gray-600 font-medium">
                    Assign and check goals for your patients!
                </p>
            </div>
            
            {assignedUsers.length === 0 ? (
                <p className="text-gray-600">No users assigned yet.</p>
            ) : (
                <div className="w-full max-w-sm mb-8">
                    <div className="bg-green-50 p-4 rounded-2xl w-full border border-green-100 shadow-sm">
                        <p className="text-xs uppercase font-black text-green-400 mb-1">
                            Assigned Users
                        </p>
                        <p className="text-3xl font-black text-green-700 mb-2">
                            {assignedUsers.length}
                        </p>

                        <div className="flex flex-col gap-2 justify-center mt-3 pt-3 border-t border-green-200/50">
                            {assignedUsers.map((user) => (
                                <button key={user.email} onClick={() => handleViewProfile(user)} aria-label={`View profile for ${user.username}`} className="w-full p-3 bg-cyan-100 rounded-xl flex items-center justify-between shadow-sm cursor-pointer tranistion hover:bg-cyan-200 hover:scale-105">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{user.pfp}</span>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800 text-lg">{user.username}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 text-xs font-bold">View →</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}