import React from 'react';
import Home from './pages/Home';
import { SignIn, SignOutButton, useUser ,RedirectToSignIn,RedirectToSignUp, SignUp} from '@clerk/clerk-react';
import './index.css'
function App() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      {!user ? (
        <div className="flex justify-center items-center min-h-screen">
          <SignIn  forceRedirectUrl="https://theanirec.vercel.app" />
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-semibold">
              Hello, {user.fullName || user.username} 👋
            </p>
            <SignOutButton>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                Sign Out
              </button>
            </SignOutButton>
          </div>
          <Home />
        </div>
      )}
    </div>
  );
}

export default App;
