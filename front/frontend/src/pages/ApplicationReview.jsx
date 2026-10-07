import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Calendar,
  IndianRupee,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';

function ApplicationReview() {
  const navigate = useNavigate();
  const { application, addActivity, addMessage, setAppStatus } = useApplication();

  // Demo applicant data
  const applicant = {
    fullName: 'Rahul Sharma',
    dob: '15 Aug 1995',
    fatherName: 'Suresh Sharma',
    address: '42, Nehru Nagar, Sector 12',
    district: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    annualIncome: '₹5,00,000',
  };

  const documents = [
    { name: 'Aadhaar Card', status: 'verified' },
    { name: 'Salary Slip', status: 'verified' },
    { name: 'Self Declaration', status: 'verified' },
  ];

  const serviceName = application?.service || 'Income Certificate';

  const handleProceed = () => {
    setAppStatus('WAITING_CONSENT');
    addActivity('SYSTEM', 'Application reviewed — proceeding to consent');
    addMessage(
      'agent',
      '✅ Application form review ho gaya. Ab aapko consent dena hai.'
    );
    navigate('/consent');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">
              📝 Application Review
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {serviceName} Application
            </p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Success banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-start gap-3"
        >
          <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-green-900">
              Aapka application form ready hai!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Neeche di gayi details ko carefully check karein. Confirm karne ke
              baad aapko consent page pe le jayenge.
            </p>
          </div>
        </motion.div>

        {/* Service Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white"
        >
          <p className="text-sm font-medium text-blue-100">Applying for</p>
          <h2 className="text-2xl font-bold mt-1">{serviceName}</h2>
          <p className="text-sm text-blue-100 mt-1">
            Application ID: {application?.id || 'APP-2026-1234'}
          </p>
        </motion.div>

        {/* Applicant Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <User size={16} />
            </div>
            <h3 className="font-bold text-primary">Applicant Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="Full Name" value={applicant.fullName} />
            <DetailRow label="Date of Birth" value={applicant.dob} icon={Calendar} />
            <DetailRow label="Father / Guardian Name" value={applicant.fatherName} />
            <DetailRow label="Annual Income" value={applicant.annualIncome} icon={IndianRupee} />
            <DetailRow
              label="Address"
              value={applicant.address}
              icon={MapPin}
              fullWidth
            />
            <DetailRow label="District" value={applicant.district} />
            <DetailRow label="State" value={applicant.state} />
            <DetailRow label="Pincode" value={applicant.pincode} />
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
            <h3 className="font-bold text-primary">Documents</h3>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between py-3 px-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <span className="font-medium text-gray-700">{doc.name}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Proceed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <button
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Proceed to Consent <ArrowRight size={18} />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

// Helper component for detail rows
function DetailRow({ label, value, icon: Icon, fullWidth }) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-gray-400 flex-shrink-0" />}
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default ApplicationReview;