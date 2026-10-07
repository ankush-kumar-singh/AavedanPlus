import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';

function Documents() {
  const navigate = useNavigate();
  const { application, addMessage, addActivity, setAppStatus } = useApplication();

  // Demo documents
  const [docs, setDocs] = useState([
    {
      id: 1,
      name: 'Aadhaar Card',
      usedFor: ['Identity Proof', 'Address Proof'],
      status: 'validated',
      uploadedAt: '5:15 PM',
    },
    {
      id: 2,
      name: 'Salary Slip',
      usedFor: ['Income Proof'],
      status: 'validated',
      uploadedAt: '5:16 PM',
    },
    {
      id: 3,
      name: 'Self Declaration',
      usedFor: ['Declaration'],
      status: 'missing',
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = (id) => {
    const now = new Date().toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'validated', uploadedAt: now } : d
      )
    );
    addActivity('USER', 'Uploaded Self Declaration');
    addMessage(
      'agent',
      '✅ Self Declaration upload ho gaya aur validate ho gaya! Ab saare documents ready hain.'
    );
  };

  const validatedCount = docs.filter((d) => d.status === 'validated').length;
  const totalCount = docs.length;
  const allValidated = validatedCount === totalCount;

  const handleProceed = () => {
    setAppStatus('FORM_READY');
    addActivity('SYSTEM', 'All documents validated — proceeding to review');
    addMessage(
      'agent',
      'Saare documents validate ho gaye! Ab application form review karte hain.'
    );
    navigate('/review');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">
              📄 Your Documents
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {application?.service || 'Government Service'} ·{' '}
              {validatedCount}/{totalCount} verified
            </p>
          </div>

          {/* Progress pill */}
          <div
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              allValidated
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {allValidated ? '✓ All Ready' : `${validatedCount}/${totalCount} Done`}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-3"
        >
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Documents Validation
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Aavaedan+ automatically checks whether your uploaded documents
              satisfy the required categories. Green = validated, Yellow =
              missing.
            </p>
          </div>
        </motion.div>

        {/* Document Cards */}
        <div className="space-y-4">
          {docs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl border-2 p-5 flex items-start gap-4 transition ${
                doc.status === 'validated'
                  ? 'border-green-200'
                  : 'border-amber-300 bg-amber-50/30'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  doc.status === 'validated'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                <FileText size={22} />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-primary text-base">{doc.name}</h3>
                  {doc.status === 'validated' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} /> Validated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                      <AlertCircle size={12} /> Missing
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">Used for:</span>{' '}
                  {doc.usedFor.join(', ')}
                </p>

                {doc.status === 'missing' && (
                  <button
                    onClick={() => handleUpload(doc.id)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    <Upload size={14} /> Upload Now
                  </button>
                )}

                {doc.status === 'validated' && doc.uploadedAt && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Uploaded at {doc.uploadedAt}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upload Drop Zone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          className={`mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <Upload className="mx-auto text-gray-400" size={32} />
          <p className="mt-3 text-sm font-semibold text-gray-700">
            Drag & drop documents here
          </p>
          <p className="text-xs text-gray-500 mt-1">
            or click below to browse (PDF, JPG, PNG)
          </p>
          <button className="mt-4 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition">
            Browse Files
          </button>
        </motion.div>

        {/* Proceed Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-end"
        >
          <button
            onClick={handleProceed}
            disabled={!allValidated}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              allValidated
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Proceed to Review <ArrowRight size={18} />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

export default Documents;