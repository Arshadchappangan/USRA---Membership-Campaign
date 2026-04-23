import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { optional, z } from 'zod';
import { FiUser, FiCalendar, FiMapPin, FiPhone, FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { MdBloodtype } from 'react-icons/md';
import { useMembership } from '../context/MembershipContext';
import StepIndicator from '../components/StepIndicator';
import usraLogo from '../assets/usra-logo.png';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  father: z.string().min(2, "Father's name must be at least 2 characters"),
  mother: z.string().min(2, "Mother's name must be at least 2 characters"),
  place: z.string().min(2, 'Place must be at least 2 characters'),
  bloodGroup: z.string().optional(),
  phone: z.union([  
    z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'),
    z.literal(''),
  ]).optional(),
  email: z.union([
    z.string().email('Enter a valid email address'),
    z.literal(''),
  ]).optional(),
});

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FormField = ({ label, icon: Icon, error, optional, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      {Icon && <Icon className="w-4 h-4 text-usra-blue" />}
      {label}
      {optional && <span className="text-xs text-gray-400 font-normal">(Optional)</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span> {error}</p>}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { memberData, updateMemberData } = useMembership();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: memberData, // pre-fill if user navigates back
  });

  const selectedBloodGroup = watch('bloodGroup');

  // Just save to context and proceed — no API call
  const onSubmit = (data) => {
    updateMemberData(data);
    navigate('/photo');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="sticky top-0 z-20 glass border-b border-white/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img src={usraLogo} alt="USRA" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-base font-black text-gray-800">USRA Membership</h1>
            <p className="text-xs text-gray-500">Campaign 2026</p>
          </div>
        </div>
        <StepIndicator currentStep={1} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Personal <span className="gradient-text">Details</span>
          </h2>
          <p className="text-gray-500">Fill in your information — nothing is saved until you confirm</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic Info */}
                <div className="glass rounded-3xl p-6 shadow-card space-y-5">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full step-active flex items-center justify-center text-xs">1</span>
                  Basic Information
                </h3>

                <FormField label="Full Name" icon={FiUser} error={errors.name?.message}>
                  <input {...register('name')} className="input-usra" placeholder="Enter your full name" />
                </FormField>

                <FormField label="Date of Birth" icon={FiCalendar} error={errors.dob?.message}>
                  <input {...register('dob')} type="date" className="input-usra" max={new Date().toISOString().split('T')[0]} />
                </FormField>

                <FormField label="Gender" icon={FiUser} error={errors.gender?.message}>
                  <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((genderOption) => (
                    <label key={genderOption} className="cursor-pointer">
                    <input
                      type="radio"
                      value={genderOption}
                      {...register('gender')}
                      className="sr-only"
                    />
                    <div className={`text-center py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 hover:border-gray-300
                      ${watch('gender') === genderOption
                      ? 'border-blue-400 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {genderOption}
                    </div>
                    </label>
                  ))}
                  </div>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Father's Name" icon={FiUser} error={errors.father?.message}>
                  <input {...register('father')} className="input-usra" placeholder="Father's full name" />
                  </FormField>
                  <FormField label="Mother's Name" icon={FiUser} error={errors.mother?.message}>
                  <input {...register('mother')} className="input-usra" placeholder="Mother's full name" />
                  </FormField>
                </div>
                </div>

                {/* Additional Details */}
          <div className="glass rounded-3xl p-6 shadow-card space-y-5">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full step-active flex items-center justify-center text-xs">2</span>
              Additional Details
            </h3>

            <FormField label="Place / Location" icon={FiMapPin} error={errors.place?.message}>
              <input {...register('place')} className="input-usra" placeholder="Your city or town" />
            </FormField>

            <FormField label="Blood Group" icon={MdBloodtype} optional>
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((bg) => (
                  <label
                    key={bg}
                    className={`cursor-pointer`}
                  >
                    <input
                      type="radio"
                      value={bg}
                      checked={selectedBloodGroup === bg}
                      onChange={() => setValue('bloodGroup', bg)}
                      className="sr-only"
                    />
                    <div className={`text-center py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 hover:border-gray-300
                      ${selectedBloodGroup === bg
                        ? 'border-red-400 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {bg}
                    </div>
                  </label>
                ))}
              </div>
              {/* Deselect option */}
              {selectedBloodGroup && (
                <button
                  type="button"
                  onClick={() => setValue('bloodGroup', '')}
                  className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
                >
                  Clear selection
                </button>
              )}
            </FormField>
          </div>

          {/* Contact */}
          <div className="glass rounded-3xl p-6 shadow-card space-y-5">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full step-active flex items-center justify-center text-xs">3</span>
              Contact Information
            </h3>

            <FormField label="Phone Number" icon={FiPhone} error={errors.phone?.message} optional>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 whitespace-nowrap">
                  🇮🇳 +91
                </div>
                <input {...register('phone')} type="tel" className="input-usra flex-1" placeholder="10-digit mobile number" maxLength={10} />
              </div>
            </FormField>

            <FormField label="Email Address" icon={FiMail} error={errors.email?.message} optional>
              <input {...register('email')} type="email" className="input-usra" placeholder="your@email.com" />
            </FormField>
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-3 text-lg">
            Continue to Photo Upload
            <FiArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-gray-400 pb-8">
            Your data won't be saved until you confirm everything on the final step
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
