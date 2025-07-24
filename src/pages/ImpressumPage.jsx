import React from 'react';
import { Link } from 'react-router-dom';

const ImpressumPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Impressum</h1>

      <div className="bg-white rounded-lg shadow-md p-6 prose max-w-none">
        <p className="text-gray-500 mb-8">Letzte Aktualisierung: 21. Juli 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Angaben gemäß § 5 TMG</h2>
          <p>
            Anthony Etugbo<br />
            Th-Heuss-Str. 18<br />
            86415 Mering<br />
            Deutschland
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Vertreten durch:</h2>
          <p>
            Anthony Etugbo<br />
            E-Mail: <a href="mailto:info@hoopconnect.de" className="text-blue-600 hover:underline">info@hoopconnect.de</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Umsatzsteuernummer: </h2>
          <p>DE327417658  Kleinunternehmerregelung nach § 19 Abs. 1 UStG</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder
            nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
            Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
            Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
            außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
          <p>
            Bei Fragen zum Impressum oder rechtlichen Anliegen erreichst du uns gern über unser <Link to="/contact" className="text-blue-600 hover:underline">Kontaktformular</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ImpressumPage;
