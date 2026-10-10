import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useApplication } from '../context/useApplication';

function GovernmentPortal() {
  const navigate = useNavigate();
  const { application, documents, appStatus, isRestoring } = useApplication();
  const canShowReceipt = appStatus === 'SUBMITTED' && Boolean(application?.id);
  const fields = application?.formData?.fields || {};
  const applicantName =
    fields.applicant_name?.value ||
    fields.student_name?.value ||
    fields.child_name?.value ||
    application?.applicant?.name ||
    'Not available';

  useEffect(() => {
    if (!isRestoring && !canShowReceipt) navigate('/agent', { replace: true });
  }, [canShowReceipt, isRestoring, navigate]);

  if (isRestoring || !canShowReceipt) return null;

  const downloadReceipt = () => {
    const receipt = {
      type: 'Aavedan+ demo submission acknowledgement',
      application_id: application.id,
      service: application.service,
      applicant_name: applicantName,
      status: 'SUBMITTED_TO_DEMO_PORTAL',
      submitted_at: application.submittedAt || null,
      documents: documents.map(({ filename, document_type }) => ({
        filename,
        document_type,
      })),
      notice: 'This is a prototype acknowledgement. No information was sent to a real government portal.',
    };
    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: 'application/json',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${application.id}-demo-receipt.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-800">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Aavedan+ prototype</p>
            <h1 className="text-xl font-bold text-slate-900">Demo submission acknowledgement</h1>
          </div>
        </header>

        <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={24} />
            <div>
              <h2 className="text-lg font-bold text-green-950">The demo submission completed</h2>
              <p className="mt-1 text-sm leading-6 text-green-900">
                The local mock portal recorded this application. No information was sent to a real government service, and this reference is not an official application number.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <FileText size={18} className="text-blue-700" /> Demo receipt details
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <ReceiptRow label="Demo reference" value={application.id} mono />
            <ReceiptRow label="Service" value={application.service || 'Not available'} />
            <ReceiptRow label="Applicant" value={applicantName} />
            <ReceiptRow label="Demo status" value="SUBMITTED" />
            <ReceiptRow label="Recorded at" value={formatTimestamp(application.submittedAt)} />
          </dl>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Documents included in this demo</h2>
          {documents.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {documents.map((item) => (
                <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span className="font-medium text-slate-800">{item.filename}</span>
                  <span className="text-slate-600">{formatLabel(item.document_type)} · readable</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No document details are available in this browser session.</p>
          )}
        </section>

        <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={16} /> Back to home
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={downloadReceipt} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download size={16} /> Download demo receipt
            </button>
            <button type="button" onClick={() => navigate('/status')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900">
              View recorded status <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function ReceiptRow({ label, value, mono }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 break-words text-sm font-semibold text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function formatLabel(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTimestamp(value) {
  if (!value) return 'Time unavailable';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'Time unavailable'
    : parsed.toLocaleString('en-IN');
}

export default GovernmentPortal;
