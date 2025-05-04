import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto text-center">
        <p className="mb-4">&copy; 2025 DevSync. All rights reserved.</p>
        <ul className="flex justify-center space-x-6">
          <li><a href="/about" className="hover:underline">About Us</a></li>
          <li><a href="/contact" className="hover:underline">Contact Us</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
