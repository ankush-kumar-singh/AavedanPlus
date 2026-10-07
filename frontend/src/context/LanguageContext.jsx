import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // ===== SIDEBAR =====
    myApplications: 'My Applications',
    newApplication: 'New Application',
    recent: 'Recent',
    success: 'SUCCESS',
    pending: 'PENDING',
    aavaedanVersion: 'Aavaedan+ v1.0',
    navHome: 'Home',
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
    govtSubsidy: 'Government Subsidy',
    govtSubsidyDesc: 'Apply for PM-KISAN & other schemes',
    ewsCert: 'EWS Certificate',
    ewsCertDesc: 'For economically weaker section benefits',
    birthCert: 'Birth Certificate',
    birthCertDesc: 'Official proof of birth registration',
    scholarship: 'Scholarship Application',
    scholarshipDesc: 'Apply for education scholarships',

    // ===== SERVICES PAGE =====
    allServices: 'Government Services',
    servicesHero: 'Apply for Government Services Easily',
    servicesSubtitle:
      'Aavaedan+ helps citizens complete government applications with AI assistance, document validation, form filling, consent-based submission, and application tracking.',
    applyNow: 'Apply Now',
    back: 'Back',

    // ===== AGENT =====
    agentTitle: 'Aavaedan+ AI Agent',
    agentSubtitle: 'Government Service Application',
    agentWelcomeTitle: 'Namaste! 🙏 I am your Aavaedan+ AI Assistant.',
    agentWelcomeBody:
      'You have applied for "{service}". I will guide you through the entire process.\n\nFirst, this service requires these documents:\n\n• Aadhaar Card (Identity + Address Proof)\n• Salary Slip (Income Proof)\n• Self Declaration (Declaration)\n\nDo you have these documents?',
    agentYesReply:
      'Perfect! 👍 Let\'s upload the documents. Go to the "Documents" page and upload your documents. I will verify them.',
    agentNoReply:
      'No problem! Please upload whatever documents you have. I will check which documents are missing.',
    agentGenericReply:
      'Got it. I will help you regarding "{msg}". To upload documents, go to the "Documents" page.',
    uploadDocuments: 'Upload Documents',
    reviewApplication: 'Review Application',
    typeMessage: 'Type your message...',
    listening: 'Listening...',

    // ===== STATUS BADGES =====
    statusIdle: 'Idle',
    statusRequestReceived: 'Request Received',
    statusCollectingDocs: 'Collecting Documents',
    statusValidating: 'Validating',
    statusFormReady: 'Form Ready',
    statusWaitingConsent: 'Waiting Consent',
    statusSubmitting: 'Submitting',
    statusSubmitted: 'Submitted ✓',

    // ===== DOCUMENTS =====
    documentsTitle: 'Your Documents',
    documentsValidation: 'Documents Validation',
    documentsValidationDesc:
      'Aavaedan+ automatically checks whether your uploaded documents satisfy the required categories. Green = validated, Yellow = missing.',
    documentsVerified: 'verified',
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
    verified: 'Verified',
    proceedToConsent: 'Proceed to Consent',

    // ===== CONSENT =====
    consentTitle: 'Review & Consent',
    consentSubtitle: 'Final step before submission',
    consentReady: 'Your application is ready for submission',
    consentReadyDesc: 'Check the details below and provide your consent.',
    applicationSummary: 'Application Summary',
    service: 'Service',
    applicant: 'Applicant',
    consentRequired: 'Consent Required',
    consentRequiredDesc:
      'Your application will be submitted to the government portal after your approval.',
    consentCheckbox:
      'I confirm that the information provided is correct and I authorize Aavaedan+ to submit this application on my behalf to the government portal.',
    cancel: 'Cancel',
    approveSubmit: 'Approve & Submit',
    submitting: 'Submitting...',

    // ===== PORTAL =====
    portalTitle: 'Government Service Portal',
    portalMinistry: 'Ministry of Citizen Services · Government of India',
    submittingTitle: 'Submitting to Government Portal',
    submittingDesc: 'Please wait while we submit your application...',
    connectingPortal: 'Connecting to portal',
    verifyingDocs: 'Verifying documents',
    validatingConsent: 'Validating consent',
    submittingApp: 'Submitting application',
    appReceived: 'Application Received ✅',
    appReceivedDesc:
      'Your application has been successfully submitted to the Government Portal.',
    officialReceipt: 'Official Submission Receipt',
    submittedOn: 'Submitted On',
    consentLabel: 'Consent',
    granted: 'Granted ✓',
    documentsReceived: 'Documents Received',
    statusLabel: 'Status',
    submittedStatus: 'SUBMITTED',
    receivedStamp: 'RECEIVED',
    whatNext: 'What happens next?',
    whatNextDesc:
      'Your application will be processed within 7 working days. Aavaedan+ will notify you as the status changes. You can track it on the Status page.',
    backToHome: 'Back to Home',
    trackApplication: 'Track Application',

    // ===== STATUS PAGE =====
    statusTitle: 'Application Status',
    statusSubtitle: 'Track your application in real-time',
    currentStatus: 'Current Status',
    appDetails: 'Application Details',
    documentsCount: 'Documents',
    consentGranted: 'Granted ✓',
    timeline: 'Application Timeline',
    expectedTime: 'Expected Processing Time',
    expectedTimeDesc:
      'Your application will be processed within 7 working days. Aavaedan+ will notify you as soon as the status changes.',
    copyId: 'Copy ID',
    downloadReceipt: 'Download Receipt',
    stepRequestCreated: 'Request Created',
    stepRequestCreatedDesc: 'You requested the service',
    stepDocsValidated: 'Documents Validated',
    stepDocsValidatedDesc: 'Aadhaar, Salary Slip, Self Declaration were verified',
    stepFormPrepared: 'Application Form Prepared',
    stepFormPreparedDesc: 'AI automatically filled the form',
    stepConsentGranted: 'Consent Granted',
    stepConsentGrantedDesc: 'You approved the submission',
    stepSubmissionAttempted: 'Submission Attempted',
    stepSubmissionAttemptedDesc: 'Submitted to government portal',
    stepPortalAccepted: 'Government Portal Accepted',
    stepPortalAcceptedDesc: 'Application submitted successfully',

    // ===== AUDIT LOG =====
    auditTitle: 'Application Activity',
    auditSubtitle: 'Complete audit log of your application',
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
    govtSubsidy: 'सरकारी सब्सिडी',
    govtSubsidyDesc: 'PM-KISAN और अन्य योजनाओं के लिए आवेदन करें',
    ewsCert: 'EWS प्रमाण पत्र',
    ewsCertDesc: 'आर्थिक रूप से कमजोर वर्ग के लाभ के लिए',
    birthCert: 'जन्म प्रमाण पत्र',
    birthCertDesc: 'जन्म पंजीकरण का आधिकारिक प्रमाण',
    scholarship: 'छात्रवृत्ति आवेदन',
    scholarshipDesc: 'शिक्षा छात्रवृत्ति के लिए आवेदन करें',

    // ===== SERVICES PAGE =====
    allServices: 'सरकारी सेवाएँ',
    servicesHero: 'सरकारी सेवाओं के लिए आसानी से आवेदन करें',
    servicesSubtitle:
      'आवेदन+ नागरिकों को AI सहायता, दस्तावेज़ सत्यापन, फॉर्म भरने, सहमति-आधारित जमा और आवेदन ट्रैकिंग के साथ सरकारी आवेदन पूरा करने में मदद करता है।',
    applyNow: 'अभी आवेदन करें',
    back: 'वापस',

    // ===== AGENT =====
    agentTitle: 'आवेदन+ AI सहायक',
    agentSubtitle: 'सरकारी सेवा आवेदन',
    agentWelcomeTitle: 'नमस्ते! 🙏 मैं आपका आवेदन+ AI सहायक हूँ।',
    agentWelcomeBody:
      'आपने "{service}" के लिए आवेदन किया है। मैं आपको पूरी प्रक्रिया में मार्गदर्शन करूँगा।\n\nसबसे पहले, इस सेवा के लिए ये दस्तावेज़ चाहिए:\n\n• आधार कार्ड (पहचान + पता प्रमाण)\n• वेतन पर्ची (आय प्रमाण)\n• स्व-घोषणा (घोषणा)\n\nक्या आपके पास ये दस्तावेज़ हैं?',
    agentYesReply:
      'बहुत बढ़िया! 👍 अब दस्तावेज़ अपलोड करते हैं। "दस्तावेज़" पेज पर जाकर अपने दस्तावेज़ अपलोड कीजिए। मैं सत्यापित कर दूँगा।',
    agentNoReply:
      'कोई बात नहीं! आप जो दस्तावेज़ हैं वो अपलोड कर दीजिए। मैं जाँच करूँगा कौन से दस्तावेज़ गायब हैं।',
    agentGenericReply:
      'समझ गया। "{msg}" के बारे में मैं आपकी मदद करूँगा। दस्तावेज़ अपलोड करने के लिए "दस्तावेज़" पेज पर जाएँ।',
    uploadDocuments: 'दस्तावेज़ अपलोड करें',
    reviewApplication: 'आवेदन देखें',
    typeMessage: 'अपना संदेश लिखें...',
    listening: 'सुन रहा हूँ...',

    // ===== STATUS BADGES =====
    statusIdle: 'निष्क्रिय',
    statusRequestReceived: 'अनुरोध प्राप्त',
    statusCollectingDocs: 'दस्तावेज़ एकत्रित',
    statusValidating: 'सत्यापन',
    statusFormReady: 'फॉर्म तैयार',
    statusWaitingConsent: 'सहमति प्रतीक्षित',
    statusSubmitting: 'जमा हो रहा है',
    statusSubmitted: 'जमा ✓',

    // ===== DOCUMENTS =====
    documentsTitle: 'आपके दस्तावेज़',
    documentsValidation: 'दस्तावेज़ सत्यापन',
    documentsValidationDesc:
      'आवेदन+ स्वचालित रूप से जाँचता है कि आपके अपलोड किए गए दस्तावेज़ आवश्यक श्रेणियों को पूरा करते हैं या नहीं। हरा = सत्यापित, पीला = अनुपलब्ध।',
    documentsVerified: 'सत्यापित',
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
    verified: 'सत्यापित',
    proceedToConsent: 'सहमति के लिए आगे बढ़ें',

    // ===== CONSENT =====
    consentTitle: 'समीक्षा और सहमति',
    consentSubtitle: 'जमा करने से पहले अंतिम चरण',
    consentReady: 'आपका आवेदन जमा करने के लिए तैयार है',
    consentReadyDesc: 'नीचे दी गई जानकारी जाँचें और सहमति दें।',
    applicationSummary: 'आवेदन सारांश',
    service: 'सेवा',
    applicant: 'आवेदक',
    consentRequired: 'सहमति आवश्यक',
    consentRequiredDesc:
      'आपकी मंज़ूरी के बाद आपका आवेदन सरकारी पोर्टल पर जमा किया जाएगा।',
    consentCheckbox:
      'मैं पुष्टि करता/करती हूँ कि दी गई जानकारी सही है और मैं आवेदन+ को मेरी ओर से यह आवेदन सरकारी पोर्टल पर जमा करने का अधिकार देता/देती हूँ।',
    cancel: 'रद्द करें',
    approveSubmit: 'स्वीकृत करें और जमा करें',
    submitting: 'जमा हो रहा है...',

    // ===== PORTAL =====
    portalTitle: 'सरकारी सेवा पोर्टल',
    portalMinistry: 'नागरिक सेवा मंत्रालय · भारत सरकार',
    submittingTitle: 'सरकारी पोर्टल पर जमा हो रहा है',
    submittingDesc: 'कृपया प्रतीक्षा करें जब तक हम आपका आवेदन जमा करते हैं...',
    connectingPortal: 'पोर्टल से जुड़ रहा है',
    verifyingDocs: 'दस्तावेज़ सत्यापित हो रहे हैं',
    validatingConsent: 'सहमति मान्य हो रही है',
    submittingApp: 'आवेदन जमा हो रहा है',
    appReceived: 'आवेदन प्राप्त ✅',
    appReceivedDesc:
      'आपका आवेदन सफलतापूर्वक सरकारी पोर्टल पर जमा हो गया है।',
    officialReceipt: 'आधिकारिक जमा रसीद',
    submittedOn: 'जमा किया',
    consentLabel: 'सहमति',
    granted: 'प्रदान ✓',
    documentsReceived: 'प्राप्त दस्तावेज़',
    statusLabel: 'स्थिति',
    submittedStatus: 'जमा',
    receivedStamp: 'प्राप्त',
    whatNext: 'आगे क्या होगा?',
    whatNextDesc:
      'आपका आवेदन 7 कार्य दिवसों में संसाधित किया जाएगा। स्थिति बदलने पर आवेदन+ आपको सूचित करेगा। आप इसे स्थिति पेज पर ट्रैक कर सकते हैं।',
    backToHome: 'होम पर वापस',
    trackApplication: 'आवेदन ट्रैक करें',

    // ===== STATUS PAGE =====
    statusTitle: 'आवेदन स्थिति',
    statusSubtitle: 'अपने आवेदन को रीयल-टाइम में ट्रैक करें',
    currentStatus: 'वर्तमान स्थिति',
    appDetails: 'आवेदन विवरण',
    documentsCount: 'दस्तावेज़',
    consentGranted: 'प्रदान ✓',
    timeline: 'आवेदन टाइमलाइन',
    expectedTime: 'अपेक्षित प्रसंस्करण समय',
    expectedTimeDesc:
      'आपका आवेदन 7 कार्य दिवसों में संसाधित किया जाएगा। स्थिति बदलते ही आवेदन+ आपको सूचित करेगा।',
    copyId: 'ID कॉपी करें',
    downloadReceipt: 'रसीद डाउनलोड करें',
    stepRequestCreated: 'अनुरोध बनाया गया',
    stepRequestCreatedDesc: 'आपने सेवा के लिए अनुरोध किया',
    stepDocsValidated: 'दस्तावेज़ सत्यापित',
    stepDocsValidatedDesc: 'आधार, वेतन पर्ची, स्व-घोषणा सत्यापित हुए',
    stepFormPrepared: 'आवेदन फॉर्म तैयार',
    stepFormPreparedDesc: 'AI ने स्वचालित रूप से फॉर्म भरा',
    stepConsentGranted: 'सहमति प्रदान',
    stepConsentGrantedDesc: 'आपने जमा करने की मंज़ूरी दी',
    stepSubmissionAttempted: 'जमा का प्रयास',
    stepSubmissionAttemptedDesc: 'सरकारी पोर्टल पर जमा किया',
    stepPortalAccepted: 'सरकारी पोर्टल ने स्वीकार किया',
    stepPortalAcceptedDesc: 'आवेदन सफलतापूर्वक जमा हुआ',

    // ===== AUDIT LOG =====
    auditTitle: 'आवेदन गतिविधि',
    auditSubtitle: 'आपके आवेदन का पूरा ऑडिट लॉग',
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

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};

export default LanguageContext;