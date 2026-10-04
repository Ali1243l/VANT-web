import AdminNewsletterManager from './AdminNewsletterManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export default function NewsletterCampaignModal({ isOpen, onClose, lang = 'ar' }: Props) {
  return (
    <AdminNewsletterManager
      isOpen={isOpen}
      onClose={onClose}
      lang={lang}
      embedded={false}
    />
  );
}
