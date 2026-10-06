import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Send,
  Users,
  Copy,
  Check,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  History,
  Search,
  ShieldCheck,
  AlertCircle,
  Gift,
  Eye,
  ExternalLink,
  Save,
  CheckCircle2,
  Loader2,
  Tag,
  Layers,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Upload,
  FileImage,
  Camera,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  getStoredSubscribers,
  syncSubscribersFromCloud,
  addSubscriber,
  removeSubscriber,
  getSavedCampaigns,
  recordCampaign,
  generateMailtoLink,
  exportSubscribersToCSV,
  dispatchWelcomeEmailCopy,
  dispatchCampaignEmail,
  getStoredCampaignTemplates,
  saveCampaignTemplate,
  deleteCampaignTemplate,
  uploadCampaignImageFile,
  type NewsletterSubscriber,
  type CampaignOffer,
} from '../lib/newsletter';
import {
  DEFAULT_CAMPAIGN_TEMPLATES,
  type CampaignTemplateConfig,
} from '../lib/emailTemplates';
import WelcomeEmailTemplate from './WelcomeEmailTemplate';
import AdminNewsletterBoxStudio from './AdminNewsletterBoxStudio';
import { useSiteControls } from '../context/SiteControlsContext';

const CURATED_FASHION_PRESETS = [
  {
    id: 'p1',
    nameAr: 'موديل ستريتوير',
    nameEn: 'Streetwear Model',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p2',
    nameAr: 'معطف ورانوي',
    nameEn: 'Runway Overcoat',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p3',
    nameAr: 'سيلويت أسود',
    nameEn: 'Dark Silhouette',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p4',
    nameAr: 'تفصيل وخياطة راقية',
    nameEn: 'Atelier Tailoring',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
  },
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  lang?: 'ar' | 'en';
  embedded?: boolean;
  initialTab?: 'subscribers' | 'compose' | 'history' | 'welcome_settings' | 'box_design';
}

// Helper to guarantee absolute HTTPS image URLs for Supabase and external CDNs
const normalizeImageUrl = (raw: string): string => {
  const clean = (raw || '').trim();
  if (!clean) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?fm=jpg&fit=crop&w=1200&q=85';
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  const cleanPath = clean.replace(/^\/+/, '').replace(/^product-images\//, '');
  return `https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
};

export default function AdminNewsletterManager({
  isOpen = true,
  onClose,
  lang = 'ar',
  embedded = false,
  initialTab,
}: Props) {
  const isAr = lang === 'ar';
  const { siteSettings, updateSiteSettings, setIsPreviewWelcomeModal } = useSiteControls();
  const [activeTab, setActiveTab] = useState<'subscribers' | 'compose' | 'history' | 'welcome_settings' | 'box_design'>(
    initialTab || 'compose'
  );

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOffer[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplateConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Campaign Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_welcome_vip');
  const [campaignTitle, setCampaignTitle] = useState('الترحيب بالعضوية الحصرية · كود 15%');
  const [campaignSubject, setCampaignSubject] = useState('Welcome to VANT // Access Granted (VANT-WELCOME-15)');
  const [campaignHeadline, setCampaignHeadline] = useState('أهلاً بك في الأرشيف الخاص لـ ڤانت');
  const [campaignBadge, setCampaignBadge] = useState('VIP PRIVILEGE ACCESS');
  const [discountCode, setDiscountCode] = useState('VANT-WELCOME-15');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [campaignMessage, setCampaignMessage] = useState('يسعدنا انضمامك إلى القائمة الحصرية لعشاق الخياطة الراقية والتصاميم المعمارية الفاخرة. استمتع بتجربة تسوق استثنائية مع كود الخصم الترحيبي الخاص بطلبك الأول.');
  const [heroImageUrl, setHeroImageUrl] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80');
  const [ctaButtonText, setCtaButtonText] = useState('تصفح التشكيلة واستفد من الخصم');
  const [testRecipientEmail, setTestRecipientEmail] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customStoreUrl, setCustomStoreUrl] = useState(
    siteSettings.custom_store_url || 'https://vant-web.vercel.app/'
  );

  useEffect(() => {
    if (siteSettings.custom_store_url) {
      setCustomStoreUrl(siteSettings.custom_store_url);
    }
  }, [siteSettings.custom_store_url]);

  // Custom Template Creation Modal
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplSubject, setNewTplSubject] = useState('');
  const [newTplHeadline, setNewTplHeadline] = useState('');
  const [newTplMessage, setNewTplMessage] = useState('');
  const [newTplCode, setNewTplCode] = useState('VANT-SPECIAL-20');
  const [newTplPercent, setNewTplPercent] = useState(20);
  const [newTplBadge, setNewTplBadge] = useState('VIP PRIVILEGE ACCESS');
  const [newTplHeroImage, setNewTplHeroImage] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80');
  const [isUploadingModalImage, setIsUploadingModalImage] = useState(false);

  // Welcome Voucher & Modal Settings State
  const [welcomeTitleAr, setWelcomeTitleAr] = useState(siteSettings.welcome_title_ar || 'أهلاً بك في ڤانت!');
  const [welcomeTitleEn, setWelcomeTitleEn] = useState(siteSettings.welcome_title_en || 'Welcome to VANT!');
  const [welcomeMessageAr, setWelcomeMessageAr] = useState(
    siteSettings.welcome_message_ar ||
      'تم تفعيل اشتراكك بنجاح، وتم إرسال نسخة من العرض الترحيبي وكود الخصم إلى بريدك الإلكتروني.'
  );
  const [welcomeMessageEn, setWelcomeMessageEn] = useState(
    siteSettings.welcome_message_en ||
      'Your subscription is active! A welcome voucher and discount code have been dispatched to your email.'
  );
  const [welcomeCoupon, setWelcomeCoupon] = useState(siteSettings.welcome_coupon_code || 'VANT-WELCOME-15');
  const [welcomePct, setWelcomePct] = useState<number>(siteSettings.welcome_discount_percent ?? 15);
  const [welcomeModalEnabled, setWelcomeModalEnabled] = useState<boolean>(siteSettings.welcome_modal_enabled ?? true);
  const [welcomeAutoDispatch, setWelcomeAutoDispatch] = useState<boolean>(siteSettings.welcome_auto_dispatch ?? true);
  const [testWelcomeEmail, setTestWelcomeEmail] = useState('');
  const [isSavingWelcome, setIsSavingWelcome] = useState(false);
  const [isTestingWelcome, setIsTestingWelcome] = useState(false);

  // Initial Data Load & Cloud Sync
  useEffect(() => {
    if (isOpen || embedded) {
      loadData();
    }
  }, [isOpen, embedded]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const localSubs = getStoredSubscribers();
      setSubscribers(localSubs);
      setCampaigns(getSavedCampaigns());
      setTemplates(getStoredCampaignTemplates());

      // Background cloud sync
      const syncedSubs = await syncSubscribersFromCloud();
      setSubscribers(syncedSubs);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch Active Template
  const handleSelectTemplate = (tpl: CampaignTemplateConfig) => {
    setSelectedTemplateId(tpl.id);
    setCampaignTitle(isAr ? tpl.title : tpl.titleEn);
    setCampaignSubject(tpl.subject);
    setCampaignHeadline(isAr ? tpl.headline : tpl.headlineEn);
    setCampaignBadge(isAr ? tpl.badgeText : tpl.badgeTextEn);
    setDiscountCode(tpl.discountCode);
    setDiscountPercent(tpl.discountPercent);
    setCampaignMessage(isAr ? tpl.message : tpl.messageEn);
    setHeroImageUrl(tpl.heroImage);
    setCtaButtonText(isAr ? tpl.ctaText : tpl.ctaTextEn);
    setUploadedFileName(null);
  };

  // Handle Image File Upload for Main Campaign Form
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadCampaignImageFile(file);
      setHeroImageUrl(normalizeImageUrl(uploadedUrl));
      setUploadedFileName(file.name);
      setFeedbackMsg({
        type: 'success',
        text: isAr ? `✓ تم رفع وتثبيت صورة الغلاف (${file.name})` : `Image uploaded (${file.name})`,
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'فشل رفع ملف الصورة، يرجى المحاولة ثانية' : 'Failed to upload image file',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Image File Upload for Modal Template Form
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingModalImage(true);
    try {
      const uploadedUrl = await uploadCampaignImageFile(file);
      setNewTplHeroImage(uploadedUrl);
    } catch (err) {
      alert(isAr ? 'فشل رفع ملف الصورة' : 'Failed to upload image');
    } finally {
      setIsUploadingModalImage(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        (s.source && s.source.toLowerCase().includes(q)) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [subscribers, searchQuery]);

  const activeCount = useMemo(
    () => subscribers.filter((s) => s.status === 'active').length,
    [subscribers]
  );

  const handleAddManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmailInput.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address',
      });
      return;
    }

    const res = await addSubscriber(clean, isAr ? 'إضافة يدوية من لوحة التحكم' : 'Admin Manual Entry');
    if (res.success) {
      setSubscribers(getStoredSubscribers());
      setNewEmailInput('');
      setFeedbackMsg({
        type: 'success',
        text: res.isNew
          ? isAr
            ? `تمت إضافة المشترك (${clean}) بنجاح`
            : `Added subscriber (${clean}) successfully`
          : isAr
          ? `البريد (${clean}) موجود مسبقاً في القائمة`
          : `Email (${clean}) already exists in the list`,
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (window.confirm(isAr ? `هل أنت متأكد من حذف المشترك (${email})؟` : `Remove subscriber (${email})?`)) {
      await removeSubscriber(id);
      setSubscribers(getStoredSubscribers());
      setFeedbackMsg({
        type: 'success',
        text: isAr ? `تم حذف (${email}) من القائمة` : `Removed (${email})`,
      });
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  const handleCopyBCCList = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === 'active')
      .map((s) => s.email.trim())
      .join(', ');

    if (!activeEmails) {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'لا يوجد مشتركون نشطون للنسخ' : 'No active subscribers to copy',
      });
      return;
    }

    navigator.clipboard.writeText(activeEmails);
    setCopiedKey('bcc-list');
    setTimeout(() => setCopiedKey(null), 2500);
    setFeedbackMsg({
      type: 'success',
      text: isAr
        ? `تم نسخ (${activeCount}) بريد إلكتروني كـ BCC وجاهزة للإرسال الجماعي!`
        : `Copied ${activeCount} emails to clipboard (BCC ready)!`,
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Test send campaign to specific email
  const handleTestDispatchCampaign = async () => {
    const target = testRecipientEmail.trim().toLowerCase();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      alert(isAr ? 'يرجى كتابة بريد إلكتروني صحيح لإجراء الإرسال التجريبي' : 'Please enter a valid email address for testing');
      return;
    }

    setIsDispatching(true);
    try {
      const activeTpl = templates.find((t) => t.id === selectedTemplateId);
      const res = await dispatchCampaignEmail({
        recipientEmail: target,
        template: activeTpl,
        customHeadline: campaignHeadline,
        customMessage: campaignMessage,
        couponCode: discountCode,
        discountPercent: Number(discountPercent),
        subject: campaignSubject,
        badgeText: campaignBadge,
        heroImage: normalizeImageUrl(heroImageUrl),
        ctaText: ctaButtonText,
        ctaUrl: customStoreUrl,
      });

      if (res.emailSent) {
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `✓ تم إرسال نسخة العرض الفاخرة المعتمدة إلى إيميلك (${target}) بنجاح!`
            : `Delivered luxury email to (${target})!`,
        });
      } else {
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `✓ تم توثيق الرسالة في السجل وفتح مسودة الإرسال إلى (${target})!`
            : `Campaign documented and prepared for (${target})!`,
        });
      }
      setCampaigns(getSavedCampaigns());
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'حدث خطأ أثناء محاولة إرسال العرض' : 'Error sending campaign',
      });
    } finally {
      setIsDispatching(false);
      setTimeout(() => setFeedbackMsg(null), 4500);
    }
  };

  // Send via Mail Client (BCC Broadcast)
  const handleSendViaMailClient = async () => {
    if (activeCount === 0) {
      alert(isAr ? 'لا يوجد مشتركون نشطون لإرسال العرض لهم' : 'No active subscribers to send to');
      return;
    }

    const mailBody = `${campaignHeadline}\n\n${campaignMessage}\n\nبيانات الخصم:\n• كود الخصم: ${discountCode}\n• نسبة الخصم: ${discountPercent}%\n• رابط المتجر: https://vant.fashion\n\nفريق ڤانت للأزياء الحصرية`;
    const mailto = generateMailtoLink(subscribers, campaignSubject, mailBody);
    if (!mailto) return;

    // Record the campaign in archive
    const recorded = await recordCampaign({
      title: campaignTitle,
      subject: campaignSubject,
      discount_code: discountCode,
      discount_percent: discountPercent,
      body: mailBody,
      sent_count: activeCount,
      template_id: selectedTemplateId,
    });
    setCampaigns((prev) => [recorded, ...prev]);

    // Open mail client
    window.location.href = mailto;

    setFeedbackMsg({
      type: 'success',
      text: isAr
        ? `تم تجهيز رسالة العرض في برنامج البريد لـ (${activeCount}) مشترك، وحفظ العرض في السجل!`
        : `Email prepared for ${activeCount} recipients and campaign saved to archive!`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Add custom campaign template
  const handleCreateNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim()) {
      alert(isAr ? 'يرجى كتابة اسم القالب' : 'Please provide template name');
      return;
    }

    const newTpl: CampaignTemplateConfig = {
      id: `tpl_custom_${Date.now()}`,
      type: 'custom',
      title: newTplTitle.trim(),
      titleEn: newTplTitle.trim(),
      subject: newTplSubject.trim() || `VANT Special // Privilege Offer (${newTplCode})`,
      badgeText: newTplBadge.trim() || 'VIP PRIVILEGE ACCESS',
      badgeTextEn: newTplBadge.trim() || 'VIP PRIVILEGE ACCESS',
      headline: newTplHeadline.trim() || newTplTitle.trim(),
      headlineEn: newTplHeadline.trim() || newTplTitle.trim(),
      message: newTplMessage.trim() || 'عرض خاص ومحدود لمشتركي الأرشيف الخاص لـ ڤانت.',
      messageEn: newTplMessage.trim() || 'Exclusive private curation for VANT members.',
      discountCode: newTplCode.trim().toUpperCase(),
      discountPercent: Number(newTplPercent),
      heroImage: newTplHeroImage.trim() || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'تصفح التشكيلة واستفد من الخصم',
      ctaTextEn: 'EXPLORE COLLECTION // SHOP NOW',
      themeColor: '#004ad7',
      editionNote: `CUSTOM ARCHIVE · ${newTplCode.toUpperCase()}`,
    };

    const updated = await saveCampaignTemplate(newTpl);
    setTemplates(updated);
    handleSelectTemplate(newTpl);
    setShowAddTemplateModal(false);
    setNewTplTitle('');
    setNewTplHeadline('');
    setNewTplMessage('');

    setFeedbackMsg({
      type: 'success',
      text: isAr ? `تمت إضافة القالب الجديد (${newTpl.title}) بنجاح!` : 'New template added successfully!',
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Delete template
  const handleDeleteTemplate = async (tplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا القالب؟' : 'Delete this template?')) {
      const updated = await deleteCampaignTemplate(tplId);
      setTemplates(updated);
      if (selectedTemplateId === tplId) {
        handleSelectTemplate(updated[0] || DEFAULT_CAMPAIGN_TEMPLATES[0]);
      }
    }
  };

  // Save Welcome Settings
  const handleSaveWelcomeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWelcome(true);
    try {
      await updateSiteSettings({
        welcome_title_ar: welcomeTitleAr.trim(),
        welcome_title_en: welcomeTitleEn.trim(),
        welcome_message_ar: welcomeMessageAr.trim(),
        welcome_message_en: welcomeMessageEn.trim(),
        welcome_coupon_code: welcomeCoupon.trim().toUpperCase(),
        welcome_discount_percent: Number(welcomePct),
        welcome_modal_enabled: welcomeModalEnabled,
        welcome_auto_dispatch: welcomeAutoDispatch,
        custom_store_url: customStoreUrl.trim() || 'https://vant-web.vercel.app/',
      });
      setFeedbackMsg({
        type: 'success',
        text: isAr ? 'تم حفظ وتحديث إعدادات الرسالة الترحيبية ورابط المتجر في السحابة بنجاح!' : 'Welcome settings and store URL saved to cloud!',
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setIsSavingWelcome(false);
    }
  };

  const handleTestSendWelcome = async () => {
    const target = testWelcomeEmail.trim().toLowerCase();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      alert(isAr ? 'يرجى كتابة بريد إلكتروني صحيح لتجربة الإرسال' : 'Please enter a valid email address for testing');
      return;
    }

    setIsTestingWelcome(true);
    try {
      const res = await dispatchWelcomeEmailCopy(
        target,
        welcomeCoupon.trim().toUpperCase(),
        Number(welcomePct),
        isAr ? welcomeTitleAr : welcomeTitleEn,
        isAr ? welcomeMessageAr : welcomeMessageEn,
        heroImageUrl
      );

      if (res.emailSent) {
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `✓ تم إرسال نسخة رسمية وموثقة إلى إيميلك (${target}) بنجاح!`
            : `Official copy dispatched to (${target})!`,
        });
      } else {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? `تم توثيق الرسالة وفتح مسودة الإرسال إلى (${target})!` : `Prepared test copy to (${target})!`,
        });
      }
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'حدث خطأ أثناء محاولة إرسال النسخة' : 'Error sending email copy',
      });
    } finally {
      setIsTestingWelcome(false);
      setTimeout(() => setFeedbackMsg(null), 4500);
    }
  };

  const content = (
    <div className={`flex flex-col text-black dark:text-white font-sans ${embedded ? 'space-y-5' : 'relative w-full max-w-5xl max-h-[92vh] rounded-3xl border border-black/10 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#0d0f12] shadow-2xl overflow-hidden'}`}>
      
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-6 py-4.5 border-b border-black/5 dark:border-white/10 ${embedded ? 'bg-white/80 dark:bg-[#14171d]/90 rounded-2xl border' : 'bg-white/80 dark:bg-[#14171d]/90 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ad7] to-[#3b82f6] text-white shadow-lg shadow-[#004ad7]/25">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#15171c] dark:text-white">
                {isAr ? 'مركز النشرة البريدية والعروض الحصرية' : 'VANT Newsletter & Campaign Studio'}
              </h2>
              <span className="rounded-full bg-[#004ad7]/10 dark:bg-[#004ad7]/20 border border-[#004ad7]/30 px-3 py-0.5 text-xs font-bold text-[#004ad7] dark:text-[#60a5fa] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#004ad7] dark:bg-[#3b82f6] animate-pulse" />
                <span>{activeCount} {isAr ? 'مشترك نشط' : 'active members'}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isAr
                ? 'إدارة إيميلات المشتركين، تصميم العروض الحصرية، ورفع الصور كملفات مباشرة'
                : 'Manage subscriber dossier, upload campaign images as files, and dispatch official emails'}
            </p>
          </div>
        </div>

        {!embedded && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`mx-6 mt-3 px-4 py-2.5 text-xs font-semibold flex items-center gap-2 rounded-xl border ${
            feedbackMsg.type === 'success'
              ? 'bg-[#004ad7]/10 text-[#004ad7] dark:text-[#93c5fd] border-[#004ad7]/30'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#004ad7] dark:text-[#60a5fa]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          )}
          <span>{feedbackMsg.text}</span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className={`flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-black/5 dark:border-white/10 ${embedded ? 'bg-white/60 dark:bg-[#11141a] rounded-2xl border' : 'bg-white/60 dark:bg-[#11141a]'} overflow-x-auto text-xs font-bold`}>
        <button
          type="button"
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'compose'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold'
              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{isAr ? 'واجهات العروض والحملات' : 'Campaign & Offer Templates'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'subscribers'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold'
              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{isAr ? 'قائمة المشتركين' : 'Subscribers Dossier'}</span>
          <span className="bg-black/10 dark:bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
            {subscribers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('welcome_settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'welcome_settings'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold'
              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>{isAr ? 'إعدادات الترحيب التلقائي' : 'Welcome Automation'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('box_design')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'box_design'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold'
              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4 text-emerald-400" />
          <span>{isAr ? 'تخصيص مستطيل النشرة في المتجر' : 'Store Box Customizer'}</span>
          <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full text-[9.5px]">
            {isAr ? 'تعديل شامل' : 'Studio'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'history'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold'
              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          <span>{isAr ? 'سجل الحملات' : 'Sent History'}</span>
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* TAB 1: COMPOSE & TEMPLATES STUDIO */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            
            {/* Template Selector Carousel / Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <Tag className="h-4 w-4 text-[#004ad7] dark:text-[#3b82f6]" />
                  <span>{isAr ? 'اختر قالب العرض الترويجي (أو أضف قالباً جديداً):' : 'Select Campaign Template Preset:'}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(true)}
                  className="inline-flex items-center gap-1.5 bg-[#004ad7]/10 dark:bg-[#004ad7]/20 hover:bg-[#004ad7]/20 dark:hover:bg-[#004ad7]/30 border border-[#004ad7]/30 text-[#004ad7] dark:text-[#60a5fa] px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAr ? 'إضافة قالب جديد +' : 'Add New Template +'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const isDefault = DEFAULT_CAMPAIGN_TEMPLATES.some((d) => d.id === tpl.id);

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer text-start shadow-xs ${
                        isSelected
                          ? 'border-[#004ad7] bg-[#004ad7]/5 dark:bg-[#004ad7]/15 ring-2 ring-[#004ad7]/30'
                          : 'border-black/5 dark:border-white/10 bg-white dark:bg-[#14171d] hover:border-black/15 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
                          {tpl.badgeText || 'SPECIAL OFFER'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#004ad7] dark:text-[#60a5fa] bg-[#004ad7]/10 dark:bg-[#004ad7]/25 px-2.5 py-0.5 rounded-full">
                            خصم {tpl.discountPercent}%
                          </span>
                          {!isDefault && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                              title={isAr ? 'حذف القالب' : 'Delete'}
                              className="text-zinc-400 hover:text-rose-500 transition-colors p-0.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="mt-2 text-sm font-bold text-[#15171c] dark:text-white line-clamp-1">
                        {isAr ? tpl.title : tpl.titleEn}
                      </h4>

                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-[#004ad7] dark:text-[#3b82f6] font-mono font-bold">{tpl.discountCode}</span>
                        <span className="text-[11px]">{isSelected ? (isAr ? 'محدد حالياً' : 'Active') : (isAr ? 'انقر للتحديد' : 'Select')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Editor and Live Luxury Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Offer Details Editor (Selector 2) */}
              <div className="lg:col-span-6 space-y-4.5 bg-white dark:bg-[#14171d] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                  <span className="text-sm font-bold text-[#15171c] dark:text-white">
                    {isAr ? 'تخصيص بيانات ورسالة العرض' : 'Customize Offer Copy'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#004ad7] dark:text-[#60a5fa] bg-[#004ad7]/10 dark:bg-[#004ad7]/20 px-2.5 py-0.5 rounded-md">
                    {discountCode}
                  </span>
                </div>

                {/* Email Subject Line */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'عنوان الرسالة (Email Subject):' : 'Email Subject:'}
                  </label>
                  <input
                    type="text"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2.5 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                  />
                </div>

                {/* Badge & Headline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                      {isAr ? 'وسم الترويسة (Badge):' : 'Badge Tag:'}
                    </label>
                    <input
                      type="text"
                      value={campaignBadge}
                      onChange={(e) => setCampaignBadge(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                      {isAr ? 'العنوان الرئيسي داخل الرسالة:' : 'Headline:'}
                    </label>
                    <input
                      type="text"
                      value={campaignHeadline}
                      onChange={(e) => setCampaignHeadline(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7] font-bold"
                    />
                  </div>
                </div>

                {/* Code & Discount Percent */}
                <div className="grid grid-cols-2 gap-3 bg-black/5 dark:bg-black/30 p-3.5 rounded-2xl border border-black/5 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      {isAr ? 'رمز كود الخصم:' : 'Discount Code:'}
                    </label>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-[#004ad7]/30 bg-white dark:bg-black px-3 py-2 text-xs font-mono font-bold text-[#004ad7] dark:text-[#60a5fa] uppercase outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      {isAr ? 'نسبة الخصم (%):' : 'Discount Percent (%):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-black px-3 py-2 text-xs font-bold text-black dark:text-white outline-none shadow-xs"
                    />
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'نص بيان وتفاصيل العرض:' : 'Offer Message Text:'}
                  </label>
                  <textarea
                    rows={4}
                    value={campaignMessage}
                    onChange={(e) => setCampaignMessage(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 p-3.5 text-xs text-black dark:text-white leading-relaxed outline-none focus:border-[#004ad7]"
                  />
                </div>

                {/* Store URL & CTA Button Text (Editable Domain for Future Proofing) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/5 dark:bg-black/30 p-3.5 rounded-2xl border border-black/5 dark:border-white/10">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {isAr ? 'رابط المتجر / الدومين:' : 'Store URL / Domain:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomStoreUrl('https://vant-web.vercel.app/')}
                        className="text-[10px] text-[#004ad7] dark:text-[#60a5fa] hover:underline"
                      >
                        {isAr ? 'افتراضي' : 'Default'}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={customStoreUrl}
                      onChange={(e) => setCustomStoreUrl(e.target.value)}
                      placeholder="https://vant-web.vercel.app/"
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 py-2 text-xs font-mono text-black dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      {isAr ? 'نص زر الإجراء (CTA Text):' : 'CTA Button Text:'}
                    </label>
                    <input
                      type="text"
                      value={ctaButtonText}
                      onChange={(e) => setCtaButtonText(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 py-2 text-xs font-bold text-black dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>
                </div>

                {/* HERO IMAGE FILE UPLOAD (Selector 1) */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{isAr ? 'صورة الغلاف (رفع كملف مباشرة من جهازك):' : 'Editorial Hero Image (Upload File):'}</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">JPG, PNG, WEBP</span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={mainFileInputRef}
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />

                  {/* Drag / Click Upload Area */}
                  <div className="border border-dashed border-black/15 dark:border-white/15 hover:border-[#004ad7] dark:hover:border-[#3b82f6] bg-black/5 dark:bg-black/40 p-4 rounded-2xl transition-all text-center space-y-2">
                    {heroImageUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-20 shrink-0 rounded-xl border border-black/10 dark:border-white/20 overflow-hidden bg-black shadow-xs">
                          <img
                            src={heroImageUrl}
                            alt="Banner Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-start min-w-0">
                          <span className="text-xs font-bold text-black dark:text-white block truncate">
                            {uploadedFileName || (isAr ? 'صورة الغلاف المعتمدة' : 'Active Banner')}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                            {isAr ? '✓ الصورة جاهزة للإرسال في الإيميل' : '✓ Ready for dispatch'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => mainFileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 text-black dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 border border-black/5 dark:border-white/10"
                          >
                            {isUploadingImage ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                            )}
                            <span>{isAr ? 'تغيير الملف' : 'Replace'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => mainFileInputRef.current?.click()}
                        className="py-4 cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <Upload className="h-7 w-7 text-[#004ad7] dark:text-[#3b82f6] mx-auto mb-2" />
                        <span className="text-xs font-bold text-black dark:text-white block">
                          {isAr ? 'انقر هنا لرفع صورة من جهازك كملف' : 'Click to upload image file from device'}
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-1">
                          {isAr ? 'أو اختر من النماذج الجاهزة أدناه' : 'or choose a preset below'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Direct Image URL input */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      {isAr ? 'أو أدخل رابط صورة مباشر (URL):' : 'Or enter direct image URL:'}
                    </label>
                    <input
                      type="url"
                      value={heroImageUrl}
                      onChange={(e) => {
                        setHeroImageUrl(e.target.value);
                        setUploadedFileName(null);
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          setHeroImageUrl(normalizeImageUrl(e.target.value));
                        }
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 py-1.5 text-xs font-mono text-black dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>

                  {/* Curated Presets Quick Selector */}
                  <div>
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-2">
                      {isAr ? 'أو اختر صورة جاهزة بنقرة واحدة:' : 'Or choose curated preset:'}
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {CURATED_FASHION_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setHeroImageUrl(p.url);
                            setUploadedFileName(isAr ? p.nameAr : p.nameEn);
                          }}
                          className={`relative h-14 rounded-xl border overflow-hidden transition-all cursor-pointer group shadow-xs ${
                            heroImageUrl === p.url
                              ? 'border-[#004ad7] dark:border-[#3b82f6] ring-2 ring-[#004ad7]/30'
                              : 'border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25'
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.nameEn}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                            <span className="text-[9px] text-white truncate font-bold">
                              {isAr ? p.nameAr : p.nameEn}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dispatch Controls */}
                <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-3">
                  {/* Test Dispatch to Single Email */}
                  <div className="bg-black/5 dark:bg-black/40 p-4 rounded-2xl border border-black/5 dark:border-white/10 space-y-2.5">
                    <span className="text-xs font-bold text-[#15171c] dark:text-white block">
                      {isAr ? 'إرسال نسخة تجريبية فورية إلى بريدك:' : 'Send Test Copy to Your Inbox:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={testRecipientEmail}
                        onChange={(e) => setTestRecipientEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white font-mono outline-none focus:border-[#004ad7]"
                      />
                      <button
                        type="button"
                        onClick={handleTestDispatchCampaign}
                        disabled={isDispatching}
                        className="inline-flex items-center gap-1.5 bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-md shadow-[#004ad7]/20"
                      >
                        {isDispatching ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span>{isAr ? 'إرسال تجريبي' : 'Send Test'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mass Broadcast Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSendViaMailClient}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#004ad7] to-[#2563eb] hover:from-[#003db3] hover:to-[#1d4ed8] text-white py-3 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#004ad7]/30 active:scale-98"
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {isAr
                          ? `إرسال العرض للمشتركين (${activeCount})`
                          : `Broadcast to ${activeCount} Subscribers`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyBCCList}
                      className="flex items-center gap-1.5 border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white px-4 py-3 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-98"
                    >
                      {copiedKey === 'bcc-list' ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>{isAr ? 'نسخ BCC' : 'Copy BCC'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Luxury Email Template Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-1">
                  <span>{isAr ? 'معاينة الواجهة الحية للبريد:' : 'Live Email Client Preview:'}</span>
                  <span className="text-[#004ad7] dark:text-[#60a5fa]">{editionNoteFromTpl(selectedTemplateId)}</span>
                </div>

                <WelcomeEmailTemplate
                  welcomeTitle={campaignHeadline}
                  welcomeMessage={campaignMessage}
                  couponCode={discountCode}
                  discountPercent={discountPercent}
                  badgeText={campaignBadge}
                  heroImage={normalizeImageUrl(heroImageUrl)}
                  ctaText={ctaButtonText}
                  ctaUrl={customStoreUrl}
                  customerEmail={testRecipientEmail || 'client@vant.archive'}
                  isInteractive={true}
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIBERS DOSSIER */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#14171d] p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث بالإيميل أو المصدر...' : 'Search email or source...'}
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 pr-10 pl-3 py-2 text-xs text-black dark:text-white placeholder-zinc-500 font-mono outline-none focus:border-[#004ad7]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBCCList}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-xl text-xs font-bold text-black dark:text-white cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isAr ? 'نسخ الكل BCC' : 'Copy BCC'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportSubscribersToCSV(subscribers)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#004ad7]/10 dark:bg-[#004ad7]/20 hover:bg-[#004ad7]/20 dark:hover:bg-[#004ad7]/30 border border-[#004ad7]/30 rounded-xl text-xs font-bold text-[#004ad7] dark:text-[#60a5fa] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Manual Email Add Form */}
            <form
              onSubmit={handleAddManualEmail}
              className="flex items-center gap-2 bg-white dark:bg-[#14171d] p-3 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs"
            >
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder={isAr ? 'إضافة إيميل مشترك جديد يدوياً...' : 'Add subscriber email manually...'}
                className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder-zinc-500 font-mono outline-none focus:border-[#004ad7]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#004ad7]/20"
              >
                <Plus className="h-4 w-4" />
                <span>{isAr ? 'إضافة' : 'Add'}</span>
              </button>
            </form>

            {/* Subscribers Table */}
            <div className="border border-black/5 dark:border-white/10 rounded-2xl bg-white dark:bg-[#14171d] overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-black/5 dark:bg-[#0f1218] border-b border-black/5 dark:border-white/10 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <div className="col-span-5 sm:col-span-5">{isAr ? 'البريد الإلكتروني' : 'Subscriber Email'}</div>
                <div className="col-span-4 sm:col-span-3">{isAr ? 'تاريخ الاشتراك' : 'Date'}</div>
                <div className="hidden sm:block sm:col-span-2">{isAr ? 'المصدر' : 'Source'}</div>
                <div className="col-span-3 sm:col-span-2 text-center">{isAr ? 'إجراءات' : 'Actions'}</div>
              </div>

              <div className="divide-y divide-black/5 dark:divide-white/5 max-h-[380px] overflow-y-auto">
                {filteredSubscribers.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <Mail className="h-6 w-6 text-[#004ad7] dark:text-[#3b82f6] mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-bold text-zinc-500">
                      {isAr ? 'لا يوجد مشتركون في القائمة حالياً' : 'No subscribers found'}
                    </p>
                  </div>
                ) : (
                  filteredSubscribers.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-black/5 dark:hover:bg-white/[0.02] text-xs transition-colors"
                    >
                      <div className="col-span-5 sm:col-span-5 truncate font-medium font-mono text-black dark:text-white" title={sub.email}>
                        {sub.email}
                      </div>

                      <div className="col-span-4 sm:col-span-3 text-xs text-zinc-500">
                        {new Date(sub.subscribed_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>

                      <div className="hidden sm:block sm:col-span-2 text-[11px] text-zinc-500">
                        {sub.source || 'الموقع'}
                      </div>

                      <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(sub.email);
                            setCopiedKey(sub.id);
                            setTimeout(() => setCopiedKey(null), 1500);
                          }}
                          className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                          title={isAr ? 'نسخ' : 'Copy'}
                        >
                          {copiedKey === sub.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                          className="text-zinc-400 hover:text-rose-500 transition-colors"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WELCOME AUTOMATION SETTINGS */}
        {activeTab === 'welcome_settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSaveWelcomeSettings}
              className="lg:col-span-7 bg-white dark:bg-[#14171d] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <span className="text-sm font-bold text-black dark:text-white">
                  {isAr ? 'إعدادات رسالة الترحيب التلقائية وكوبون الخصم' : 'Automated Welcome Voucher'}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  مزامنة سحابية
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    {isAr ? 'عنوان الترحيب (العربية)' : 'Welcome Title (Ar)'}
                  </label>
                  <input
                    type="text"
                    value={welcomeTitleAr}
                    onChange={(e) => setWelcomeTitleAr(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    {isAr ? 'عنوان الترحيب (الإنجليزية)' : 'Welcome Title (En)'}
                  </label>
                  <input
                    type="text"
                    value={welcomeTitleEn}
                    onChange={(e) => setWelcomeTitleEn(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  {isAr ? 'نص الرسالة الترحيبية (العربية)' : 'Welcome Message (Ar)'}
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessageAr}
                  onChange={(e) => setWelcomeMessageAr(e.target.value)}
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 p-3 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    {isAr ? 'رمز الكوبون الترحيبي' : 'Welcome Code:'}
                  </label>
                  <input
                    type="text"
                    value={welcomeCoupon}
                    onChange={(e) => setWelcomeCoupon(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs font-mono font-bold text-[#004ad7] dark:text-[#60a5fa] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    {isAr ? 'نسبة الخصم (%)' : 'Discount (%):'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={welcomePct}
                    onChange={(e) => setWelcomePct(Number(e.target.value))}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs font-bold text-black dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Store URL & Domain Setting */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                    {isAr ? 'رابط المتجر الرسمي المعتمد (Store URL / Domain):' : 'Official Store URL / Custom Domain:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomStoreUrl('https://vant-web.vercel.app/')}
                    className="text-[10px] text-[#004ad7] dark:text-[#60a5fa] hover:underline"
                  >
                    {isAr ? 'استعادة الافتراضي' : 'Reset to Default'}
                  </button>
                </div>
                <input
                  type="url"
                  value={customStoreUrl}
                  onChange={(e) => setCustomStoreUrl(e.target.value)}
                  placeholder="https://vant-web.vercel.app/"
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs font-mono text-black dark:text-white outline-none focus:border-[#004ad7]"
                />
                <span className="text-[10.5px] text-zinc-500 block mt-1">
                  {isAr
                    ? 'يمكنك تغيير هذا الرابط في أي وقت عند حجز دومين جديد أو تعديل نطاق المتجر.'
                    : 'Easily update this URL whenever you bind a new custom domain.'}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                <label className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/20 cursor-pointer">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {isAr ? 'تفعيل ظهور نافذة الترحيب للزبون فور الاشتراك' : 'Enable Welcome Popup Modal'}
                  </span>
                  <input
                    type="checkbox"
                    checked={welcomeModalEnabled}
                    onChange={(e) => setWelcomeModalEnabled(e.target.checked)}
                    className="accent-[#004ad7] h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/20 cursor-pointer">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {isAr ? 'إرسال نسخة موثقة تلقائياً إلى بريد الزبون' : 'Auto-Dispatch Email to Subscriber'}
                  </span>
                  <input
                    type="checkbox"
                    checked={welcomeAutoDispatch}
                    onChange={(e) => setWelcomeAutoDispatch(e.target.checked)}
                    className="accent-[#004ad7] h-4 w-4"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSavingWelcome}
                className="w-full flex items-center justify-center gap-2 bg-[#004ad7] hover:bg-[#003db3] text-white py-3 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#004ad7]/20"
              >
                {isSavingWelcome ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isAr ? 'حفظ وتحديث الإعدادات في السحابة' : 'Save & Publish to Cloud'}</span>
              </button>
            </form>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#14171d] p-5 rounded-3xl border border-black/5 dark:border-white/10 space-y-3 shadow-sm">
                <span className="text-xs font-bold text-black dark:text-white block">
                  {isAr ? 'تجربة إرسال رسالة الترحيب الموثقة:' : 'Test Send Welcome Email:'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testWelcomeEmail}
                    onChange={(e) => setTestWelcomeEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white font-mono outline-none focus:border-[#004ad7]"
                  />
                  <button
                    type="button"
                    onClick={handleTestSendWelcome}
                    disabled={isTestingWelcome}
                    className="bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-2 text-xs font-bold rounded-xl cursor-pointer shadow-sm shadow-[#004ad7]/20"
                  >
                    {isTestingWelcome ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <WelcomeEmailTemplate
                welcomeTitle={welcomeTitleAr}
                welcomeMessage={welcomeMessageAr}
                couponCode={welcomeCoupon}
                discountPercent={welcomePct}
                ctaUrl={customStoreUrl}
                customerEmail={testWelcomeEmail || 'client@vant.archive'}
                isInteractive={false}
              />
            </div>
          </div>
        )}

        {/* TAB 4: CAMPAIGNS HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#14171d] p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs">
              <span>{isAr ? 'سجل الحملات والرسائل الترويجية الموثقة:' : 'Sent Campaigns Archive:'}</span>
              <span className="text-[#004ad7] dark:text-[#60a5fa]">{campaigns.length} {isAr ? 'حملة مسجلة' : 'campaigns'}</span>
            </div>

            {campaigns.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#14171d]">
                <History className="h-8 w-8 mx-auto text-zinc-400 mb-2 opacity-50" />
                <p>{isAr ? 'لم يتم إرسال أي حملات بعد. توجه إلى تبويب "واجهات العروض" لبدء حملتك الأولى!' : 'No campaigns recorded yet.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#14171d] p-4 space-y-2 hover:border-[#004ad7]/30 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#004ad7] dark:bg-[#3b82f6]" />
                        <h4 className="text-xs font-bold text-black dark:text-white">{camp.title}</h4>
                        {camp.discount_code && (
                          <span className="rounded-full bg-[#004ad7]/10 dark:bg-[#004ad7]/20 px-2 py-0.5 text-[10px] text-[#004ad7] dark:text-[#60a5fa] font-bold">
                            {camp.discount_code}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(camp.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      {camp.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NEWSLETTER STORE BOX CUSTOMIZER */}
        {activeTab === 'box_design' && (
          <AdminNewsletterBoxStudio isAr={isAr} />
        )}

      </div>

      {/* Modal: Add Custom Template */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white dark:bg-[#14171d] rounded-3xl border border-black/10 dark:border-white/15 p-6 space-y-4 text-start shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-black dark:text-white">
                {isAr ? 'إنشاء وتجهيز قالب عرض جديد' : 'Create New Campaign Template'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTemplateModal(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTemplate} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  {isAr ? 'اسم القالب الداخلي:' : 'Template Internal Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTplTitle}
                  onChange={(e) => setNewTplTitle(e.target.value)}
                  placeholder="عرض العيد الحصري 2026"
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    {isAr ? 'كود الخصم:' : 'Discount Code:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTplCode}
                    onChange={(e) => setNewTplCode(e.target.value.toUpperCase())}
                    placeholder="EID-VIP-25"
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3 py-2 text-xs text-[#004ad7] dark:text-[#60a5fa] font-bold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    {isAr ? 'نسبة الخصم (%):' : 'Discount (%):'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={newTplPercent}
                    onChange={(e) => setNewTplPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3 py-2 text-xs text-black dark:text-white outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  {isAr ? 'العنوان الرئيسي داخل الرسالة:' : 'Headline:'}
                </label>
                <input
                  type="text"
                  value={newTplHeadline}
                  onChange={(e) => setNewTplHeadline(e.target.value)}
                  placeholder="احتفالية خاصة — خصم 25% على كامل التشكيلة"
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  {isAr ? 'تفاصيل ونص العرض:' : 'Offer Message Body:'}
                </label>
                <textarea
                  rows={3}
                  value={newTplMessage}
                  onChange={(e) => setNewTplMessage(e.target.value)}
                  placeholder="يسرنا دعوتكم للاستفادة من العرض الحصري..."
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black p-3 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                />
              </div>

              {/* Upload Image File for Modal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block">
                  {isAr ? 'صورة الغلاف (رفع كملف من جهازك):' : 'Hero Image File:'}
                </label>
                <input
                  type="file"
                  ref={modalFileInputRef}
                  accept="image/*"
                  onChange={handleModalImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  disabled={isUploadingModalImage}
                  className="w-full py-2.5 rounded-xl border border-dashed border-[#004ad7]/40 hover:border-[#004ad7] bg-black/5 dark:bg-black text-xs font-bold text-black dark:text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUploadingModalImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-[#004ad7]" />}
                  <span>{isAr ? 'انقر لاختيار صورة من جهازك' : 'Choose image file'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004ad7] hover:bg-[#003db3] text-white text-xs font-bold rounded-xl shadow-md shadow-[#004ad7]/20"
                >
                  {isAr ? 'حفظ وتفعيل القالب' : 'Save & Activate'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );

  if (embedded) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-5xl"
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function editionNoteFromTpl(tplId: string): string {
  switch (tplId) {
    case 'tpl_welcome_vip':
      return 'ONBOARDING // VIP VERIFIED';
    case 'tpl_new_drop':
      return 'RUNWAY CAPSULE // LIMITED RUN';
    case 'tpl_weekend_sale':
      return 'TIME-LIMITED // 48H VAULT';
    case 'tpl_loyalty_gift':
      return 'TIER NOIR // BESPOKE REWARD';
    case 'tpl_restock_alert':
      return 'RESTOCKED // SERIALIZED';
    default:
      return 'ARCHIVE // EXCLUSIVE CURATION';
  }
}
