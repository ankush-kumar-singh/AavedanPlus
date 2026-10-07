import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import { chatAPI } from '../services/api';

const USER_ID = 'frontend_user';

const REQUIRED_DOCUMENTS = [
  {
    id: 'aadhaar',
    name: 'Aadhaar / Identity Document',
    purpose: 'Identity and address proof',
  },
  {
    id: 'salary',
    name: 'Salary Slip / Income Proof',
    purpose: 'Income verification',
  },
  {
    id: 'declaration',
    name: 'Self Declaration',
    purpose: 'Applicant declaration',
  },
];

function Documents() {
  const navigate = useNavigate();
  const {
    application,
    documents,
    setDocuments,
    addMessage,
    addActivity,
    applyBackendResponse,
  } = useApplication();

  const [paths, setPaths] = useState(() =>
    REQUIRED_DOCUMENTS.map(() => '')
  );
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const currentDocs = REQUIRED_DOCUMENTS.map((doc, index) => ({
    ...doc,
    path: paths[index],
    validated: documents.some(
      (item) => item.id === doc.id && item.status === 'validated'
    ),
  }));

  const updatePath = (index, value) => {
    setPaths((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleValidate = async () => {
    const missing = paths.some((path) => !path.trim());
    if (missing) {
      setError('Enter the local path for all three required documents.');
      return;
    }

    setError('');
    setValidating(true);

    try {
      const response = await chatAPI.send({
        userId: USER_ID,
        message: 'I have provided all required documents. Validate them and continue.',
        documents: paths.map((path) => path.trim()),
      });

      const data = response.data;
      applyBackendResponse(data);

      setDocuments(
        REQUIRED_DOCUMENTS.map((doc, index) => ({
          ...doc,
          id: doc.id,
          path: paths[index].trim(),
          status: 'validated',
          uploadedAt: new Date().toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        }))
      );

      if (data.message) {
        addMessage('agent', data.message);
      }
      addActivity('SYSTEM', 'Documents sent to backend for validation');

      if (data.current_step === 'WAITING_CONSENT') {
        navigate('/review');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Document validation failed. Check the paths and backend.'
      );
      addActivity('SYSTEM', 'Document validation failed');
    } finally {
      setValidating(false);
    }
  };

  const allPathsProvided = paths.every((path) => path.trim());

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold text-primary">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            {application?.service || 'Income Certificate'} · Validate documents using the Aavedan+ backend
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">
              Local demo document input
            </p>
            <p className="text-blue-700 mt-1">
              The current backend accepts document file paths, not browser multipart uploads.
              Enter paths that the FastAPI machine can access.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {currentDocs.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-white rounded-2xl border-2 p-5 ${
                doc.validated ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    doc.validated
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {doc.validated ? <CheckCircle2 size={22} /> : <FileText size={22} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{doc.name}</h3>
                    {doc.validated && (
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                        Validated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{doc.purpose}</p>

                  <div className="mt-4 flex gap-2">
                    <input
                      value={doc.path}
                      onChange={(event) => updatePath(index, event.target.value)}
                      placeholder="C:\path\to\document.pdf"
                      className="flex-1 min-w-0 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => updatePath(index, doc.path)}
                      className="px-4 rounded-xl border border-gray-300 text-gray-600"
                      title="Path field"
                    >
                      <FolderOpen size={18} />
                    </button>
                  </div>

                  {doc.validated && (
                    <p className="text-xs text-green-600 mt-2">
                      Backend accepted this document path.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <button
            onClick={() => navigate('/agent')}
            className="px-5 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold"
          >
            Back to Agent
          </button>

          <button
            onClick={handleValidate}
            disabled={!allPathsProvided || validating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:bg-gray-200 disabled:text-gray-400"
          >
            {validating ? 'Validating...' : 'Validate & Continue'}
            {!validating && <ArrowRight size={18} />}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Documents;
