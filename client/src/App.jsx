import React from 'react';
import Home from './pages/Home';
import {
  SignIn,
  SignOutButton,
  useUser,
} from '@clerk/clerk-react';
import './index.css';

function App() {
  const { user } = useUser();

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col justify-between">
        <main className="flex-grow">
          {!user ? (
            <div className="flex flex-col justify-center items-center min-h-screen p-4 space-y-6">
              {/* Message Section */}
              <div className="flex items-center space-x-4">
                <img
                  src="https://i.postimg.cc/HkgDMDwm/cat-girl.gif"
                  alt="Cat Girl"
                  className="w-24 h-24 rounded-md object-cover"
                />
                <h2 className="text-xl md:text-2xl font-semibold text-center md:text-left">
                  Logging in is important, you know!
                </h2>
              </div>

              {/* Clerk SignIn Component */}
              <div className="p-6 rounded-lg shadow-lg">
                <SignIn forceRedirectUrl="https://theanirec.vercel.app" />
              </div>
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
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
          Made by{' '}
          <a
            href="https://priyanshuanand.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Priyanshu Anand
          </a>
        </footer>
      </div>
    </>
  );
}

export default App;
