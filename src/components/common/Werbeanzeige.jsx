import React from 'react';

const Werbeanzeige = () => {
  return (
    <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-6 text-center">
      <h2 className="text-md font-semibold text-yellow-800">🎯 Sponsored</h2>
      <p className="text-sm text-yellow-700 mt-1">
        Trainiere jetzt mit 100% Rabatt mit Basketball-CRM! 🏀
      </p>
      <a
        href="https://basketball-crm.de"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-blue-600 underline text-sm"
      >
        Mehr erfahren
      </a>
    </div>
  );
};

export default Werbeanzeige;
