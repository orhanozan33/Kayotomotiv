'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanelPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === 'admin' || userData.role === 'user') {
            router.push('/admin-panel/dashboard');
            return;
          }
        } catch (e) {
          // Invalid user data
        }
      }
      router.push('/admin-panel/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Yönlendiriliyor...</div>
    </div>
  );
}

