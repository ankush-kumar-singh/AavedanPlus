import { createContext, useContext, useState } from 'react';

const ApplicationContext = createContext();

export const APP_STATUS = {
  IDLE: 'IDLE',
  REQUEST_RECEIVED: 'REQUEST_RECEIVED',
  COLLECTING_DOCUMENTS: 'COLLECTING_DOCUMENTS',
  VALIDATING_DOCUMENTS: 'VALIDATING_DOCUMENTS',
  FORM_READY: 'FORM_READY',
  WAITING_CONSENT: 'WAITING_CONSENT',
  SUBMITTING: 'SUBMITTING',
  PORTAL_ERROR: 'PORTAL_ERROR',
  RECOVERING: 'RECOVERING',
  SUBMITTED: 'SUBMITTED',
  UNDER_VERIFICATION: 'UNDER_VERIFICATION',
};

export function ApplicationProvider({ children }) {
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [agentSteps, setAgentSteps] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [consent, setConsent] = useState('pending');
  const [appStatus, setAppStatus] = useState(APP_STATUS.IDLE);

  const addActivity = (actor, text) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setActivityFeed((prev) => [...prev, { time, actor, text }]);
  };

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text, time: new Date().toLocaleTimeString() }]);
  };

  return (
    <ApplicationContext.Provider value={{
      application, setApplication,
      documents, setDocuments,
      messages, setMessages, addMessage,
      agentSteps, setAgentSteps,
      activityFeed, setActivityFeed, addActivity,
      consent, setConsent,
      appStatus, setAppStatus,
    }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  return useContext(ApplicationContext);
}