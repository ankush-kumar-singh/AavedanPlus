import { createContext, useContext, useState } from 'react';

const ApplicationContext = createContext(null);

export const APP_STATUS = {
  IDLE: 'IDLE',
  REQUEST_RECEIVED: 'REQUEST_RECEIVED',
  COLLECTING_DOCUMENTS: 'COLLECTING_DOCUMENTS',
  VALIDATING_DOCUMENTS: 'VALIDATING_DOCUMENTS',
  FORM_READY: 'FORM_READY',
  WAITING_CONSENT: 'WAITING_CONSENT',
  SUBMITTING: 'SUBMITTING',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  HUMAN_ESCALATION: 'HUMAN_ESCALATION',
};

export function ApplicationProvider({ children }) {
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [agentSteps, setAgentSteps] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [consent, setConsent] = useState('pending');
  const [appStatus, setAppStatus] = useState(APP_STATUS.IDLE);
  const [backendResponse, setBackendResponse] = useState(null);

  const addActivity = (actor, text) => {
    const time = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    setActivityFeed((prev) => [...prev, { time, actor, text }]);
  };

  const addMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        sender,
        text,
        time: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const applyBackendResponse = (data) => {
    setBackendResponse(data);

    if (data.service || data.service_name || data.application_id) {
      setApplication((prev) => ({
        ...(prev || {}),
        service: data.service_name || prev?.service || 'Government Service',
        serviceKey: data.service || prev?.serviceKey,
        id: data.application_id || prev?.id || null,
      }));
    }

    if (data.application_status) {
      setAppStatus(data.application_status);
    }

    if (data.current_step) {
      setAgentSteps((prev) => [...prev, data.current_step]);
    }

    if (data.escalated) {
      setAppStatus(APP_STATUS.HUMAN_ESCALATION);
    }
  };

  const resetApplication = () => {
    setApplication(null);
    setDocuments([]);
    setMessages([]);
    setAgentSteps([]);
    setActivityFeed([]);
    setConsent('pending');
    setAppStatus(APP_STATUS.IDLE);
    setBackendResponse(null);
  };

  return (
    <ApplicationContext.Provider
      value={{
        application,
        setApplication,
        documents,
        setDocuments,
        messages,
        setMessages,
        addMessage,
        agentSteps,
        setAgentSteps,
        activityFeed,
        setActivityFeed,
        addActivity,
        consent,
        setConsent,
        appStatus,
        setAppStatus,
        backendResponse,
        applyBackendResponse,
        resetApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  return useContext(ApplicationContext);
}
