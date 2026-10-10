import { useState } from 'react';
import { LanguageContext } from './languageContext';

const translations = {
  en: {
    // ===== SIDEBAR =====
    myApplications: 'My Applications',
    newApplication: 'New Application',
    recent: 'Recent',
    success: 'SUCCESS',
    pending: 'PENDING',
    aavaedanVersion: 'Aavaedan+ v1.0',
    navHome: 'Home',
    navChat: 'Assistant Chat',
    navServices: 'Services',
    navStatus: 'Track Status',
    navAudit: 'Activity Log',
    logout: 'Logout',

    // ===== HOME =====
    heroTitle: 'What government service do you need?',
    heroSubtitle:
      "Tell me what you want to accomplish. I'll guide you through the entire process.",
    searchPlaceholder: 'I want to apply for an income certificate...',
    popularServices: 'POPULAR SERVICES',
    viewAll: 'View All',

    // ===== SERVICE NAMES =====
    incomeCert: 'Income Certificate',
    incomeCertDesc: 'Proof of income for scholarships & subsidies',
    residenceCert: 'Residence Certificate',
    residenceCertDesc: 'Proof of address for official purposes',
    casteCert: 'Caste Certificate',
    casteCertDesc: 'For education & employment benefits',
    ewsCert: 'EWS Certificate',
    ewsCertDesc: 'For economically weaker section benefits',
    birthCert: 'Birth Certificate',
    birthCertDesc: 'Official proof of birth registration',
    scholarship: 'Scholarship Application',
    scholarshipDesc: 'Apply for education scholarships',

    // ===== SERVICES PAGE =====
    allServices: 'Example Service Flows',
    servicesHero: 'Explore the Local Service Prototype',
    servicesSubtitle:
      'Explore six example service flows in this local prototype. It checks PDF readability and likely document type, helps prepare a sample form, and records demo submissions locally.',
    applyNow: 'Start Demo Flow',
    back: 'Back',

    // ===== AGENT =====
    agentTitle: 'Aavaedan+ AI Agent',
    agentSubtitle: 'Demo Application Preparation',
    chooseService: 'Choose a service',
    agentWelcomeTitle: 'Namaste! 🙏 I am your Aavaedan+ AI Assistant.',
    agentWelcomeBody:
      'Tell me which certificate or scholarship you need. I’ll show the required documents, take PDFs here, prepare the form for you to review in this chat, and ask for your approval before saving a local demo record.',
    agentWelcomeSelected:
      'We can prepare your {service} application here in chat. I’ll show the required documents and the form here; attach PDFs with the paperclip or drop them into the chat.',
    agentYesReply:
      'Open the Documents page to see the example requirements and upload PDFs for readability and likely document-type checks.',
    agentNoReply:
      'Open the Documents page to see which example document types this demo flow expects.',
    agentGenericReply:
      'I can help prepare a demo application. Open the Documents page to see the example requirements for your selected service.',
    uploadDocuments: 'Upload Documents',
    reviewApplication: 'Review Application',
    typeMessage: 'Type your message...',
    listening: 'Listening...',

    // ===== STATUS BADGES =====
    statusIdle: 'Idle',
    statusRequestReceived: 'Request Received',
    statusServiceNotSupported: 'Unsupported Service',
    statusCollectingDocs: 'Collecting Documents',
    statusValidating: 'Validating',
    statusFormReady: 'Form Ready',
    statusFormIncomplete: 'Details Needed',
    statusWaitingConsent: 'Waiting Consent',
    statusSubmitting: 'Submitting',
    statusSubmitted: 'Submitted ✓',

    // ===== DOCUMENTS =====
    documentsTitle: 'Your Documents',
    documentsValidation: 'Documents Validation',
    documentsValidationDesc:
      'Aavaedan+ automatically checks whether your uploaded documents satisfy the required categories. Green = validated, Yellow = missing.',
    documentsVerified: 'readable',
    allReady: 'All Ready',
    done: 'Done',
    validated: 'Validated',
    missing: 'Missing',
    usedFor: 'Used for',
    uploadNow: 'Upload Now',
    uploadedAt: 'Uploaded at',
    dragDrop: 'Drag & drop documents here',
    dragDropDesc: 'or click below to browse (PDF, JPG, PNG)',
    browseFiles: 'Browse Files',
    proceedToReview: 'Proceed to Review',

    // ===== REVIEW =====
    reviewTitle: 'Application Review',
    reviewSuccess: 'Your application form is ready!',
    reviewSuccessDesc:
      'Please carefully check the details below. After confirmation, you will be taken to the consent page.',
    applyingFor: 'Applying for',
    applicationId: 'Application ID',
    applicantDetails: 'Applicant Details',
    fullName: 'Full Name',
    dob: 'Date of Birth',
    fatherName: 'Father / Guardian Name',
    annualIncome: 'Annual Income',
    address: 'Address',
    district: 'District',
    state: 'State',
    pincode: 'Pincode',
    documentsLabel: 'Documents',
    verified: 'Readable',
    proceedToConsent: 'Proceed to Consent',

    // ===== CONSENT =====
    consentTitle: 'Review & Consent',
    consentSubtitle: 'Confirm before the demo submission',
    consentReady: 'Your form is ready for a demo record',
    consentReadyDesc: 'Check the details below. This prototype does not connect to a government service.',
    applicationSummary: 'Application Summary',
    service: 'Service',
    applicant: 'Applicant',
    consentRequired: 'Consent Required',
    consentRequiredDesc:
      'After your approval, the prototype will save this application in its local mock portal.',
    consentCheckbox:
      'I confirm that I reviewed these details and authorize Aavaedan+ to save this application in its local mock portal. No real government application will be submitted.',
    cancel: 'Cancel',
    approveSubmit: 'Approve & Save Demo',
    submitting: 'Submitting...',

    // ===== PORTAL =====
    portalTitle: 'Aavedan+ Demo Portal',
    portalMinistry: 'Local prototype · no government service connected',
    submittingTitle: 'Saving demo submission',
    submittingDesc: 'Please wait while the local mock portal records your application...',
    connectingPortal: 'Opening local demo portal',
    verifyingDocs: 'Checking document readability',
    validatingConsent: 'Checking your consent',
    submittingApp: 'Saving demo record',
    appReceived: 'Demo Record Saved ✅',
    appReceivedDesc:
      'The local mock portal recorded your demo application. No government service was contacted.',
    officialReceipt: 'Demo Submission Receipt',
    submittedOn: 'Submitted On',
    consentLabel: 'Consent',
    granted: 'Granted ✓',
    documentsReceived: 'Documents Received',
    statusLabel: 'Status',
    submittedStatus: 'SUBMITTED',
    receivedStamp: 'RECEIVED',
    whatNext: 'What happens next?',
    whatNextDesc:
      'This prototype does not send applications for government processing. You can view the status events recorded by the local demo portal.',
    backToHome: 'Back to Home',
    trackApplication: 'Track Application',

    // ===== STATUS PAGE =====
    statusTitle: 'Application Status',
    statusSubtitle: 'View status events in the local mock portal',
    currentStatus: 'Current Status',
    appDetails: 'Application Details',
    documentsCount: 'Documents',
    consentGranted: 'Granted ✓',
    timeline: 'Application Timeline',
    expectedTime: 'Demo status only',
    expectedTimeDesc:
      'No government processing time is available because this prototype does not contact a government service.',
    copyId: 'Copy ID',
    downloadReceipt: 'Download Receipt',
    stepRequestCreated: 'Request Created',
    stepRequestCreatedDesc: 'You requested the service',
    stepDocsValidated: 'Document Checks Complete',
    stepDocsValidatedDesc: 'Uploaded PDFs passed readability and likely type checks',
    stepFormPrepared: 'Demo Form Prepared',
    stepFormPreparedDesc: 'Draft fields were prepared from readable uploads; review each one',
    stepConsentGranted: 'Consent Granted',
    stepConsentGrantedDesc: 'You approved saving a local demo record',
    stepSubmissionAttempted: 'Submission Attempted',
    stepSubmissionAttemptedDesc: 'Local demo submission attempted',
    stepPortalAccepted: 'Demo Record Saved',
    stepPortalAcceptedDesc: 'A local demo record was saved; no government service was contacted',

    // ===== AUDIT LOG =====
    auditTitle: 'Application Activity',
    auditSubtitle: 'Activity recorded by the local prototype',
    activitySummary: 'Activity Summary',
    totalEvents: 'Total Events',
    userActions: 'User Actions',
    agentActions: 'Agent Actions',
    duration: 'Duration',
    filter: 'Filter:',
    all: 'All',
    user: 'User',
    agent: 'Agent',
    system: 'System',
    portal: 'Portal',
    activityTimeline: 'Activity Timeline',
    events: 'events',
    exportAudit: 'Export Audit Log',
  },

  hi: {
    // ===== SIDEBAR =====
    myApplications: 'मेरे आवेदन',
    newApplication: 'नया आवेदन',
    recent: 'हाल के',
    success: 'सफल',
    pending: 'लंबित',
    aavaedanVersion: 'आवेदन+ v1.0',
    navHome: 'होम',
    navChat: 'सहायक चैट',
    navServices: 'सेवाएँ',
    navStatus: 'स्थिति देखें',
    navAudit: 'गतिविधि लॉग',
    logout: 'लॉगआउट',

    // ===== HOME =====
    heroTitle: 'आपको कौन सी सरकारी सेवा चाहिए?',
    heroSubtitle:
      'बताइए आप क्या करना चाहते हैं। मैं पूरी प्रक्रिया में आपका मार्गदर्शन करूँगा।',
    searchPlaceholder: 'मैं आय प्रमाण पत्र के लिए आवेदन करना चाहता हूँ...',
    popularServices: 'लोकप्रिय सेवाएँ',
    viewAll: 'सभी देखें',

    // ===== SERVICE NAMES =====
    incomeCert: 'आय प्रमाण पत्र',
    incomeCertDesc: 'छात्रवृत्ति और सब्सिडी के लिए आय का प्रमाण',
    residenceCert: 'निवास प्रमाण पत्र',
    residenceCertDesc: 'आधिकारिक उद्देश्यों के लिए पते का प्रमाण',
    casteCert: 'जाति प्रमाण पत्र',
    casteCertDesc: 'शिक्षा और रोजगार लाभ के लिए',
    ewsCert: 'EWS प्रमाण पत्र',
    ewsCertDesc: 'आर्थिक रूप से कमजोर वर्ग के लाभ के लिए',
    birthCert: 'जन्म प्रमाण पत्र',
    birthCertDesc: 'जन्म पंजीकरण का आधिकारिक प्रमाण',
    scholarship: 'छात्रवृत्ति आवेदन',
    scholarshipDesc: 'शिक्षा छात्रवृत्ति के लिए आवेदन करें',

    // ===== SERVICES PAGE =====
    allServices: 'उदाहरण सेवा प्रवाह',
    servicesHero: 'स्थानीय सेवा प्रोटोटाइप देखें',
    servicesSubtitle:
      'इस स्थानीय प्रोटोटाइप में छह उदाहरण सेवा प्रवाह देखें। यह PDF की पठनीयता और संभावित दस्तावेज़ प्रकार जाँचता है, नमूना फॉर्म तैयार करने में मदद करता है और डेमो रिकॉर्ड स्थानीय रूप से सहेजता है।',
    applyNow: 'डेमो प्रवाह शुरू करें',
    back: 'वापस',

    // ===== AGENT =====
    agentTitle: 'आवेदन+ AI सहायक',
    agentSubtitle: 'डेमो आवेदन की तैयारी',
    chooseService: 'सेवा चुनें',
    agentWelcomeTitle: 'नमस्ते! 🙏 मैं आपका आवेदन+ AI सहायक हूँ।',
    agentWelcomeBody:
      'बताइए आपको कौन-सा प्रमाणपत्र या स्कॉलरशिप चाहिए। जरूरी दस्तावेज़, PDF अपलोड, फॉर्म की समीक्षा और आपकी मंजूरी—पूरा काम इसी चैट में होगा।',
    agentWelcomeSelected:
      'आपका {service} आवेदन इसी चैट में तैयार करेंगे। जरूरी दस्तावेज़ और फॉर्म यहीं दिखेंगे; PDF पेपरक्लिप से जोड़ें या चैट में छोड़ें।',
    agentYesReply:
      'उदाहरण आवश्यकताएँ देखने और PDF की पठनीयता व संभावित प्रकार जाँचने के लिए दस्तावेज़ पेज खोलें।',
    agentNoReply:
      'यह डेमो किन उदाहरण दस्तावेज़ प्रकारों की अपेक्षा करता है, यह देखने के लिए दस्तावेज़ पेज खोलें।',
    agentGenericReply:
      'मैं डेमो आवेदन तैयार करने में मदद कर सकता हूँ। चुनी हुई सेवा की उदाहरण आवश्यकताएँ देखने के लिए दस्तावेज़ पेज खोलें।',
    uploadDocuments: 'दस्तावेज़ अपलोड करें',
    reviewApplication: 'आवेदन देखें',
    typeMessage: 'अपना संदेश लिखें...',
    listening: 'सुन रहा हूँ...',

    // ===== STATUS BADGES =====
    statusIdle: 'निष्क्रिय',
    statusRequestReceived: 'अनुरोध प्राप्त',
    statusServiceNotSupported: 'असमर्थित सेवा',
    statusCollectingDocs: 'दस्तावेज़ एकत्रित',
    statusValidating: 'सत्यापन',
    statusFormReady: 'फॉर्म तैयार',
    statusFormIncomplete: 'जानकारी आवश्यक',
    statusWaitingConsent: 'सहमति प्रतीक्षित',
    statusSubmitting: 'जमा हो रहा है',
    statusSubmitted: 'जमा ✓',

    // ===== DOCUMENTS =====
    documentsTitle: 'आपके दस्तावेज़',
    documentsValidation: 'दस्तावेज़ सत्यापन',
    documentsValidationDesc:
      'आवेदन+ स्वचालित रूप से जाँचता है कि आपके अपलोड किए गए दस्तावेज़ आवश्यक श्रेणियों को पूरा करते हैं या नहीं। हरा = सत्यापित, पीला = अनुपलब्ध।',
    documentsVerified: 'पठनीय',
    allReady: 'सब तैयार',
    done: 'पूर्ण',
    validated: 'सत्यापित',
    missing: 'अनुपलब्ध',
    usedFor: 'उपयोग',
    uploadNow: 'अब अपलोड करें',
    uploadedAt: 'अपलोड किया',
    dragDrop: 'दस्तावेज़ यहाँ खींचें और छोड़ें',
    dragDropDesc: 'या नीचे क्लिक करें (PDF, JPG, PNG)',
    browseFiles: 'फ़ाइलें ब्राउज़ करें',
    proceedToReview: 'समीक्षा के लिए आगे बढ़ें',

    // ===== REVIEW =====
    reviewTitle: 'आवेदन समीक्षा',
    reviewSuccess: 'आपका आवेदन फॉर्म तैयार है!',
    reviewSuccessDesc:
      'नीचे दी गई जानकारी को ध्यान से जाँचें। पुष्टि करने के बाद आपको सहमति पेज पर ले जाया जाएगा।',
    applyingFor: 'आवेदन कर रहे हैं',
    applicationId: 'आवेदन ID',
    applicantDetails: 'आवेदक विवरण',
    fullName: 'पूरा नाम',
    dob: 'जन्म तिथि',
    fatherName: 'पिता / अभिभावक का नाम',
    annualIncome: 'वार्षिक आय',
    address: 'पता',
    district: 'ज़िला',
    state: 'राज्य',
    pincode: 'पिनकोड',
    documentsLabel: 'दस्तावेज़',
    verified: 'पठनीय',
    proceedToConsent: 'सहमति के लिए आगे बढ़ें',

    // ===== CONSENT =====
    consentTitle: 'समीक्षा और सहमति',
    consentSubtitle: 'डेमो जमा करने से पहले पुष्टि करें',
    consentReady: 'फॉर्म डेमो रिकॉर्ड के लिए तैयार है',
    consentReadyDesc: 'नीचे दी गई जानकारी जाँचें। यह प्रोटोटाइप किसी सरकारी सेवा से नहीं जुड़ता।',
    applicationSummary: 'आवेदन सारांश',
    service: 'सेवा',
    applicant: 'आवेदक',
    consentRequired: 'सहमति आवश्यक',
    consentRequiredDesc:
      'आपकी मंज़ूरी के बाद प्रोटोटाइप आवेदन को अपने स्थानीय मॉक पोर्टल में सहेजेगा।',
    consentCheckbox:
      'मैं पुष्टि करता/करती हूँ कि मैंने जानकारी जाँची है और आवेदन+ को इसे स्थानीय मॉक पोर्टल में सहेजने की अनुमति देता/देती हूँ। कोई वास्तविक सरकारी आवेदन जमा नहीं होगा।',
    cancel: 'रद्द करें',
    approveSubmit: 'स्वीकृत करें और डेमो सहेजें',
    submitting: 'जमा हो रहा है...',

    // ===== PORTAL =====
    portalTitle: 'आवेदन+ डेमो पोर्टल',
    portalMinistry: 'स्थानीय प्रोटोटाइप · कोई सरकारी सेवा जुड़ी नहीं है',
    submittingTitle: 'डेमो आवेदन सहेजा जा रहा है',
    submittingDesc: 'स्थानीय मॉक पोर्टल आवेदन दर्ज कर रहा है...',
    connectingPortal: 'स्थानीय डेमो पोर्टल खोल रहा है',
    verifyingDocs: 'दस्तावेज़ की पठनीयता जाँच रहा है',
    validatingConsent: 'आपकी सहमति जाँच रहा है',
    submittingApp: 'डेमो रिकॉर्ड सहेज रहा है',
    appReceived: 'डेमो रिकॉर्ड सहेजा गया ✅',
    appReceivedDesc:
      'स्थानीय मॉक पोर्टल ने आपका डेमो आवेदन दर्ज किया। किसी सरकारी सेवा से संपर्क नहीं हुआ।',
    officialReceipt: 'डेमो जमा रसीद',
    submittedOn: 'जमा किया',
    consentLabel: 'सहमति',
    granted: 'प्रदान ✓',
    documentsReceived: 'प्राप्त दस्तावेज़',
    statusLabel: 'स्थिति',
    submittedStatus: 'जमा',
    receivedStamp: 'प्राप्त',
    whatNext: 'आगे क्या होगा?',
    whatNextDesc:
      'यह प्रोटोटाइप सरकारी प्रक्रिया के लिए आवेदन नहीं भेजता। स्थानीय डेमो पोर्टल में दर्ज स्थिति घटनाएँ देख सकते हैं।',
    backToHome: 'होम पर वापस',
    trackApplication: 'आवेदन ट्रैक करें',

    // ===== STATUS PAGE =====
    statusTitle: 'आवेदन स्थिति',
    statusSubtitle: 'स्थानीय मॉक पोर्टल की स्थिति घटनाएँ देखें',
    currentStatus: 'वर्तमान स्थिति',
    appDetails: 'आवेदन विवरण',
    documentsCount: 'दस्तावेज़',
    consentGranted: 'प्रदान ✓',
    timeline: 'आवेदन टाइमलाइन',
    expectedTime: 'केवल डेमो स्थिति',
    expectedTimeDesc:
      'यह प्रोटोटाइप किसी सरकारी सेवा से जुड़ा नहीं है, इसलिए सरकारी प्रक्रिया का समय उपलब्ध नहीं है।',
    copyId: 'ID कॉपी करें',
    downloadReceipt: 'रसीद डाउनलोड करें',
    stepRequestCreated: 'अनुरोध बनाया गया',
    stepRequestCreatedDesc: 'आपने सेवा के लिए अनुरोध किया',
    stepDocsValidated: 'दस्तावेज़ जाँच पूरी',
    stepDocsValidatedDesc: 'अपलोड किए गए PDF की पठनीयता और संभावित प्रकार जाँचे गए',
    stepFormPrepared: 'डेमो फॉर्म तैयार',
    stepFormPreparedDesc: 'पठनीय अपलोड से ड्राफ्ट फ़ील्ड तैयार किए गए; हर फ़ील्ड जाँचें',
    stepConsentGranted: 'सहमति प्रदान',
    stepConsentGrantedDesc: 'आपने स्थानीय डेमो रिकॉर्ड सहेजने की मंज़ूरी दी',
    stepSubmissionAttempted: 'जमा का प्रयास',
    stepSubmissionAttemptedDesc: 'स्थानीय डेमो जमा करने का प्रयास किया गया',
    stepPortalAccepted: 'डेमो रिकॉर्ड सहेजा गया',
    stepPortalAcceptedDesc: 'स्थानीय डेमो रिकॉर्ड सहेजा गया; किसी सरकारी सेवा से संपर्क नहीं हुआ',

    // ===== AUDIT LOG =====
    auditTitle: 'आवेदन गतिविधि',
    auditSubtitle: 'स्थानीय प्रोटोटाइप में दर्ज गतिविधि',
    activitySummary: 'गतिविधि सारांश',
    totalEvents: 'कुल घटनाएँ',
    userActions: 'उपयोगकर्ता क्रियाएँ',
    agentActions: 'एजेंट क्रियाएँ',
    duration: 'अवधि',
    filter: 'फ़िल्टर:',
    all: 'सभी',
    user: 'उपयोगकर्ता',
    agent: 'एजेंट',
    system: 'सिस्टम',
    portal: 'पोर्टल',
    activityTimeline: 'गतिविधि टाइमलाइन',
    events: 'घटनाएँ',
    exportAudit: 'ऑडिट लॉग निर्यात करें',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  const t = (key, vars = {}) => {
    let text = translations[language][key] || key;
    Object.keys(vars).forEach((k) => {
      text = text.replace(`{${k}}`, vars[k]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
