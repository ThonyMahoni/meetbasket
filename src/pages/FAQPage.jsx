import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const FAQPage = () => {
  // State to track which FAQ items are expanded
  const [expandedItems, setExpandedItems] = useState({});

  // Toggle FAQ item expansion
  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // FAQ content organized by categories
  const faqCategories = [
    {
      id: 'general',
      title: 'General',
      questions: [
        {
          id: 'what-is',
          question: 'Was ist MeetBasket?',
          answer: 'MeetBasket ist eine Plattform, die Basketballspielern hilft, Plätze zu finden, Spiele zu organisieren, sich mit anderen Spielern zu vernetzen und ihre Fähigkeiten zu verbessern. Es dient als Gemeinschaftszentrum für Basketballbegeisterte aller Spielstärken..'
        },
        {
          id: 'cost',
          question: 'Wie viel kostet MeetBasket?',
          answer: 'MeetBasket bietet sowohl kostenlose als auch Premium-Tarife an. Die grundlegenden Funktionen sind komplett kostenlos, einschließlich der Suche nach Plätzen, der Ansicht grundlegender Spielerprofile und dem Beitritt zu öffentlichen Spielen. Premium-Funktionen erfordern ein Abonnement, das in monatlichen, jährlichen oder lebenslangen Optionen mit unterschiedlichen Vorteilen erhältlich ist.'
        },
        {
          id: 'devices',
          question: 'Mit welchen Geräten kann ich MeetBasket verwenden?',
          answer: 'MeetBasket ist eine Webanwendung, die in allen modernen Browsern funktioniert, einschließlich Chrome, Safari, Firefox und Edge. Sie können es auf Smartphones, Tablets, Laptops und Desktop-Computern verwenden. Für das beste mobile Erlebnis empfehlen wir, es als Progressive Web App (PWA) zu Ihrem Startbildschirm hinzuzufügen..'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profil',
      questions: [
        {
          id: 'create-account',
          question: 'Wie erstelle ich ein Konto?',
          answer: 'Sie können ein Konto erstellen, indem Sie auf die Schaltfläche "Registrieren" auf der Anmeldeseite klicken. Sie müssen einen Benutzernamen, eine E-Mail-Adresse, ein Passwort und einige grundlegende Basketballinformationen wie Ihr Fähigkeitsniveau und Ihre bevorzugte Position angeben. Alternativ können Sie sich auch mit Ihrem Google-Konto anmelden, um den Registrierungsprozess zu beschleunigen.'
        },
        {
          id: 'change-profile',
          question: 'Wie bearbeite ich meine Profilinformationen?',
          answer: 'Gehe zu deiner Profilseite, indem du auf deinen Benutzernamen oder dein Profilbild in der Navigationsleiste klickst. Klicke dann auf die Schaltfläche "Profil bearbeiten", um deine Informationen, einschließlich deiner Biografie, deinem Fähigkeitsniveau, deiner Position und deinem Profilbild, zu aktualisieren.'
        },
        {
          id: 'delete-account',
          question: 'Wie kann ich mein Konto löschen?',
          answer: 'Um Ihr Konto zu löschen, gehen Sie zu Ihrer Profilseite und scrollen Sie nach unten, wo Sie die Option "Konto löschen" finden. Bitte beachten Sie, dass die Kontolöschung dauerhaft ist und alle Ihre Daten aus unseren Systemen entfernt werden.'
        }
      ]
    },
    {
      id: 'courts',
      title: 'Finde Courts & Games',
      questions: [
        {
          id: 'find-courts',
          question: 'Wie finde ich Basketballplätze in meiner Nähe?',
          answer: 'Navigiere zum Abschnitt "Gerichte" in der App und erlaube den Zugriff auf deinen Standort, wenn du dazu aufgefordert wirst. Die Karte zeigt dir nahegelegene Gerichte mit Informationen über ihre Einrichtungen, Oberflächenart, Anzahl der Körbe und Bewertungen von anderen Spielern. Du kannst auch nach Gerichten nach Name oder Standort suchen.'
        },
        {
          id: 'join-game',
          question: 'Wie kann ich einem Basketballspiel beitreten?',
          answer: 'Du kannst auf zwei Arten an Spielen teilnehmen: Entweder findest du ein vorhandenes Spiel im Tab "Spiele" und klickst auf "Beitreten", oder du durchsucht die Plätze und siehst dir die anstehenden Spiele für jeden Standort an. Einige Spiele können Anforderungen wie Spielstärke haben oder nur für Premium-Mitglieder zugänglich sein, was deutlich angezeigt wird.'
        },
        {
          id: 'create-game',
          question: 'Wie organisiere ich ein Basketballspiel?',
          answer: 'Gehe zum Abschnitt "Spiele" und klicke auf "Spiel erstellen". Wähle einen Spielort, Datum, Uhrzeit, maximale Anzahl an Spielern und füge eine Beschreibung hinzu. Du kannst auch Anforderungen an das Fähigkeitsniveau festlegen und das Spiel öffentlich oder privat machen. Premiummitglieder können exklusive Spiele erstellen und detailliertere Anforderungen hinzufügen.'
        }
      ]
    },
    {
      id: 'premium',
      title: 'Premium Features',
      questions: [
        {
          id: 'premium-benefits',
          question: 'Welche Vorteile habe ich mit einem Premium-Abonnement?',
          answer: 'Premium-Mitglieder genießen mehrere Vorteile: Zugang zu exklusiven Plätzen, fortgeschrittene Spielerstatistik-Verfolgung, die Möglichkeit, private Spiele zu organisieren, unbegrenzte Nachrichten, Premium-Abzeichen auf ihren Profilen, erweiterte Suchfilter für Spieler, Werkzeuge zur Fähigkeitenentwicklung und priorisierte Kundenbetreuung.'
        },
        {
          id: 'premium-cost',
          question: 'Wie viel kostet die Premium-Mitgliedschaft?',
          answer: 'Wir bieten drei Premium-Stufen an: Monatlich (4,99 €/Monat), Jährlich (49,99 €/Jahr, Ersparnis von ca. 33%) und Lebenslang (99,99 € einmalige Zahlung). Jede Stufe umfasst alle Premium-Funktionen, der Unterschied liegt im Abrechnungszeitraum und im Gesamtwert.'
        },
        {
          id: 'cancel-premium',
          question: 'Wie kann ich mein Premium-Abonnement kündigen?',
          answer: 'Sie können Ihr Premium-Abonnement jederzeit kündigen, indem Sie zu Ihren Settingeinstellungen gehen und "Abonnement verwalten" auswählen. Ihre Premium-Vorteile gelten bis zum Ende Ihres aktuellen Abrechnungszeitraums. Bitte beachten Sie, dass wir keine Rückerstattungen für teilweise Abonnementzeiträume anbieten.'
        }
      ]
    },
    {
      id: 'social',
      title: 'Freunde & Messaging',
      questions: [
        {
          id: 'add-friends',
          question: 'Wie füge ich Freunde hinzu?',
          answer: 'Du kannst Freunde hinzufügen, indem du ihr Profil besuchst und auf die Schaltfläche "Freund hinzufügen" klickst. Sie erhalten eine Freundschaftsanfrage, die sie annehmen oder ablehnen können. Du kannst auch potenzielle Freunde über die Funktion "Menschen, die du kennen könntest" finden oder nach Benutzern über ihren Benutzernamen oder ihre E-Mail-Adresse suchen.'
        },
        {
          id: 'messaging',
          question: 'Wie funktioniert das Nachrichten System?',
          answer: 'Das Nachrichten-System ermöglicht es Ihnen, mit anderen MeetBasket-Nutzern zu kommunizieren. Sie können ein Gespräch von einem Benutzerprofil oder aus dem Nachrichtenbereich starten. Kostenlose Nutzer können auch unbegrenzte Nachrichten pro Tag senden, während Premium-Nutzer weitere Vorteile genießt.'
        },
        {
          id: 'block-user',
          question: 'Wie blockiere oder melde ich einen Benutzer?',
          answer: 'Wenn Sie jemanden blockieren müssen, gehen Sie zu ihrem Profil und klicken Sie auf das Dreipunkt-Menü, dann wählen Sie "Benutzer blockieren". Um unangemessenes Verhalten zu melden, wählen Sie "Benutzer melden" aus demselben Menü und folgen Sie den Anweisungen, um Einzelheiten zum Problem anzugeben.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technischer Support',
      questions: [
        {
          id: 'install-app',
          question: 'Wie installiere ich MeetBasket auf meinem Gerät?',
          answer: 'Besuchen Sie die Seite "App installieren" im Hauptmenü für detaillierte Anweisungen, die speziell für Ihr Gerät sind. MeetBasket ist eine Progressive Web App (PWA), was bedeutet, dass Sie sie zu Ihrem Startbildschirm hinzufügen können, ohne einen App-Store zu durchlaufen.'
        },
        {
          id: 'location-issues',
          question: 'Die App kann nicht auf meinen Standort zugreifen. Was soll ich tun?',
          answer: 'Zuerst stellen Sie sicher, dass Sie MeetBasket in Ihren Browsereinstellungen Standortberechtigungen erteilt haben. Überprüfen Sie auf Mobilgeräten die Einstellungen Ihres Geräts, um sicherzustellen, dass die Standortdienste für Ihren Browser aktiviert sind. Wenn die Probleme weiterhin bestehen, versuchen Sie es mit einem anderen Browser oder kontaktieren Sie unser Support-Team.'
        },
        {
          id: 'contact-support',
          question: 'Wie kontaktiere ich den Kundensupport?',
          answer: 'Sie können unser Support-Team über die Seite "Kontakt" im Hauptmenü der App erreichen. Kostenlose Benutzer können Support-Tickets einreichen, die innerhalb von 48 Stunden beantwortet werden, während Premium-Nutzer priorisierten Support mit einer garantierten Antwort innerhalb von 24 Stunden erhalten.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Häufig gestellte Fragen</h1>
      
      {/* Search box for FAQs - optional enhancement */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search FAQs..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">{category.title}</h2>
            
            <div className="space-y-4">
              {category.questions.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <button
                    className="flex justify-between items-center w-full text-left font-medium text-gray-800 hover:text-blue-600"
                    onClick={() => toggleItem(item.id)}
                  >
                    <span>{item.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transform transition-transform ${
                        expandedItems[item.id] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  
                  {expandedItems[item.id] && (
                    <div className="mt-3 text-gray-600">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Still Need Help */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Brauchen Sie noch Hilfe?</h2>
        <p className="mb-4">
        Wenn Sie keine Antwort auf Ihre Frage finden konnten, kontaktieren Sie uns bitte direkt.
        </p>
        <Link to="/contact" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Support kontaktieren
        </Link>
      </div>
    </div>
  );
};

export default FAQPage;