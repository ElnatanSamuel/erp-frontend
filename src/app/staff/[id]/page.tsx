'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { api, apiMultipart, API_ORIGIN } from '../../../utils/api';

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('');
  const [designation, setDesignation] = useState('');
  const [staffId, setStaffId] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showRoleSuccess, setShowRoleSuccess] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api<any>(`/users/${id}`)
      .then((u) => {
        if (!u || (u as any).error) {
          setError('Staff not found');
          return;
        }
        if (!alive) return;
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setGender(u.gender || '');
        setRole(u.role || '');
        setDesignation(u.designation || '');
        setStaffId(u.staffId || '');
        setOfficialEmail(u.email || '');
        setPhotoUrl(u.photoUrl || null);
      })
      .catch((e) => setError(e?.message || 'Failed to load staff'))
      .finally(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPhoto(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPhotoPreview(url);
      // Clear existing server photo to ensure preview shows
      setPhotoUrl(null);
    } else {
      setPhotoPreview(null);
    }
  }

  async function onSaveProfile() {
    setSavingProfile(true);
    setError(null);
    try {
      const form = new FormData();
      if (firstName) form.set('firstName', firstName);
      if (lastName) form.set('lastName', lastName);
      if (phone) form.set('phone', phone);
      if (gender) form.set('gender', gender);
      if (designation) form.set('designation', designation);
      if (photo) form.set('photo', photo);
      const updated = await apiMultipart<any>(`/users/${id}`, form);
      // reflect any updated fields/photo from server
      setPhotoUrl(updated.photoUrl || null);
      setPhotoPreview(null);
      setShowProfileSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
    } finally {
      setSavingProfile(false);
    }
  }

  async function onAssignRole() {
    setSavingRole(true);
    setError(null);
    try {
      const form = new FormData();
      if (role) form.set('role', role);
      const updated = await apiMultipart<any>(`/users/${id}`, form);
      // ensure local role reflects server
      setRole(updated.role || role);
      setShowRoleSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to assign role');
    } finally {
      setSavingRole(false);
    }
  }

  const displayPhoto = useMemo(() => {
    const src = photoPreview || photoUrl || '';
    if (!src) return '';
    if (/^(https?:|blob:|data:)/.test(src)) return src;
    return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
  }, [photoPreview, photoUrl]);

  return (
    <>
      <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 lg:px-10 pt-6 pb-4 bg-[#F4F7FC] border-b border-gray-100">
            <DashboardHeader title="Edit Staff" subtitle="Edit staff profile" />
            <div className="mt-4">
              <a
                href="/staff"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Back
              </a>
            </div>
          </div>

          <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
            <Card className="p-6 lg:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Photo */}
                <div className="lg:col-span-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="mx-auto w-full max-w-[300px]">
                      <div className="h-[380px] rounded-xl border border-gray-200 grid place-items-center overflow-hidden">
                        <div className="text-center">
                          <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden border border-gray-300">
                            {displayPhoto ? (
                              <img
                                src={displayPhoto}
                                alt="staff"
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
                              Update Photo
                            </label>
                            <input
                              id="photo-input"
                              type="file"
                              accept="image/*"
                              onChange={onPickPhoto}
                              className="hidden"
                            />
                          </div>
                          <div className="mt-8 text-xs text-gray-500">
                            <div>Allowed format</div>
                            <div className="font-medium text-gray-700">JPG, JPEG, and PNG</div>
                            <div className="mt-3">Max file size</div>
                            <div className="font-medium text-gray-700">2MB</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
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
                      <Label className="block text-sm text-gray-600 mb-2">Email address</Label>
                      <Input
                        placeholder="Enter email address"
                        value={email}
                        readOnly
                        className="bg-gray-50"
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
                      <Label className="block text-sm text-gray-600 mb-2">Staff ID</Label>
                      <Input
                        placeholder="Staff ID"
                        value={staffId}
                        readOnly
                        className="bg-gray-50"
                      />
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
                      <Label className="block text-sm text-gray-600 mb-2">Official email</Label>
                      <Input
                        placeholder="Official Email"
                        value={officialEmail}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={onSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center h-12 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Edit Profile'}
                    </button>
                    {error && <span className="ml-3 text-sm text-rose-600">{error}</span>}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 lg:p-7">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Assign Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">User ID</Label>
                  <Input value={staffId} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Role</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
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
                    <button
                      onClick={onAssignRole}
                      disabled={savingRole}
                      className="inline-flex items-center justify-center h-12 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
                    >
                      {savingRole ? 'Saving...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <footer className="text-center text-xs text-gray-400 pt-2 pb-6">
              Copyright © 2025 Relia Energy. All Rights Reserved
            </footer>
          </div>
        </div>
      </div>

      {showProfileSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center">
          <div className="w-[320px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <img
              src="/images/congratulations.png"
              alt="congratulations"
              className="mx-auto mb-3 h-16 w-16 object-contain"
            />
            <div className="text-lg font-semibold text-gray-900">Congratulations</div>
            <div className="mt-1 text-sm text-gray-600">
              You have successfully edited your profile
            </div>
            <button
              onClick={() => setShowProfileSuccess(false)}
              className="mt-5 inline-flex items-center justify-center h-10 w-full rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {showRoleSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center">
          <div className="w-[320px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <img
              src="/images/congratulations.png"
              alt="congratulations"
              className="mx-auto mb-3 h-16 w-16 object-contain"
            />
            <div className="text-lg font-semibold text-gray-900">Congratulations</div>
            <div className="mt-1 text-sm text-gray-600">
              You have successfully assigned role {role || '—'} to{' '}
              {`${firstName} ${lastName}`.trim() || 'user'}
            </div>
            <button
              onClick={() => setShowRoleSuccess(false)}
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
