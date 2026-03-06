import { useState, useEffect } from 'react';

export default function AssignedUsers() {
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

                // Get doctor's assigned users' emails
                setAssignedUsers(doctor.userEmails?.map(email => ({ email })) || []);

            } catch (err) {
                setError('Failed to load assigned users.');
            }
        };
        fetchAssignedUsers();
    }, []);

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
                // List of emails of the user assigned to the logged in doctor
                <ul className="space-y-2">
                    {assignedUsers.map((user, index) => (
                        <li key={index} className="text-gray-900">{user.email}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}