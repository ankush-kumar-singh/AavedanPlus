import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';

function ApplicationReview() {
  const navigate = useNavigate();
  const { application, documents, backendResponse, addActivity } = useApplication();

  const serviceName =
    application?.service || backendResponse?.service_name || 'Income Certificate';
  const applicationId =
    application?.id || backendResponse?.application_id || 'Not generated yet';

  const validatedDocuments = documents.filter(
    (document) => document.status === 'validated'
  );

  const handleProceed = () => {
    addActivity('SYSTEM', 'Application review opened');
    navigate('/consent');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Application Review</h1>
            <p className="text-sm text-gray-500 mt-1">{serviceName}</p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-4 py-2"
          >
            <ArrowLeft size={14} /> Documents
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-green-900">Application is ready for consent</p>
            <p className="text-sm text-green-700 mt-1">
              Review the information available from the backend before authorising submission.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Backend application state</h2>
              <p className="text-xs text-gray-500">No frontend-generated application data is used for submission.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Service" value={serviceName} />
            <Info label="Application ID" value={applicationId} />
            <Info label="Current step" value={backendResponse?.current_step || 'Ready for review'} />
            <Info label="Status" value={backendResponse?.application_status || 'Not submitted'} />
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={18} className="text-blue-600" />
            <h2 className="font-bold text-gray-900">Validated Documents</h2>
          </div>

          {validatedDocuments.length ? (
            <div className="space-y-3">
              {validatedDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{document.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{document.path}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                    <CheckCircle2 size={14} /> Validated
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              The backend has not returned a validated document list yet.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Continue to Consent <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1 break-words">{value}</p>
    </div>
  );
}

export default ApplicationReview;
