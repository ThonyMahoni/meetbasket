import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Bitte alle Pflichtfelder ausfüllen');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Fehler beim Senden der Nachricht');

      setSubmitted(true);
    } catch (err) {
      setError('Beim Senden der Nachricht ist ein Fehler aufgetreten.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Nehme Kontakt auf</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Contact form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {submitted ? (
            <div className="text-center py-8">
              <svg 
                className="w-16 h-16 text-green-500 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-bold mb-2">Nachricht gesendet!</h2>
              <p className="mb-4">
              Vielen Dank, dass Sie uns kontaktiert haben. Wir haben Ihre Nachricht erhalten und werden so schnell wie möglich antworten.
              </p>
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({name: '', email: '', subject: 'general', message: ''});
                }}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Eine weitere Nachricht senden
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Sende uns eine Nachricht</h2>
              
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="subject">
                    Betreff
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Allgemeine Anfrage</option>
                    <option value="support">Technischer Support</option>
                    <option value="premium">Premium Subscription</option>
                    <option value="feedback">Feedback</option>
                    <option value="advertise">Advertisement</option>
                    <option value="report">Report an Issue</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="message">
                    Nachricht <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>
        
        {/* Right column: Contact information and office hours */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Kontaktiere HoopConnect</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" 
                    />
                    <path 
                      d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Email</h3>
                  <p className="text-gray-600">support@hoopconnect.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Telefon</h3>
                  <p className="text-gray-600">+49 (162) 2079269</p>
                  <p className="text-gray-500 text-xs mt-1">Mo-Fr: 9Uhr - 15Uhr</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Addresse</h3>
                  <p className="text-gray-600">Th-Heuss-Str.18</p>
                  <p className="text-gray-600">86415 Mering</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Wir haben Öffnungszeiten</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Montag - Freitag:</span>
                <span>9:00 Uhr - 15:00 Uhr</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Samstag:</span>
                <span>10:00 Uhr - 12:00 Uhr</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sonntag:</span>
                <span>Ruhetag</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Follow Us</h2>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500 transition">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white hover:from-yellow-500 hover:via-red-600 hover:to-purple-600 transition">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition">
                <span className="sr-only">YouTube</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;