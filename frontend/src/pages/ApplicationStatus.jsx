import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import { statusAPI } from '../services/api';

function ApplicationStatus() {
  const navigate = useNavigate();
  const { application, backendResponse } = useApplication();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const applicationId =
    application?.id || backendResponse?.application_id || '';

  const loadStatus = async () => {
    if (!applicationId) {
      setLoading(false);
      setError('No application ID is available yet. Submit an application first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await statusAPI.get(applicationId);
      if (!response.data.found) {
        setError(response.data.message || 'Application not found.');
        setRecord(null);
      } else {
        setRecord(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Could not reach the backend status endpoint.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  const history = record?.status_history || [];
  const currentStatus = record?.status || backendResponse?.application_status || 'UNKNOWN';

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Application Status</h1>
            <p className="text-sm text-gray-500 mt-1">Live data from the Aavedan+ backend</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-4 py-2"
          >
            <ArrowLeft size={14} /> Home
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
            {error}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-6 text-white"
            >
              <p className="text-sm text-green-100">Current status</p>
              <h2 className="text-3xl font-bold mt-1">{currentStatus}</h2>
              <p className="text-sm text-green-100 mt-2">
                {record?.service_name || 'Government Service'}
              </p>

              <div className="mt-5 bg-white/10 rounded-xl p-4">
                <p className="text-xs text-green-100">Application ID</p>
                <p className="text-lg font-bold mt-1">{record?.application_id}</p>
              </div>
            </motion.div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-5">Application details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info label="Applicant" value={record?.applicant_name || '—'} />
                <Info label="Service" value={record?.service_name || '—'} />
                <Info label="Submitted" value={record?.submitted_at ? new Date(record.submitted_at).toLocaleString('en-IN') : '—'} />
                <Info label="Status" value={currentStatus} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Status history</h3>
                <button
                  onClick={loadStatus}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  title="Refresh"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {history.length ? (
                <div className="space-y-5">
                  {history.map((item, index) => (
                    <div key={`${item.timestamp}-${index}`} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={17} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.status}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 text-sm text-gray-500">
                  <Clock size={18} />
                  No status history returned.
                </div>
              )}

              <div className="mt-7 flex justify-end">
                <button
                  onClick={() => navigator.clipboard?.writeText(record?.application_id || '')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  <Copy size={15} /> Copy ID
                </button>
              </div>
            </div>
          </>
        )}
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

export default ApplicationStatus;
