import React from 'react';
import ProfileForm from '../ProfileForm';

export default function ProfileSettings() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Profil</h2>
      <ProfileForm />
    </div>
  );
}