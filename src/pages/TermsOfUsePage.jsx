import React from 'react';
import { Link } from 'react-router-dom';



const TermsOfUsePage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Terms of Use</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 prose max-w-none">
        <p className="text-gray-500 mb-8">Last Updated: July 16, 2025</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p>
            Welcome to MeetBasket, a platform designed to connect basketball enthusiasts, find courts, 
            organize games, and build a basketball community. These Terms of Use govern your use of the 
            MeetBasket web application and any related services offered by MeetBasket.
          </p>
          <p>
            By accessing or using MeetBasket, you agree to be bound by these Terms of Use. If you 
            disagree with any part of these terms, you may not access our service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>"Service"</strong> refers to the MeetBasket web application.</li>
            <li><strong>"User"</strong> refers to any individual who accesses or uses the Service.</li>
            <li><strong>"Content"</strong> refers to any information, text, graphics, photos, or other materials uploaded, downloaded, or appearing on the Service.</li>
            <li><strong>"Premium"</strong> refers to the paid subscription service offered by MeetBasket.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities 
            or actions under your password. We encourage you to use a strong, unique password for your MeetBasket account.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. User Content</h2>
          <p>
            Our Service allows you to post, link, store, share, and otherwise make available certain information, 
            text, graphics, videos, or other material ("Content"). You are responsible for the Content that you 
            post on or through the Service, including its legality, reliability, and appropriateness.
          </p>
          <p>
            By posting Content on or through the Service, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms.</li>
            <li>The posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Premium Services</h2>
          <p>
            MeetBasket offers Premium subscription options that provide access to additional features. 
            By purchasing a Premium subscription, you agree to the following terms:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You authorize us to charge your payment method for the subscription fee.</li>
            <li>Subscription fees are billed in advance and are non-refundable.</li>
            <li>You can cancel your subscription at any time, but you will not receive a refund for the current billing period.</li>
            <li>We reserve the right to change subscription fees at any time. Any price changes will be communicated to you in advance.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality 
            are and will remain the exclusive property of MeetBasket and its licensors.
          </p>
          <p>
            The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. 
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of MeetBasket.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Prohibited Uses</h2>
          <p>
            You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate MeetBasket, a MeetBasket employee, another user, or any other person or entity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm MeetBasket or users of the Service.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
          <p>
            In no event shall MeetBasket, its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to or use of or inability to access or use the Service.</li>
            <li>Any conduct or content of any third party on the Service.</li>
            <li>Any content obtained from the Service.</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
            revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. 
            What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please <Link to="/contact" className="text-blue-600 hover:underline">contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfUsePage;