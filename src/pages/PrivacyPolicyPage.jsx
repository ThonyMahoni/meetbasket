import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 prose max-w-none">
        <p className="text-gray-500 mb-8">Last Updated: July 16, 2025</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p>
            MeetBasket ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our web application 
            and services.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using MeetBasket, you acknowledge that 
            you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
          <p>We may collect the following types of personal information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, password, and profile information (such as basketball skill level and preferred position).</li>
            <li><strong>Profile Information:</strong> Information you provide in your user profile, including profile pictures, bio, and other details you choose to share.</li>
            <li><strong>User-Generated Content:</strong> Content you post, upload, or provide to the service, such as comments, messages, and game organization details.</li>
            <li><strong>Payment Information:</strong> If you purchase a premium subscription, we collect payment information, though credit card details are processed by our third-party payment processor.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Usage Information</h3>
          <p>We automatically collect certain information when you use our service:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Device Information:</strong> Information about the device you use to access our service, including hardware model, operating system, unique device identifiers, and mobile network information.</li>
            <li><strong>Log Information:</strong> Information that your browser or device sends whenever you visit our service, such as your IP address, browser type and settings, access times, and referring website addresses.</li>
            <li><strong>Location Information:</strong> With your permission, we collect precise location information from your device to help you find nearby basketball courts and games.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send administrative information, such as updates, security alerts, and support messages</li>
            <li>Connect you with other players and basketball games in your area</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize your experience by providing content and features that match your profile and interests</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Sharing of Information</h2>
          <p>We may share your information in the following situations:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>With Other Users:</strong> Information you provide in your public profile and content you post will be visible to other users of the service.</li>
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, and other business partners who perform services on our behalf.</li>
            <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. 
            However, please note that no method of transmission over the internet or electronic storage is 100% secure.
          </p>
          <p>
            While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. 
            You are responsible for maintaining the secrecy of your unique password and account information.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Your Data Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> You can request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information about you.</li>
            <li><strong>Deletion:</strong> You can request that we delete your personal information in certain circumstances.</li>
            <li><strong>Restriction:</strong> You can request that we restrict the processing of your information in certain circumstances.</li>
            <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, commonly used, and machine-readable format.</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
          <p>
            Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. 
            If we learn that we have collected personal information of a child under 13, we will take steps to delete such information as soon as possible.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Third-Party Links</h2>
          <p>
            Our service may contain links to third-party websites or services that are not owned or controlled by MeetBasket. 
            We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the "Last Updated" date at the top of this page.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please <Link to="/contact" className="text-blue-600 hover:underline">contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;