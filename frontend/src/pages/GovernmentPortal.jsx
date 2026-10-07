import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import { statusAPI } from '../services/api';

function GovernmentPortal() {
  const navigate = useNavigate();
  const { application, backendResponse } = useApplication();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const applicationId =
    application?.id || backendResponse?.application_id || '';

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!applicationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await statusAPI.get(applicationId);
        if (active) setRecord(response.data);
      } catch {
        if (active) setRecord(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  const serviceName =
    record?.service_name ||
    application?.service ||
    backendResponse?.service_name ||
    'Government Service';

  const applicantName = record?.applicant_name || 'Applicant';
  const status = record?.status || backendResponse?.application_status || 'SUBMITTED';

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="bg-[#0b3d91] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Mock Government Portal</h1>
            <p className="text-xs text-blue-100">Aavedan+ demonstration environment</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 flex gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="text-green-600" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-900">Application submitted</h2>
            <p className="text-sm text-green-700 mt-1">
              The submission was confirmed by the Aavedan+ backend.
            </p>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8">
          <div className="text-center border-b border-dashed border-gray-300 pb-5 mb-6">
            <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
              Application Receipt
            </p>
            <p className="text-2xl font-bold text-[#0b3d91] mt-2">
              {applicationId || 'Not available'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Receipt label="Service" value={serviceName} icon={FileText} />
            <Receipt label="Applicant" value={applicantName} icon={Building2} />
            <Receipt label="Status" value={status} icon={CheckCircle2} />
            <Receipt label="Consent" value="Explicitly granted" icon={Shield} />
          </div>

          {record?.submitted_at && (
            <div className="mt-6 pt-5 border-t border-dashed border-gray-300">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Submitted at</p>
              <p className="font-semibold text-gray-800 mt-1">
                {new Date(record.submitted_at).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate('/status')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold"
          >
            Track Application <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

function Receipt({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default GovernmentPortal;
