import { useNavigate } from 'react-router-dom';

export default function Account() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    // Send the user back to the Login page 
    navigate('/'); 
  };

  return (
    // We add some padding and margin to keep it away from your top/bottom nav bars
    <div className="flex flex-col items-center justify-center p-6 mt-12 w-full">
      
      {/* Profile Card */}
      <div className="bg-white rounded-[2rem] shadow-lg p-8 w-full max-w-sm text-center border border-gray-100">
        
        {/* Profile Picture Placeholder */}
        <div className="w-24 h-24 bg-[#E1F5FE] text-[#0288D1] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner">
          👤
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">My Profile</h2>
        <p className="text-gray-500 mb-8 text-sm font-medium">Manage your Walkerone account.</p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all">
            Edit Profile
          </button>
          
          {/* THE SIGN OUT BUTTON */}
          <button 
            onClick={handleSignOut}
            className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold rounded-xl transition-all active:scale-95 border border-red-200"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}