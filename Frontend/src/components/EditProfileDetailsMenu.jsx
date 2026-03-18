import { useEffect, useState } from "react";

export default function EditProfileDetailsMenu({ showEditDetails, setShowEditDetails, profileEmail, currentUsername, editedUsername, setEditedUsername, editedPassword, setEditedPassword, handleSaveProfileDetails }) {
    const [isChangingUsername, setIsChangingUsername] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (showEditDetails) {
            setIsChangingUsername(false);
            setIsChangingPassword(false);
        }
    }, [showEditDetails]);

    return (
        <div>
            {showEditDetails && (
                <div className="fixed top-30 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl p-6 w-96">
                    <h2 className="text-2xl font-semibold mb-4">Edit Profile Details</h2>

                    <form onSubmit={handleSaveProfileDetails}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input type="email" value={profileEmail || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" readOnly />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <div className="flex gap-2">
                                <input type="text" value={editedUsername} placeholder="Enter new username" onChange={(e) => setEditedUsername(e.target.value)} readOnly={!isChangingUsername} className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg ${!isChangingUsername ? 'bg-gray-100 text-gray-500' : ''}`}/>

                                <button onClick={() => setIsChangingUsername((prev) => !prev)} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition cursor-pointer text-sm font-semibold">
                                    {isChangingUsername ? 'Lock' : 'Change'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Password</label>
                            {!isChangingPassword && (
                                <button onClick={() => setIsChangingPassword(true)} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition cursor-pointer text-sm font-semibold">
                                    Change Password
                                </button>
                            )}

                            {isChangingPassword && (
                                <div className="flex gap-2">
                                    <input type="password" value={editedPassword} placeholder="Enter new password" onChange={(e) => setEditedPassword(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"/>

                                    <button onClick={() => { setEditedPassword(''); setIsChangingPassword(false); }} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition cursor-pointer text-sm font-semibold">
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowEditDetails(false)} className="px-4 py-2 bg-gray-200 rounded-lg transition hover:bg-gray-300 cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-green-300 text-black rounded-lg transition hover:bg-green-400 cursor-pointer">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}