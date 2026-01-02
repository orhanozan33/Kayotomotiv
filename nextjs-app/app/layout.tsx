import type { Metadata } from 'next';
import '@/app/globals.css';
import Layout from '@/components/Layout';
import I18nProvider from '@/components/I18nProvider';
import { ErrorProvider } from '@/contexts/ErrorContext';

export const metadata: Metadata = {
  title: 'KAY Oto Servis',
  description: 'Tüm otomotif ihtiyaçlarınız için güvenilir ortağınız',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <I18nProvider>
          <ErrorProvider>
            <Layout>{children}</Layout>
          </ErrorProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
