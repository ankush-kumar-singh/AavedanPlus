import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Upload,
} from 'lucide-react';
import { useApplication } from '../context/useApplication';
import { useAuth } from '../context/useAuth';
import { APP_STATUS } from '../context/applicationStatus';
import { chatAPI, requirementsAPI, uploadAPI } from '../services/api';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function Documents() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const {
    application,
    documents,
    setDocuments,
    setApplication,
    addActivity,
    addMessage,
    setAppStatus,
    appStatus,
    isRestoring,
  } = useApplication();
  const { user } = useAuth();

  const [requirementsResult, setRequirementsResult] = useState({
    serviceId: null,
    requirements: [],
    serviceName: '',
    error: '',
  });
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const [error, setError] = useState('');
  const isSubmitted = appStatus === APP_STATUS.SUBMITTED;
  const serviceId = application?.serviceId;
  const hasRequirementsResult = requirementsResult.serviceId === serviceId;
  const serviceName = application?.service || requirementsResult.serviceName || '';
  const loadingRequirements = Boolean(!isRestoring && serviceId && !hasRequirementsResult);
  const noServiceSelected = !isRestoring && !serviceId;
  const visibleError = error ||
    (hasRequirementsResult ? requirementsResult.error : '') ||
    (noServiceSelected ? 'Choose a service before uploading documents.' : '');

  useEffect(() => {
    let active = true;

    if (isRestoring || !application?.serviceId) return () => { active = false; };

    requirementsAPI
      .get(application.serviceId)
      .then(({ data }) => {
        if (!active) return;
        setRequirementsResult({
          serviceId: application.serviceId,
          requirements: data.requirements || [],
          serviceName: data.service_name || application.service || '',
          error: '',
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setRequirementsResult({
          serviceId: application.serviceId,
          requirements: [],
          serviceName: application.service || '',
          error:
            requestError.response?.data?.detail ||
            'Could not load this service’s document requirements.',
        });
      });

    return () => {
      active = false;
    };
  }, [application?.serviceId, application?.service, isRestoring]);

  const requirementRows = useMemo(
    () => {
      const requirements = hasRequirementsResult ? requirementsResult.requirements : [];
      return requirements.map((requirement) => {
        const matchingDocuments = documents.filter((document) =>
          requirement.accepted_documents?.includes(document.document_type)
        );
        return {
          ...requirement,
          matchingDocuments,
          complete: matchingDocuments.length > 0,
          required: requirement.required !== false,
        };
      });
    },
    [hasRequirementsResult, requirementsResult.requirements, documents]
  );

  const requiredRows = requirementRows.filter((row) => row.required);
  const completeRequiredCount = requiredRows.filter((row) => row.complete).length;
  const allRequiredUploaded =
    !loadingRequirements && requiredRows.length > 0 &&
    completeRequiredCount === requiredRows.length;

  const openFilePicker = (requirementKey) => {
    if (isSubmitted) return;
    setError('');
    setUploadTarget(requirementKey);
    inputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (isSubmitted) {
      setError('This submitted demo application is read-only. Start a new application to upload more documents.');
      return;
    }
    if (!user?.id) {
      setError('Your sign-in session is missing. Sign in again to continue.');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('PDF files must be 10 MB or smaller.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const { data } = await uploadAPI.upload(
        user.id,
        application.serviceId,
        file
      );
      setDocuments((previous) => [
        ...previous.filter((document) => document.id !== data.id),
        data,
      ]);
      addActivity('USER', `Uploaded ${data.filename} (${data.document_type})`);
      const matchedRequirements = requirementRows.filter((requirement) =>
        requirement.accepted_documents?.includes(data.document_type)
      );
      if (matchedRequirements.length > 0) {
        const labels = matchedRequirements.map((requirement) => requirement.label);
        addMessage(
          'agent',
          `I could read ${data.filename} and identified it as ${formatLabel(data.document_type)}. It matches: ${labels.join(', ')}. This checks readability and document type only; it does not verify authenticity with a government database.`
        );
      } else {
        addMessage(
          'agent',
          `I could read ${data.filename} and identified it as ${formatLabel(data.document_type)}, but that type does not match any configured requirement for ${serviceName}. It will not count toward the required documents. This prototype does not verify authenticity with a government database.`
        );
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'The document could not be processed. Please try another PDF.'
      );
    } finally {
      setUploading(false);
      setUploadTarget(null);
    }
  };

  const handleProceed = async () => {
    if (!allRequiredUploaded || proceeding || isSubmitted) return;
    if (!user?.id) {
      setError('Your sign-in session is missing. Sign in again to continue.');
      return;
    }

    setProceeding(true);
    setError('');
    try {
      const { data } = await chatAPI.send({
        userId: user.id,
        serviceId: application.serviceId,
        message: 'Prepare my application form for review.',
      });
      if (data.message) addMessage('agent', data.message);

      const isReady =
        ['FORM_INCOMPLETE', 'WAITING_CONSENT'].includes(data.current_step) &&
        data.form_data &&
        typeof data.form_data === 'object';

      if (!isReady) {
        setAppStatus(data.current_step || 'DOCUMENTS_PENDING');
        setError(
          data.message ||
            'The agent has not prepared the application form yet. Review the document requirements and try again.'
        );
        return;
      }

      setApplication((previous) => ({
        ...(previous || {}),
        id: data.application_id || previous?.id || null,
        serviceId: data.service || previous?.serviceId,
        service: data.service_name || previous?.service,
        formData: data.form_data,
        requiredDocuments: data.required_documents || [],
        validatedDocuments: data.validated_documents || {},
      }));
      setAppStatus(data.current_step);
      addActivity('SYSTEM', 'Application form prepared by the agent');
      navigate('/review');
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Could not prepare the application. Check your connection and try again.'
      );
    } finally {
      setProceeding(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate('/agent')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:text-blue-950"
        >
          <ArrowLeft size={16} /> Back to assistant
        </button>

        {isRestoring && (
          <div role="status" className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Restoring your saved application…
          </div>
        )}

        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Application documents
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Upload the documents for {serviceName || 'your selected service'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload clear PDFs up to 10 MB. The system checks that each PDF is readable and identifies its document type; it does not confirm authenticity with a government agency.
          </p>
        </header>

        {visibleError && (
          <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{visibleError}</span>
          </div>
        )}

        {isSubmitted && (
          <div role="status" className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            This submitted demo application is read-only. Start a new application to change its documents.
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Required documents</h2>
              <p className="mt-1 text-sm text-slate-600">
                {loadingRequirements
                  ? 'Loading requirements…'
                  : `${completeRequiredCount} of ${requiredRows.length} required document types supplied`}
              </p>
            </div>
            {loadingRequirements && <LoaderCircle className="animate-spin text-blue-700" size={20} />}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileSelected}
          />

          <div className="divide-y divide-slate-100">
            {requirementRows.map((requirement) => (
              <div key={requirement.key} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${requirement.complete ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {requirement.complete ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{requirement.label}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${requirement.required ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {requirement.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Upload any one: {(requirement.accepted_documents || []).map(formatLabel).join(', ')}
                    </p>
                    {requirement.matchingDocuments.length > 0 && (
                      <p className="mt-2 break-all text-sm text-green-800">
                        Readable upload: {requirement.matchingDocuments.map((document) => `${document.filename} (${formatLabel(document.document_type)})`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openFilePicker(requirement.key)}
                  disabled={uploading || loadingRequirements || isSubmitted}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading && uploadTarget === requirement.key ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {requirement.complete ? 'Add another PDF' : 'Choose PDF'}
                </button>
              </div>
            ))}
            {!loadingRequirements && requirementRows.length === 0 && !visibleError && (
              <p className="px-5 py-8 text-sm text-slate-600">{noServiceSelected ? 'Choose a service to see its example requirements.' : 'No requirements were returned for this service.'}</p>
            )}
          </div>
        </section>

        <footer className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`font-semibold ${allRequiredUploaded ? 'text-green-800' : 'text-slate-800'}`}>
              {allRequiredUploaded ? 'All required document types are readable.' : 'Upload one accepted document for each required item to continue.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Optional items do not block the application.
            </p>
          </div>
          <button
            type="button"
            onClick={handleProceed}
            disabled={!allRequiredUploaded || proceeding || uploading || isSubmitted}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {proceeding && <LoaderCircle size={17} className="animate-spin" />}
            Prepare application for review
            {!proceeding && <ArrowRight size={17} />}
          </button>
        </footer>
      </div>
    </main>
  );
}

function formatLabel(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default Documents;
