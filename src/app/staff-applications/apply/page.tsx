'use client';

import { useState } from 'react';
import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { Input } from '../../../components/ui/input';
import { api } from '../../../utils/api';

export default function ApplyPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function onResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/staff-applications/upload`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setResumeUrl(data.url);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  }

  async function onSubmit() {
    setError(null);
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (!position.trim()) {
      setError('Position is required');
      return;
    }

    setSubmitting(true);
    try {
      await api('/staff-applications', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          address,
          position,
          qualification,
          experience,
          coverLetter,
          resumeUrl,
        }),
      });
      setModalOpen(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Staff Applications" subtitle="Apply for a position" />
          <div className="mt-4">
            <Link
              href="/staff-applications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Application Form</h3>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the form below to submit your application
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Full Name *</label>
                <Input
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email *</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Phone *</label>
                <Input
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Position Applied For *</label>
                <Input
                  placeholder="e.g. Software Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Address</label>
                <Input
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Highest Qualification</label>
                <Input
                  placeholder="e.g. Bachelor's Degree"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Years of Experience</label>
                <Input
                  placeholder="e.g. 5 years"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Cover Letter</label>
                <textarea
                  placeholder="Tell us why you're a great fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Upload Resume (PDF)</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <input type="file" accept=".pdf" onChange={onResumeUpload} className="hidden" disabled={uploadingResume} />
                    {uploadingResume ? 'Uploading...' : resumeUrl ? 'Change Resume' : 'Upload Resume'}
                  </label>
                  {resumeUrl && <span className="text-sm text-green-600">✓ Resume uploaded</span>}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              {error && <span className="text-sm text-rose-600">{error}</span>}
            </div>
          </Card>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-[320px] p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 grid place-items-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Congratulations</div>
            <div className="text-sm text-gray-600 mb-5">
              Your application has been submitted successfully. We'll review it and get back to you soon.
            </div>
            <button 
              onClick={() => window.location.href = '/staff-applications'} 
              className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
