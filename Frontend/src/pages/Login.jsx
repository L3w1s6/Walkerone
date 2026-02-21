import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [theme, setTheme] = useState({});
  const navigate = useNavigate();

  // Function to determine the colors based on the hour (0-23)
  const getThemeByHour = (hour) => {
    if (hour >= 6 && hour < 10) {
      // DAYTIME (6 AM - 9:59 AM)
      return {
        sky: '#E1F5FE',       // Light Blue
        celestial: '#FFF59D', // Yellow Sun
        bgHill: '#AED581',    // Light Green
        fgHill: '#689F38',    // Deep Green
        isNight: false
      };
    } else if (hour >= 10 && hour < 17) {
      // MIDAY (10 AM - 4:59 PM)
      return {
        sky: '#81D4FA',       // Rich Sky Blue
        celestial: '#FFCA28', // Golden Sun
        bgHill: '#81C784',    // Rich Green
        fgHill: '#388E3C',    // Dark Forest Green
        isNight: false
      };
    } else if (hour >= 17 && hour < 20) {
      // SUNSET / EVENING (5 PM - 7:59 PM)
      return {
        sky: '#FFA726',       // Rich, vibrant orange sky
        celestial: '#FFEA00', // Bright glowing golden sun
        bgHill: '#D4E157',    // Warm, sun-baked yellow-green grass
        fgHill: '#9E9D24',    // Deep golden-olive foreground grass
        isNight: false
      };
    } else {
      // NIGHT TIME (8 PM - 5:59 AM)
      return {
        sky: '#1A237E',       // Deep Navy Blue
        celestial: '#F5F5F5', // White Moon
        bgHill: '#37474F',    // Dark Blue/Grey
        fgHill: '#263238',    // Almost Black
        isNight: true
      };
    }
  };

  // Set the theme when the page loads
  useEffect(() => { 
    const currentHour = new Date().getHours();
    setTheme(getThemeByHour(currentHour));
    
    // Check the time every minute in case they leave the app open
    const interval = setInterval(() => {
      setTheme(getThemeByHour(new Date().getHours()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear old errors

    // login/register setup ports
    const endpoint = isLogin 
      ? 'http://localhost:8000/api/login' 
      : 'http://localhost:8000/api/register';

    // Package the data based on whether it's a login or signup
    const payload = isLogin 
      ? { email, password } 
      : { username, email, password };

    try {
      // Send the data as a JSON package
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
        // If successful, send the user to the map!
        navigate('/map');
      } else {
        // If the backend rejects it 
        setError(data.message || "Failed to authenticate.");
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("Could not reach the server. Is port 8000 running?");
    }
  };

  // Prevent rendering until theme is loaded to avoid flickering
  if (!theme.sky) return null; 

  return (
    // THE SKY
    <div 
      className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: theme.sky }}
    >
      
      {/* Sun OR Moon */}
      <div 
        className={`absolute w-32 h-32 rounded-full blur-[2px] opacity-90 transition-all duration-1000 ${
          theme.isNight ? 'top-10 left-20 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'top-12 left-10 sm:left-20'
        }`}
        style={{ backgroundColor: theme.celestial }}
      ></div>
      
      {/* BACKGROUND HILL */}
      <div 
        className="absolute bottom-0 left-[-20%] w-[140%] h-[45vh] rounded-t-[100%] transition-colors duration-1000"
        style={{ backgroundColor: theme.bgHill }}
      ></div>
      
      {/* FOREGROUND HILL */}
      <div 
        className="absolute bottom-[-5%] right-[-10%] w-[120%] h-[35vh] rounded-t-[100%] shadow-[0_-10px_30px_rgba(0,0,0,0.15)] transition-colors duration-1000"
        style={{ backgroundColor: theme.fgHill }}
      ></div>

      {/* THE LOGIN CARD */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/60 relative z-10">
        
        <div className="text-center mb-10">
          <div className="text-5xl sm:text-6xl mb-8 text-[#2E7D32] font-black tracking-tighter drop-shadow-sm">
            Walkerone
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            {isLogin ? 'Enter your details to track your steps.' : 'Sign up to start your journey.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r-lg shadow-sm animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {!isLogin && (
            <div>
              <input 
                type="text" 
                placeholder="Username" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-white/90 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#689F38] outline-none transition-all duration-300 border border-gray-200 shadow-sm"
              />
            </div>
          )}

          <div>
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#689F38] outline-none transition-all duration-300 border border-gray-200 shadow-sm"
            />
          </div>

          <div>
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#689F38] outline-none transition-all duration-300 border border-gray-200 shadow-sm"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-2 bg-[#689F38] hover:bg-[#558B2F] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-700 text-sm font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#43A047] font-black hover:underline transition-all ml-1"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}