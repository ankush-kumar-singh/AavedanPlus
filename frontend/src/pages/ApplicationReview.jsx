import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
} from 'lucide-react';
import { useApplication } from '../context/useApplication';
import { useAuth } from '../context/useAuth';
import { APP_STATUS } from '../context/applicationStatus';
import { formAPI } from '../services/api';

function ApplicationReview() {
  const navigate = useNavigate();
  const {
    application,
    documents,
    setApplication,
    setAppStatus,
    appStatus,
    addActivity,
    addMessage,
    isRestoring,
  } = useApplication();
  const { user } = useAuth();
  const fields = application?.formData?.fields || {};
  const [editedValues, setEditedValues] = useState({});
  const values = {
    ...Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [
        key,
        field.value == null ? '' : String(field.value),
      ])
    ),
    ...editedValues,
  };
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isSubmitted = appStatus === APP_STATUS.SUBMITTED;

  const missingFields = Object.entries(fields)
    .filter(([key, field]) => field.required !== false && !values[key]?.trim())
    .map(([, field]) => field.label);
  const canProceed = missingFields.length === 0 && Object.keys(fields).length > 0;
  const serviceName = application?.service || application?.formData?.service_name || 'Selected service';

  const handleSaveAndContinue = async () => {
    if (saving || isSubmitted) return;
    if (!user?.id) {
      setError('Your sign-in session is missing. Sign in again to continue.');
      return;
    }
    if (!canProceed) {
      setError(`Complete the required fields: ${missingFields.join(', ')}.`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data } = await formAPI.save(user.id, values);
      setApplication((previous) => ({
        ...(previous || {}),
        formData: data.form_data,
      }));
      if (data.current_step !== 'WAITING_CONSENT') {
        setError(
          data.missing_fields?.length
            ? `Complete the required fields: ${data.missing_fields.join(', ')}.`
            : 'The backend has not confirmed that the form is ready for consent.'
        );
        setAppStatus(data.current_step || 'FORM_INCOMPLETE');
        return;
      }

      setAppStatus('WAITING_CONSENT');
      addActivity('SYSTEM', 'Application details reviewed and saved');
      addMessage('agent', 'Your application details are saved. Please review the consent before submission.');
      navigate('/consent');
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Could not save the application details. Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!application?.formData || Object.keys(fields).length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{isRestoring ? 'Restoring your application…' : 'Application form is not ready'}</h1>
          {!isRestoring && <>
            <p className="mt-2 text-sm text-slate-600">Return to the document step and ask the assistant to prepare the form.</p>
            <button type="button" onClick={() => navigate('/documents')} className="mt-5 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white">
              Back to documents
            </button>
          </>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Application review</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Check your details</h1>
            <p className="mt-1 text-sm text-slate-600">{serviceName}</p>
          </div>
          <button type="button" onClick={() => navigate('/documents')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={16} /> Back to documents
          </button>
        </header>

        {isSubmitted && (
          <div role="status" className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            This submitted demo application is read-only. Start a new application to change its form.
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <FileText size={20} className="mt-0.5 shrink-0 text-blue-700" />
            <div>
              <h2 className="font-semibold text-blue-950">Review extracted information</h2>
              <p className="mt-1 text-sm text-blue-900">Values come from the uploaded documents. Check them carefully and fill any missing required information. No submission happens until you give consent on the next page.</p>
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Application details</h2>
            <p className="mt-1 text-sm text-slate-600">Fields marked required must be complete before continuing.</p>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            {Object.entries(fields).map(([key, field]) => {
              const missing = field.required !== false && !values[key]?.trim();
              return (
                <label key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {field.label}
                    {field.required !== false ? <span className="text-red-700">*</span> : <span className="text-xs font-normal text-slate-500">Optional</span>}
                  </span>
                  <input
                    type="text"
                    value={values[key] ?? ''}
                    onChange={(event) => setEditedValues((previous) => ({ ...previous, [key]: event.target.value }))}
                    disabled={isSubmitted}
                    maxLength={500}
                    aria-invalid={missing}
                    className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${missing ? 'border-amber-400 focus:border-amber-600 focus:ring-amber-100' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'}`}
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    {field.status === 'USER_PROVIDED' ? 'Edited by you' : field.value ? 'Extracted from document' : missing ? 'Required information is missing' : 'Not provided'}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-700" />
            <h2 className="font-bold text-slate-900">Uploaded documents</h2>
          </div>
          {documents.length ? (
            <ul className="divide-y divide-slate-100">
              {documents.map((document) => (
                <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-medium text-slate-800">{document.filename}</span>
                  <span className="text-slate-600">{formatLabel(document.document_type)} · Readable PDF</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No document details are available in this screen.</p>
          )}
          <p className="mt-3 text-xs text-slate-500">Readable and identified means the system could process the PDF. It does not mean the document has been authenticated by a government database.</p>
        </section>

        <footer className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm font-semibold ${canProceed ? 'text-green-800' : 'text-amber-800'}`}>
            {canProceed ? 'All required form fields are filled.' : `${missingFields.length} required field(s) still need information.`}
          </p>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={!canProceed || saving || isSubmitted}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? <LoaderCircle size={17} className="animate-spin" /> : null}
            Save and continue to consent
            {!saving && <ArrowRight size={17} />}
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

export default ApplicationReview;
