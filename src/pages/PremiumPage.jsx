import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const PremiumPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('info');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    agreeToTerms: false,
  });

  const subscriptionTiers = [
    {
      id: 'monthly',
      name: 'Im Monat',
      price: 4.99,
      period: 'monatlich',
      features: ['Keine Werbung', 'Zugang zu allen Premium-Plätzen', 'Unbegrenzte Herausforderungen', 'Team und Turnier Erstellung', 'Premium-Abzeichen'],
    },
    {
      id: 'yearly',
      name: 'Im Jahr',
      price: 39.99,
      period: 'jährlich',
      discount: '33% sparen',
      isRecommended: true,
      features: ['Jeden Monat Vorteile', 'Früherer Zugriff auf neue Funktionen', 'Erweiterte Statistiken', 'Exklusive Turniere'],
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 99.99,
      period: 'einmalig',
      features: ['Vorteile für 1 Jahr', 'Lebenslanger Zugang', 'VIP-Support', 'Exklusive Merchandise', 'Einladungen zu speziellen Veranstaltungen'],
    },
  ];

  const [selectedTier, setSelectedTier] = useState(subscriptionTiers[1].id);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/premium', message: 'Bitte einloggen, um Premium zu abonnieren' } });
    } else {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTierSelect = (tierId) => setSelectedTier(tierId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPaymentStep('payment');
  };

  const calculateExpiryDate = (tierId) => {
    const now = new Date();
    switch (tierId) {
      case 'monthly': now.setMonth(now.getMonth() + 1); break;
      case 'yearly': now.setFullYear(now.getFullYear() + 1); break;
      case 'lifetime': now.setFullYear(now.getFullYear() + 100); break;
      default: now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  };

  const getSelectedTierDetails = () => subscriptionTiers.find(tier => tier.id === selectedTier);

 useEffect(() => {
  if (paymentStep === 'payment' && window.paypal) {
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        const price = getSelectedTierDetails().price.toString();
        return actions.order.create({
          purchase_units: [{
            amount: { value: price },
          }],
        });
      },
      onApprove: async (data, actions) => {
        setPaymentStep('processing');
        setIsLoading(true);

        try {
          const order = await actions.order.capture();
          const tierDetails = getSelectedTierDetails();

          const payload = {
            userId: user.id,
            tier: selectedTier,
            fullName: formData.fullName,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            zipCode: formData.zipCode,
            expiryDate: calculateExpiryDate(selectedTier),
            price: tierDetails.price,
            paypalOrderId: order.id,
            paypalPayer: order.payer,
          };

          const res = await fetch(`${API_BASE_URL}/api/premium/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.id,
            },
            body: JSON.stringify(payload),
            credentials: 'include',
          });

          if (!res.ok) throw new Error('Fehler beim Speichern des Premium-Zugangs');
          const updatedUser = await res.json();
          await updateProfile(updatedUser);

          setPaymentStep('success');
        } catch (err) {
          alert(err.message || 'Zahlung fehlgeschlagen');
          setPaymentStep('info');
        } finally {
          setIsLoading(false);
        }
      },
      onError: (err) => {
        console.error('PayPal Fehler:', err);
        alert('Zahlung fehlgeschlagen');
        setPaymentStep('info');
      },
    }).render('#paypal-button-container');
  }
}, [paymentStep]);


  const handleContinue = () => {
    navigate('/');
  };

  const renderStep = () => {
    switch (paymentStep) {
      case 'info':
        return renderInfoStep();
      case 'payment':
        return renderPaymentStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderInfoStep();
    }
  };

  const renderInfoStep = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Wähle Deinen Premium Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedTier === tier.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              } ${tier.isRecommended ? 'relative' : ''}`}
              onClick={() => handleTierSelect(tier.id)}
            >
              {tier.isRecommended && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  BESTE WAHL
                </div>
              )}
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold">€{tier.price}</span>
                <span className="text-gray-600 ml-1">/{tier.period}</span>
              </div>
              {tier.discount && (
                <div className="mt-1 text-green-600 font-semibold">{tier.discount}</div>
              )}
              <ul className="mt-4 space-y-2">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <button
                  type="button"
                  className={`w-full py-2 px-4 rounded-md ${
                    selectedTier === tier.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => handleTierSelect(tier.id)}
                >
                  {selectedTier === tier.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
  <div>
    <label className="block text-sm font-medium mb-1">Vor-und Nachname</label>
    <input
      type="text"
      name="fullName"
      value={formData.fullName}
      onChange={handleInputChange}
      required
      className="w-full border rounded px-3 py-2"
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-1">Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      required
      className="w-full border rounded px-3 py-2"
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-1">Addresse</label>
    <input
      type="text"
      name="address"
      value={formData.address}
      onChange={handleInputChange}
      required
      className="w-full border rounded px-3 py-2"
    />
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium mb-1">Stadt</label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleInputChange}
        required
        className="w-full border rounded px-3 py-2"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Land</label>
      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        required
        className="w-full border rounded px-3 py-2"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Postleitzahl</label>
      <input
        type="text"
        name="zipCode"
        value={formData.zipCode}
        onChange={handleInputChange}
        required
        className="w-full border rounded px-3 py-2"
      />
    </div>
  </div>
  <div className="flex items-center">
    <input
      type="checkbox"
      name="agreeToTerms"
      checked={formData.agreeToTerms}
      onChange={handleInputChange}
      required
      className="h-4 w-4 text-blue-600"
    />
    <label className="ml-2 text-sm">
      Ich stimme den <a href="/terms" className="underline">Terms u. Conditions</a> zu.
    </label>
  </div>
  <div className="pt-4">
    <button
      type="submit"
      className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
    >
      Weiter zur Zahlung
    </button>
  </div>
</form>

    </>
  );

  const renderPaymentStep = () => {
    const selectedTierInfo = getSelectedTierDetails();

    return (
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">MeetBasket Premium</h2>

        <div className="w-full max-w-md bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium">{selectedTierInfo.name} Premium</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Preis:</span>
            <span className="font-medium">€{selectedTierInfo.price} / {selectedTierInfo.period}</span>
          </div>
          {selectedTierInfo.discount && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Gespart:</span>
              <span className="text-green-600 font-medium">{selectedTierInfo.discount}</span>
            </div>
          )}
          <hr className="my-3" />
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>€{selectedTierInfo.price}</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Bezahl Methode auswählen</h3>
            <div className="flex items-center p-4 border border-gray-300 rounded-md bg-gray-50">
              <input id="paypal" name="paymentMethod" type="radio" checked readOnly className="h-5 w-5 text-blue-600" />
              <label htmlFor="paypal" className="ml-3 flex items-center">
                <span className="font-medium mr-2">PayPal</span>
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal Logo" className="h-6" />
              </label>
            </div>

            <div className="mt-6" id="paypal-button-container"></div>


            <div className="mt-4">
              <button
                type="button"
                onClick={() => setPaymentStep('info')}
                className="w-full py-2 px-4 text-gray-600 font-medium rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Back
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
            Ihre Zahlungsinformationen sind sicher. Wir verwenden Verschlüsselung, um Ihre persönlichen Daten zu schützen.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center py-12">
      <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <h2 className="text-xl font-semibold mb-2">Ihre Zahlung wird bearbeitet</h2>
      <p className="text-gray-600">Bitte warten Sie, während wir Ihre Zahlung verarbeiten....</p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="flex flex-col items-center py-12">
      <div className="bg-green-100 p-4 rounded-full mb-4">
        <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold mb-2">Zahlung erfolgreich!</h2>
      <p className="text-gray-600 mb-6 text-center">
      Danke, dass Sie auf Premium aktualisiert haben! Ihr Konto wurde aktualisiert und alle Premium-Funktionen sind jetzt verfügbar.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Deine Premium Vorteile:</h3>
        <ul className="space-y-2">
          {getSelectedTierDetails().features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={handleContinue}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Weiter mit MeetBasket
      </button>
    </div>
  );

  if (!user) {
    return <div className="p-8 flex justify-center">Loading...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Upgrade zu MeetBasket Premium</h1>
          <p className="text-xl text-gray-600">Schalte alle Premium-Funktionen frei und bringe dein Spiel auf die nächste Stufe.</p>
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default PremiumPage;

