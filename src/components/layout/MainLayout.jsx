import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;