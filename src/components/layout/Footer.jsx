import React, { useState } from 'react';

import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
              <Link to="/" className="flex items-center space-x-2">
             <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
               <img
                 src="/public/assets/logo.png" // 🔁 Passe Pfad an
                 alt="HoopConnect Logo"
                 className="h-8 w-8 object-contain"
               />
             </div>
             <span className="text-xl font-bold">MeetBasket</span>
           </Link>
            <p className="mt-4 text-gray-400">
            Finde Basketballplätze, nimm an Spielen teil und vernetze dich mit Spielern in deiner Umgebung.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-gray-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courts" className="text-gray-300 hover:text-white transition">
                  Courts in der Nähe
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-gray-300 hover:text-white transition">
                  Spiel beitreten
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-300 hover:text-white transition">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-gray-300 hover:text-white transition">
                  App Installieren
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition">
                  Kontaktiere uns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/impressum" className="text-gray-300 hover:text-white transition">
                  Impressum
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-2">
            Abonnieren Sie unseren Newsletter für die neuesten Updates.
            </p>
            <form
  className="flex mt-2"
  onSubmit={async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      alert(data.message || 'Erfolgreich eingetragen');
      setNewsletterEmail('');
    } catch (err) {
      alert('Fehler beim Abonnieren');
      console.error(err);
    }
  }}
>
  <input
    type="email"
    value={newsletterEmail}
    onChange={(e) => setNewsletterEmail(e.target.value)}
    placeholder="Your email"
    className="px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition"
  >
    Abonniere
  </button>
</form>

            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477212c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.09402.238.195 2.238.195v2.46h-1.26c-1.24301.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.1282216.9912212z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 3.987-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-3.987-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.59702.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097000-.748-1.15 3.098 3.0980001.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547011.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.190012.357.646 4.118 4.1180001.804-2.27 8.224 8.2240012.605.996 4.107 4.1070006.993 3.743 11.65 11.650018.457-4.287 4.106 4.1060001.27 5.477A4.072 4.0720012.8 9.713v.052a4.105 4.1050003.292 4.022 4.095 4.0950011.853.07 4.108 4.1080003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.6160006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 my-6" />

        {/* Copyright */}
        <div className="text-center text-gray-400">
          <p>&copy; {currentYear} MeetBasket. All rights reserved.</p>
          <p className="text-sm mt-1">
            Designed and built with <span className="text-red-500">♥</span> for basketball enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
