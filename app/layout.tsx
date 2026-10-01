import React from 'react';

export const metadata = {
  title: 'VANT — Digital Lookbook',
  description: 'Archival Streetwear & Couture Atelier. Browse the latest drops and exclusive collections.',
  openGraph: {
    title: 'VANT — Digital Lookbook',
    description: 'Archival Streetwear & Couture Atelier. Browse the latest drops and exclusive collections.',
    url: 'https://vant.atelier',
    siteName: 'VANT',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'VANT — Digital Lookbook',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VANT — Digital Lookbook',
    description: 'Archival Streetwear & Couture Atelier. Browse the latest drops and exclusive collections.',
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
