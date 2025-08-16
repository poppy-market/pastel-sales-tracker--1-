import React from 'react';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
    <div className="bg-white/80 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg mb-4">Page Not Found</p>
      <a href="/" className="text-pink-500 hover:underline">Go Home</a>
    </div>
  </div>
);

export default NotFound;
