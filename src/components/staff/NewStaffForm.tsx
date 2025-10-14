'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../dashboard/Card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { apiMultipart } from '../../utils/api';

export default function NewStaffForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [designation, setDesignation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdName, setCreatedName] = useState('');

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPhoto(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  }

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.set('firstName', firstName);
      form.set('lastName', lastName);
      if (gender) form.set('gender', gender);
      if (phone) form.set('phone', phone);
      if (role) form.set('role', role);
      if (designation) form.set('designation', designation);
      if (photo) form.set('photo', photo);
      const res = await apiMultipart<{
        id: string;
        staffId: string;
        email: string;
        name: string;
        photoUrl?: string;
      }>(`/users`, form);
      setGeneratedEmail(res.email);
      setGeneratedStaffId(res.staffId);
      setCreatedName(`${firstName} ${lastName}`.trim());
      setShowSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to create staff');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card className="p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add a New Staff</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Upload card */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mx-auto w-full max-w-[300px]">
                <div className="h-[380px] rounded-xl border border-gray-200 grid place-items-center overflow-hidden">
                  <div className="text-center">
                    <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden border border-gray-300">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="preview"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-[#D9DEE7]" />
                          <div className="absolute inset-3 rounded-full bg-[#F6F8FB] grid place-items-center">
                            <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 text-gray-500"
                                fill="currentColor"
                              >
                                <path d="M12 5l2 2h3a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h3l2-2zm0 3a4 4 0 100 8 4 4 0 000-8z" />
                              </svg>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <label
                        htmlFor="photo-input"
                        className="inline-flex items-center h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
                      >
                        Choose photo
                      </label>
                      <input
                        id="photo-input"
                        type="file"
                        accept="image/*"
                        onChange={onPickPhoto}
                        className="hidden"
                      />
                      <span className="max-w-[180px] text-sm text-gray-600 truncate align-middle">
                        {photo?.name
                          ? photo.name.length > 28
                            ? `${photo.name.slice(0, 14)}…${photo.name.slice(-10)}`
                            : photo.name
                          : 'No file chosen'}
                      </span>
                    </div>
                    <div className="mt-8 text-xs text-gray-500">
                      <div>Allowed format</div>
                      <div className="font-medium text-gray-700">JPG, JPEG, and PNG</div>
                      <div className="mt-3">Max file size</div>
                      <div className="font-medium text-gray-700">2MB</div>
                    </div>
                  </div>
                </div>
                <button
                  disabled={submitting}
                  onClick={onSubmit}
                  className="mt-6 w-full h-12 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add Staff'}
                </button>
                {error && <div className="mt-3 text-sm text-rose-600 text-center">{error}</div>}
              </div>
            </div>
          </div>

          {/* Right: Form fields */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm text-gray-600 mb-2">First name</Label>
                <Input
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Last name</Label>
                <Input
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Phone number</Label>
                <Input
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Gender</Label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Role</Label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select role</option>
                    <option>Admin</option>
                    <option>HR</option>
                    <option>IT</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Designation</Label>
                <div className="relative">
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select designation</option>
                    <option>Operations</option>
                    <option>Human Resources</option>
                    <option>Security</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Staff ID (generated)</Label>
                <Input
                  placeholder="Will be generated"
                  value={generatedStaffId}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">
                  Official email (generated)
                </Label>
                <Input
                  placeholder="Will be generated"
                  value={generatedEmail}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center">
          <div className="w-[320px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <img
              src="/images/congratulations.png"
              alt="congratulations"
              className="mx-auto mb-3 h-16 w-16 object-contain"
            />
            <div className="text-lg font-semibold text-gray-900">Congratulations</div>
            <div className="mt-1 text-sm text-gray-600">
              You have successfully added a new staff member
            </div>
            <button
              onClick={() => router.push('/staff')}
              className="mt-5 inline-flex items-center justify-center h-10 w-full rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </>
  );
}
