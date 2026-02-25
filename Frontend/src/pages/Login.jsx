import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [timeOfDay, setTimeOfDay] = useState('day');
  const navigate = useNavigate();

  // Determine time of day period, used to change background dynamically
  useEffect(() => { 
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 10) {
        setTimeOfDay('morning');
      } else if (hour >= 10 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };
    
    updateTimeOfDay();
    
    // Update time hourly
    const now = new Date();
    const msUntilNextHour = (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000; // Calculate how many ms till the next hour begins
    let interval;
    
    const timeout = setTimeout(() => {
      updateTimeOfDay();
      interval = setInterval(updateTimeOfDay, 3600000); // Set update interval to an hour at the beginning of each hour
    }, msUntilNextHour);
    
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear old errors

    // login/register setup ports
    const endpoint = isLogin 
      ? `/login` 
      : `/register`;

    // Package the data based on whether its a login or signup
    const payload = isLogin ? { email, password } : { username, email, password };

    try { // Send the data as a JSON package
      alert(JSON.stringify(payload));
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Success! Database says:", data);
        // If login/signup successful, send the user to the map
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        navigate('/map');
      } else {
        // If the backend rejects login/signup
        setError(data.message || "Failed to authenticate.");
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("Could not reach the server. Is port 8000 running?");
    }
  };

  return (
    // Update sky based on time of day
    <div className={`min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-1000 ${
        timeOfDay === 'morning' ? 'bg-sky-200' :
        timeOfDay === 'day' ? 'bg-sky-300' :
        timeOfDay === 'evening' ? 'bg-orange-400' :
        'bg-blue-900'
      }`}>
      
      {/* Update sun/moon based on time of day */}
      <div className={`absolute w-32 h-32 rounded-full blur-sm opacity-90 transition-all duration-1000 ${
          timeOfDay === 'night' ? 'top-10 left-20 bg-gray-100 shadow-lg' : 'top-12 left-10 sm:left-20'} 
        ${
          timeOfDay === 'morning' ? 'bg-yellow-200' :
          timeOfDay === 'day' ? 'bg-amber-400' :
          timeOfDay === 'evening' ? 'bg-yellow-400' : ""
        }`}/>
      
      {/* Update hill in the background based on time of day */}
      <div className={`absolute bottom-0 -left-1/5 w-[140%] h-[45vh] rounded-t-full transition-colors duration-1000 ${
          timeOfDay === 'morning' ? 'bg-lime-300' :
          timeOfDay === 'day' ? 'bg-green-400' :
          timeOfDay === 'evening' ? 'bg-lime-400' :
          'bg-slate-700'
        }`}/>
      
      {/* Update foreground hill based on time of day */}
      <div 
        className={`absolute bottom-[-5%] right-[-10%] w-[120%] h-[35vh] rounded-t-full shadow-lg transition-colors duration-1000 ${
          timeOfDay === 'morning' ? 'bg-green-600' :
          timeOfDay === 'day' ? 'bg-green-700' :
          timeOfDay === 'evening' ? 'bg-lime-700' :
          'bg-slate-800'
        }`}/>

      {/* Login / Signup */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-4xl shadow-2xl border border-white/60 relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl mb-8 text-green-700 font-black tracking-tighter drop-shadow-sm">
            Walkerone
          </h1>
          
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            {isLogin ? 'Enter your details to track your steps.' : 'Sign up to start your journey.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r-lg shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="flex flex-col gap-5 *:w-full *:px-5 *:py-4 *:bg-white/90 *:rounded-xl *:focus:bg-white *:focus:ring-2 *:focus:ring-green-600 *:outline-none *:transition-all *:duration-300 *:border *:border-gray-200 *:shadow-sm">

            {!isLogin && (
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            )}
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          </div>

          <button type="submit" className="w-full py-4 mt-2 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>

        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-700 text-sm font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-green-600 font-black hover:underline transition-all ml-1 cursor-pointer">
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}