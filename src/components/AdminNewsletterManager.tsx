import { useState, useEffect, useMemo } from 'react';
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
  PRESET_CAMPAIGN_TEMPLATES,
  type NewsletterSubscriber,
  type CampaignOffer,
} from '../lib/newsletter';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  lang?: 'ar' | 'en';
  embedded?: boolean;
}

export default function AdminNewsletterManager({
  isOpen = true,
  onClose,
  lang = 'ar',
  embedded = false,
}: Props) {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'subscribers' | 'compose' | 'history'>('subscribers');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOffer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Campaign Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_welcome_vip');
  const [campaignTitle, setCampaignTitle] = useState('عرض ترحيبي خاص لمشتركي ڤانت');
  const [campaignSubject, setCampaignSubject] = useState('ڤانت للأزياء · رمز ترحيبي حصري وخصم 15% على أول طلب لك');
  const [discountCode, setDiscountCode] = useState('VANT-WELCOME-15');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [campaignBody, setCampaignBody] = useState('');

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

      // Background cloud sync
      const synced = await syncSubscribersFromCloud();
      setSubscribers(synced);
    } finally {
      setIsLoading(false);
    }
  };

  // Set default body on template selection
  useEffect(() => {
    const tpl = PRESET_CAMPAIGN_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (tpl) {
      setCampaignTitle(tpl.title);
      setCampaignSubject(tpl.subject);
      setDiscountCode(tpl.discount_code || 'VANT-VIP');
      setDiscountPercent(tpl.discount_percent || 15);
      const replacedBody = tpl.body
        .replace('{DISCOUNT_CODE}', tpl.discount_code || 'VANT-VIP')
        .replace('{DISCOUNT_PERCENT}', String(tpl.discount_percent || 15))
        .replace('{STORE_URL}', typeof window !== 'undefined' ? window.location.origin : 'https://vant.haute');
      setCampaignBody(replacedBody);
    }
  }, [selectedTemplateId]);

  const handleDiscountCodeChange = (newCode: string) => {
    setDiscountCode(newCode);
    setCampaignBody((prev) => prev.replace(/كود الخصم:\s*[A-Z0-9_-]+/i, `كود الخصم: ${newCode}`));
  };

  const handleDiscountPercentChange = (newPct: number) => {
    setDiscountPercent(newPct);
    setCampaignBody((prev) => prev.replace(/قيمة الخصم:\s*\d+%/i, `قيمة الخصم: ${newPct}%`));
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
        ? `تم نسخ (${activeCount}) بريد إلكتروني كـ BCC وجاهزة للصق في برنامج الإيميل أو تطبيقات الحملات!`
        : `Copied ${activeCount} emails to clipboard (BCC ready)!`,
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSendViaMailClient = async () => {
    if (activeCount === 0) {
      alert(isAr ? 'لا يوجد مشتركون نشطون لإرسال العرض لهم' : 'No active subscribers to send to');
      return;
    }

    const mailto = generateMailtoLink(subscribers, campaignSubject, campaignBody);
    if (!mailto) return;

    // Record the campaign in archive
    const recorded = await recordCampaign({
      title: campaignTitle,
      subject: campaignSubject,
      discount_code: discountCode,
      discount_percent: discountPercent,
      body: campaignBody,
      sent_count: activeCount,
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

  const handleCopyOfferText = () => {
    const fullText = `الموضوع: ${campaignSubject}\n\n${campaignBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedKey('offer-text');
    setTimeout(() => setCopiedKey(null), 2500);
    setFeedbackMsg({
      type: 'success',
      text: isAr ? 'تم نسخ نص العرض ورسالة البريد بالكامل' : 'Offer text copied to clipboard',
    });
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const content = (
    <div className={`flex flex-col text-white font-sans ${embedded ? 'space-y-5' : 'relative w-full max-w-4xl max-h-[92vh] rounded-3xl border border-white/15 bg-[#0e1117] shadow-2xl overflow-hidden'}`}>
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 ${embedded ? 'rounded-2xl bg-[#141822] border border-white/10' : 'bg-[#141822]'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#004ad7] to-[#3b82f6] text-white shadow-md shadow-[#004ad7]/30">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                {isAr ? 'مركز النشرة البريدية والعروض الحصرية' : 'Newsletter & VIP Campaign Studio'}
              </h2>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeCount} {isAr ? 'مشترك حقيقي' : 'real subscribers'}</span>
              </span>
              <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                {isAr ? 'قاعدة بيانات Supabase المباشرة' : 'Supabase Live DB'}
              </span>
            </div>
            <p className="text-xs text-white/60">
              {isAr
                ? 'إدارة إيميلات المشتركين، إنشاء التخفيضات وإرسال العروض الرسمية لـ ڤانت'
                : 'Manage subscriber emails, design offers, and send campaigns to VANT customers'}
            </p>
          </div>
        </div>

        {!embedded && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
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
          className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 rounded-xl ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className={`flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-white/10 ${embedded ? 'rounded-xl bg-[#12151e] border border-white/10' : 'bg-[#12151e]'} overflow-x-auto text-xs font-semibold`}>
        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 cursor-pointer transition-all ${
            activeTab === 'subscribers'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{isAr ? 'قائمة المشتركين' : 'Subscribers'}</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
            {subscribers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 cursor-pointer transition-all ${
            activeTab === 'compose'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>{isAr ? 'إنشاء وإرسال عرض' : 'Compose & Send Offer'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 cursor-pointer transition-all ${
            activeTab === 'history'
              ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          <span>{isAr ? 'سجل العروض المرسلة' : 'Sent History'}</span>
          {campaigns.length > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {campaigns.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`${embedded ? 'space-y-4' : 'flex-1 overflow-y-auto p-5 sm:p-6 space-y-5'}`}>
        {/* TAB 1: SUBSCRIBERS LIST */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            {/* Action Bar (Search, Add, Copy BCC, Export) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151923] p-3.5 rounded-2xl border border-white/10">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'البحث في الإيميلات أو المصدر...' : 'Search by email or source...'}
                  className="w-full rounded-xl border border-white/15 bg-black/30 ltr:pl-9 rtl:pr-9 py-2 text-xs text-white placeholder-white/40 focus:border-[#3b82f6] outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBCCList}
                  title={isAr ? 'نسخ قائمة الإيميلات كاملة لوضعها في خانة BCC' : 'Copy all emails for BCC'}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                >
                  {copiedKey === 'bcc-list' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#3b82f6]" />
                  )}
                  <span>{isAr ? 'نسخ جميع الإيميلات (BCC)' : 'Copy All Emails'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportSubscribersToCSV(subscribers)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold cursor-pointer transition-all active:scale-95 text-emerald-300"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isAr ? 'تصدير Excel / CSV' : 'Export CSV'}</span>
                </button>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={isLoading}
                  title={isAr ? 'تحديث ومزامنة من السحابة' : 'Refresh and sync'}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 cursor-pointer text-white/80"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#3b82f6]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Add Manual Subscriber Form */}
            <form
              onSubmit={handleAddManualEmail}
              className="flex items-center gap-2 bg-[#121620] p-3 rounded-2xl border border-white/10"
            >
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder={isAr ? 'إضافة إيميل عميل جديد يدوياً (مثال: client@domain.com)...' : 'Add new email manually...'}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-[#004ad7] outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>{isAr ? 'إضافة للأرشيف' : 'Add to Archive'}</span>
              </button>
            </form>

            {/* Subscribers Table / Card List */}
            <div className="rounded-2xl border border-white/10 bg-[#131722] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#171b26] border-b border-white/10 text-[11px] font-bold text-white/60 uppercase tracking-wider">
                <div className="col-span-5 sm:col-span-5">{isAr ? 'البريد الإلكتروني' : 'Subscriber Email'}</div>
                <div className="col-span-4 sm:col-span-3">{isAr ? 'تاريخ الاشتراك' : 'Date'}</div>
                <div className="hidden sm:block sm:col-span-2">{isAr ? 'المصدر' : 'Source'}</div>
                <div className="col-span-3 sm:col-span-2 text-center">{isAr ? 'إجراءات' : 'Actions'}</div>
              </div>

              <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto">
                {filteredSubscribers.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-[#3b82f6] mb-3">
                      <Mail className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold text-white/90">
                      {isAr ? 'لا يوجد مشتركون مسجلون حالياً في قاعدة البيانات' : 'No subscribers recorded in Supabase database yet'}
                    </p>
                    <p className="mt-1 text-[11px] text-white/50 max-w-md mx-auto leading-relaxed">
                      {isAr
                        ? 'البيانات هنا حقيقية 100% ومربوطة بـ Supabase. فور قيام أي زائر بإدخال بريده في شريط النشرة البريدية بأسفل المتجر، سيظهر هنا فوراً. يمكنك أيضاً إضافة إيميل يدوي للتجربة من الحقل أعلاه.'
                        : 'Data is 100% live and backed by Supabase. Whenever a visitor subscribes on the storefront, their email will show here immediately.'}
                    </p>
                  </div>
                ) : (
                  filteredSubscribers.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white/[0.02] text-xs transition-colors"
                    >
                      <div className="col-span-5 sm:col-span-5 flex items-center gap-2 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004ad7]/20 text-[#3b82f6] text-[11px] font-bold">
                          {sub.email.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate font-mono font-medium text-white/90" title={sub.email}>
                          {sub.email}
                        </span>
                      </div>

                      <div className="col-span-4 sm:col-span-3 text-[11px] text-white/60">
                        {new Date(sub.subscribed_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>

                      <div className="hidden sm:block sm:col-span-2">
                        <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/70">
                          {sub.source || (isAr ? 'الموقع' : 'Site')}
                        </span>
                      </div>

                      <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(sub.email);
                            setCopiedKey(sub.id);
                            setTimeout(() => setCopiedKey(null), 1500);
                          }}
                          title={isAr ? 'نسخ الإيميل' : 'Copy Email'}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedKey === sub.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                          title={isAr ? 'حذف من القائمة' : 'Delete'}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPOSE & SEND OFFER */}
        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Offer Composer & Template selector */}
            <div className="lg:col-span-7 space-y-4">
              {/* Template Picker */}
              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">
                  {isAr ? 'اختر قالب العرض الترويجي الجاهز:' : 'Select Promo Template:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_CAMPAIGN_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        selectedTemplateId === tpl.id
                          ? 'border-[#004ad7] bg-[#004ad7]/15 ring-2 ring-[#004ad7]/30'
                          : 'border-white/10 bg-[#141822] hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{tpl.title}</span>
                        <span className="text-[10px] rounded-md bg-[#004ad7]/30 text-[#3b82f6] px-1.5 py-0.5">
                          {tpl.discount_percent}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  {isAr ? 'عنوان الرسالة (Email Subject):' : 'Email Subject:'}
                </label>
                <input
                  type="text"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-[#3b82f6] outline-none"
                />
              </div>

              {/* Discount Code & Percentage Controls */}
              <div className="grid grid-cols-2 gap-3 bg-[#131620] p-3 rounded-xl border border-white/10">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    {isAr ? 'كود الخصم الحصري:' : 'Discount Code:'}
                  </label>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => handleDiscountCodeChange(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs font-mono font-bold text-[#3b82f6] uppercase outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    {isAr ? 'نسبة الخصم (%):' : 'Discount Percent (%):'}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>

              {/* Body Editor */}
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  {isAr ? 'نص بيان ورسالة العرض:' : 'Offer Message Body:'}
                </label>
                <textarea
                  rows={6}
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white leading-relaxed placeholder-white/40 focus:border-[#3b82f6] outline-none font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendViaMailClient}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004ad7] to-[#2563eb] hover:from-[#003db3] hover:to-[#1d4ed8] text-white px-5 py-3 text-xs font-bold transition-all active:scale-95 shadow-lg shadow-[#004ad7]/30 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {isAr
                      ? `إرسال العرض عبر برنامج البريد (${activeCount} مشترك)`
                      : `Send to ${activeCount} via Mail Client`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyOfferText}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-white px-4 py-3 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                >
                  {copiedKey === 'offer-text' ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{isAr ? 'نسخ نص العرض' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Luxury Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white/70">
                <span>{isAr ? 'معاينة رسالة العرض كما تظهر للعميل:' : 'Customer Email Preview:'}</span>
                <span className="text-[10px] rounded-full bg-white/10 px-2 py-0.5 text-white/60">
                  Preview
                </span>
              </div>

              <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#181d28] to-[#11141c] p-5 space-y-4 shadow-xl">
                <div className="border-b border-white/10 pb-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#3b82f6] font-bold">
                    MAISON VANT · PRIVATE ARCHIVE
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-white">{campaignSubject}</h4>
                </div>

                <div className="rounded-xl border border-[#004ad7]/30 bg-[#004ad7]/10 p-3.5 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                    {isAr ? 'كود الخصم الحصري الخاص بك' : 'Your Private VIP Code'}
                  </span>
                  <div className="text-lg font-mono font-black text-[#3b82f6] tracking-widest">
                    {discountCode}
                  </div>
                  <span className="inline-block text-[11px] font-bold text-emerald-400">
                    {isAr ? `تخفيض فوري بقيمة ${discountPercent}%` : `${discountPercent}% Instant Discount`}
                  </span>
                </div>

                <div className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap font-sans bg-black/20 p-3 rounded-xl border border-white/5 max-h-[160px] overflow-y-auto">
                  {campaignBody}
                </div>

                <div className="text-center pt-2">
                  <span className="inline-block rounded-xl bg-white text-black px-5 py-2 text-xs font-black tracking-wider uppercase shadow-md">
                    {isAr ? 'تسوق التشكيلة الآن' : 'Shop Archive Now'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAIGNS HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-white/70 bg-[#151923] p-3 rounded-xl border border-white/10">
              <span>{isAr ? 'سجل العروض والرسائل الترويجية السابقة:' : 'Past Campaigns Archive:'}</span>
              <span className="font-bold text-white">{campaigns.length} {isAr ? 'عرض مسجل' : 'campaigns'}</span>
            </div>

            {campaigns.length === 0 ? (
              <div className="py-16 text-center text-white/50 text-xs rounded-2xl border border-white/10 bg-[#131722]">
                <History className="h-8 w-8 mx-auto text-white/20 mb-2" />
                <p>{isAr ? 'لم يتم إرسال أي عروض حتى الآن. توجه لتبويب "إنشاء وإرسال عرض" لبدء حملتك الأولى!' : 'No campaigns sent yet.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="rounded-2xl border border-white/10 bg-[#141822] p-4.5 space-y-2.5 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <h4 className="text-sm font-bold text-white">{camp.title}</h4>
                        {camp.discount_code && (
                          <span className="rounded-md bg-[#004ad7]/20 border border-[#004ad7]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#3b82f6]">
                            {camp.discount_code}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/50">
                        {new Date(camp.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                      {camp.body}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/60">
                      <span>
                        {isAr ? `المستلمون: ${camp.sent_count} مشترك` : `Sent to: ${camp.sent_count} subscribers`}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(camp.body);
                          alert(isAr ? 'تم نسخ نص العرض' : 'Copied');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-[#3b82f6] hover:underline cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{isAr ? 'نسخ المحتوى' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl"
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
