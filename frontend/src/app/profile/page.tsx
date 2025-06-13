'use client';

import useAuth from '@/hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <p className="mb-2">
          <strong>ID:</strong> {user.id}
        </p>
        <p className="mb-2">
          <strong>Username:</strong> {user.username}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage; 