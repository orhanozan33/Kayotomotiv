'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorProvider } from '@/contexts/ErrorContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    let authenticated = false;
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'admin' || userData.role === 'user') {
          authenticated = true;
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsAuthenticated(authenticated);
    setLoading(false);
  }, [pathname]); // pathname değiştiğinde de kontrol et

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/admin-panel/login') {
      router.push('/admin-panel/login');
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Login sayfasında authentication kontrolü yapma
  if (pathname === '/admin-panel/login') {
    return <ErrorProvider>{children}</ErrorProvider>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <ErrorProvider>{children}</ErrorProvider>;
}

