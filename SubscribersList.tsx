import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Plus,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  Send,
  Sparkles,
  Flame,
  Gift,
  Clock,
  Layers,
  Smartphone,
  Monitor,
  Code,
  Eye,
  Check,
  ExternalLink,
  RotateCcw,
  Tag,
  AlertCircle,
  BarChart2,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Radio,
  FileCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminBridge, Subscriber } from './useAdminBridge';
import { formatCurrency, formatNumber, formatDate } from './format';
import { Card, Button, StatusBadge, Modal, Input } from './ui';
import {
  WelcomeEmailTemplate,
  generateEmailHtml,
  EmailCampaignData,
  defaultCampaignData,
} from './WelcomeEmailTemplate';

type TabType = 'directory' | 'studio' | 'history';

interface SentCampaignRecord {
  id: string;
  name: string;
  subject: string;
  templateType: EmailCampaignData['templateType'];
  sentDate: string;
  recipientsCount: number;
  openRate: number;
  clickRate: number;
  status: 'delivered' | 'sending' | 'failed';
  channel: 'resend' | 'mailto' | 'simulation';
  campaignData: EmailCampaignData;
}

const initialSentHistory: SentCampaignRecord[] = [
  {
    id: 'camp-101',
    name: 'حملة ترحيب المشتركين الجدد',
    subject: '🎉 مرحباً بك في عائلتنا! خصم 20% بانتظارك على أول طلب',
    templateType: 'welcome',
    sentDate: '2026-10-06 14:30',
    recipientsCount: 48,
    openRate: 58.4,
    clickRate: 24.1,
    status: 'delivered',
    channel: 'resend',
    campaignData: {
      ...defaultCampaignData,
      subject: '🎉 مرحباً بك في عائلتنا! خصم 20% بانتظارك على أول طلب',
      headline: 'هدية ترحيبية خاصة بمناسبة انضمامك',
    },
  },
  {
    id: 'camp-102',
    name: 'تخفيضات العيد والجمعة الذهبية',
    subject: '⚡ عروض الـ 24 ساعة العاجلة - خصومات تصل إلى 40% في بغداد',
    templateType: 'flash_sale',
    sentDate: '2026-10-04 18:00',
    recipientsCount: 142,
    openRate: 64.2,
    clickRate: 31.8,
    status: 'delivered',
    channel: 'resend',
    campaignData: {
      ...defaultCampaignData,
      templateType: 'flash_sale',
      subject: '⚡ عروض الـ 24 ساعة العاجلة - خصومات تصل إلى 40% في بغداد',
      headline: 'فرصة لا تعوض: تخفيضات البرق الحصرية',
      bodyText: 'ساعات معدودة تفصلنا عن انتهاء أكبر خصومات الموسم على الإلكترونيات الفاخرة وسماعات الرأس والساعات الذكية.',
      discountCode: 'FLASH40',
      discountPercent: 'خصم 40% فوري',
      heroImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'camp-103',
    name: 'إطلاق تشكيلة الساعات الذكية برو',
    subject: '✨ وصول الدفعة الجديدة من الساعات التيتانيوم المقاومة للماء',
    templateType: 'launch',
    sentDate: '2026-09-28 11:15',
    recipientsCount: 115,
    openRate: 51.0,
    clickRate: 19.5,
    status: 'delivered',
    channel: 'simulation',
    campaignData: {
      ...defaultCampaignData,
      templateType: 'launch',
      subject: '✨ وصول الدفعة الجديدة من الساعات التيتانيوم المقاومة للماء',
      headline: 'الابتكار يلتقي بالفخامة: تشكيلة 2026 وصلت رسمياً',
      bodyText: 'اكتشف الدقة الفائقة مع مستشعرات الجيل الجديد وبطارية تدوم حتى 14 يوماً مع ضمان محلي معتمد في العراق.',
      discountCode: 'TITANIUM15',
      discountPercent: 'خصم 15% للإطلاق',
      heroImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    },
  },
];

const templatePresets: Record<
  EmailCampaignData['templateType'],
  {
    nameAr: string;
    nameEn: string;
    icon: any;
    color: string;
    badgeBg: string;
    defaults: Partial<EmailCampaignData>;
  }
> = {
  welcome: {
    nameAr: 'هدية ترحيبية بالعميل',
    nameEn: 'Welcome Discount',
    icon: Gift,
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    defaults: {
      subject: '🎉 مرحباً بك في عائلتنا! خصم 20% بانتظارك على أول طلب',
      preheader: 'استخدم الكود WELCOME20 واستمتع بأرقى التشكيلات مع توصيل سريع لجميع المحافظات.',
      headline: 'أهلاً بك في متجر الرافدين الفاخر',
      bodyText: 'يسعدنا جداً انضمامك إلى مجتمعنا الحصري. لتجربة تسوق لا تُنسى، نقدم لك هدية ترحيبية خاصة صالحة على جميع التشكيلات والإلكترونيات.',
      discountCode: 'WELCOME20',
      discountPercent: '20% خصم فوري ترحيبي',
      expireDate: 'خلال 7 أيام من التسجيل',
      ctaText: 'تسوق التشكيلة الآن',
      heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    },
  },
  flash_sale: {
    nameAr: 'تخفيضات البرق العاجلة',
    nameEn: 'Flash Sale',
    icon: Flame,
    color: 'text-red-400',
    badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400',
    defaults: {
      subject: '⚡ عرض عاجل: خصومات تصل إلى 50% تنتهي الليلة!',
      preheader: 'فرصة لا تعوض - الكميات محدودة جداً مع شحن فوري في بغداد والمحافظات.',
      headline: 'عرض البرق الحصري: لا تفوت فرصة التوفير',
      bodyText: 'خصومات استثنائية على المنتجات الأكثر طلباً في متجرنا. العرض متاح لأول 50 مشترياً فقط أو حتى نفاد الكمية المخصصة.',
      discountCode: 'FLASH50',
      discountPercent: 'خصم يصل إلى 50%',
      expireDate: 'ينتهي خلال 24 ساعة فقط',
      ctaText: 'اغتنم العرض قبل النفاد',
      heroImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    },
  },
  launch: {
    nameAr: 'إطلاق منتج أو تشكيلة',
    nameEn: 'Product Launch',
    icon: Sparkles,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    defaults: {
      subject: '✨ وصول التشكيلة الأحدث لعام 2026 رسمياً في متجرنا',
      preheader: 'كن أول من يقتني أرقى المنتجات بأعلى معايير الجودة والضمان المعتمد.',
      headline: 'الابتكار يلتقي بالفخامة: التشكيلة الجديدة كلياً',
      bodyText: 'بعد أشهر من التطوير، يسرنا تقديم التشكيلة الأحدث المصممة خصيصاً لأصحاب الذوق الرفيع. متوفرة الآن بألوان ومواصفات حصرية.',
      discountCode: 'LAUNCH10',
      discountPercent: 'خصم 10% للطلب المبكر',
      expireDate: 'متاح للدفعة الأولى فقط',
      ctaText: 'استكشف التشكيلة الحصرية',
      heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    },
  },
  clearance: {
    nameAr: 'تصفية موسمية كبرى',
    nameEn: 'Seasonal Clearance',
    icon: Tag,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    defaults: {
      subject: '🏷️ التصفية الموسمية الكبرى: أسعار نهائية لا تقبل المنافسة',
      preheader: 'تخفيضات هائلة على آخر القطع المتبقية بالدينار العراقي حتى نفاد المخزون.',
      headline: 'تصفية نهاية الموسم: خصومات حتى 60%',
      bodyText: 'نقوم بتحديث مستودعاتنا للترحيب بالموسم الجديد! استفد من الأسعار التاريخية على أفضل المنتجات والقطع الفاخرة.',
      discountCode: 'CLEARANCE60',
      discountPercent: 'خصم حتى 60% كاش',
      expireDate: 'حتى نفاد الكمية تماماً',
      ctaText: 'تسوق عروض التصفية',
      heroImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
    },
  },
  newsletter: {
    nameAr: 'النشرة البريدية ومقالات',
    nameEn: 'Weekly Newsletter',
    icon: Mail,
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    defaults: {
      subject: '📰 نشرة الأسبوع: نصائح الاختيار الذكي وترشيحات المشترين',
      preheader: 'دليلك الأسبوعي لأحدث صيحات التكنولوجيا والأناقة والمنتجات الأكثر موثوقية.',
      headline: 'نشرة الأسبوع من متجر الرافدين',
      bodyText: 'في هذا العدد نشارككم أهم النصائح لاختيار الملحقات الأصلية، مقارنات عملية بين الأجهزة، وتوصيات خبرائنا للموسم الحالي.',
      discountCode: 'NEWSLETTER',
      discountPercent: 'شحن مجاني على طلبك القادم',
      expireDate: 'ساري طوال عطلة نهاية الأسبوع',
      ctaText: 'قراءة المقال والتسوق',
      heroImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
    },
  },
};

const heroPresets = [
  {
    labelAr: 'سماعات وصوتيات فاخرة',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    labelAr: 'ساعات وتكنولوجيا',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  },
  {
    labelAr: 'عروض تسوق وخصومات',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
  },
  {
    labelAr: 'متجر فاخر وأزياء',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
  },
];

export const SubscribersList: React.FC = () => {
  const { subscribers, addSubscriber, deleteSubscriber, lang, products } = useAdminBridge();
  const isAr = lang === 'ar';

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<TabType>('directory');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add Subscriber Modal
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTag, setFormTag] = useState('');

  // ---------------------------------------------------------
  // EMAIL CAMPAIGN STUDIO STATE
  // ---------------------------------------------------------
  const [campaignData, setCampaignData] = useState<EmailCampaignData>(() => {
    return {
      ...defaultCampaignData,
      items: products.slice(0, 2).map((p) => ({
        name: isAr ? p.name : p.nameEn || p.name,
        price: formatCurrency(p.price, 'IQD', isAr ? 'ar' : 'en'),
        originalPrice: p.isOnOffer
          ? formatCurrency(Math.round(p.price * 1.25), 'IQD', isAr ? 'ar' : 'en')
          : undefined,
        image: (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
        badge: p.isOnOffer ? (isAr ? 'عرض خاص' : 'Sale') : undefined,
      })),
    };
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'active' | 'all' | 'vip' | 'hesitated'>('active');

  // Dispatcher & Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('fs3211927@gmail.com');
  const [isSendingSimulation, setIsSendingSimulation] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [sentHistory, setSentHistory] = useState<SentCampaignRecord[]>(initialSentHistory);
  const [previewingHistoryItem, setPreviewingHistoryItem] = useState<SentCampaignRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter subscribers in directory
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchSearch =
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      sub.phone.includes(search);
    const matchStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalSpentAll = subscribers.reduce((acc, curr) => acc + curr.totalSpent, 0);

  // Audience calculation
  const getAudienceSubscribers = (aud: 'active' | 'all' | 'vip' | 'hesitated'): Subscriber[] => {
    if (aud === 'all') return subscribers;
    if (aud === 'vip') return subscribers.filter((s) => s.totalSpent >= 150000 || s.tags.includes('VIP'));
    if (aud === 'hesitated') return subscribers.filter((s) => s.totalOrders === 0 || s.tags.includes('متردد'));
    return subscribers.filter((s) => s.status === 'active');
  };

  const currentAudienceList = getAudienceSubscribers(selectedAudience);

  // Switch Template in Studio
  const handleSelectTemplate = (t: EmailCampaignData['templateType']) => {
    const preset = templatePresets[t];
    setCampaignData((prev) => ({
      ...prev,
      templateType: t,
      subject: preset.defaults.subject || prev.subject,
      preheader: preset.defaults.preheader || prev.preheader,
      headline: preset.defaults.headline || prev.headline,
      bodyText: preset.defaults.bodyText || prev.bodyText,
      discountCode: preset.defaults.discountCode || prev.discountCode,
      discountPercent: preset.defaults.discountPercent || prev.discountPercent,
      expireDate: preset.defaults.expireDate || prev.expireDate,
      ctaText: preset.defaults.ctaText || prev.ctaText,
      heroImage: preset.defaults.heroImage || prev.heroImage,
    }));
    showToast(isAr ? `تم تفعيل قالب: ${preset.nameAr}` : `Template activated: ${preset.nameEn}`);
  };

  // ---------------------------------------------------------
  // EXPORT FUNCTIONS (EXCEL, CSV, JSON, MARKDOWN, TSV, PRINT)
  // ---------------------------------------------------------

  // 1. Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    setIsExportMenuOpen(false);
    const headers = [
      'الاسم الكامل',
      'البريد الإلكتروني',
      'رقم الهاتف',
      'الحالة',
      'عدد الطلبات',
      'إجمالي المشتريات (دينار عراقي)',
      'تاريخ الانضمام',
      'الوسوم',
    ];
    const rows = filteredSubscribers.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      s.status === 'active' ? 'نشط' : 'ملغي الاشتراك',
      s.totalOrders,
      s.totalSpent,
      `"${s.joinedDate}"`,
      `"${s.tags.join('; ')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم استخراج ملف CSV بنجاح (UTF-8)' : 'CSV exported successfully!');
  };

  // 2. Export Excel (.xls / XML Spreadsheet)
  const handleExportExcel = () => {
    setIsExportMenuOpen(false);
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8"/>
        <title>دليل المشتركين والعملاء</title>
        <style>
          body { font-family: Segoe UI, Tahoma, sans-serif; direction: rtl; text-align: right; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4338ca; color: #ffffff; padding: 12px; font-weight: bold; border: 1px solid #cbd5e1; }
          td { padding: 9px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
          .money { font-weight: bold; color: #059669; }
          .tag { background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        </style>
      </head>
      <body>
        <h2 style="color: #1e1b4b;">سجل ودليل المشتركين والعملاء - متجر الرافدين الفاخر</h2>
        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')} | إجمالي العملاء: ${filteredSubscribers.length}</p>
        <table border="1">
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم الكامل</th>
              <th>البريد الإلكتروني</th>
              <th>رقم الهاتف</th>
              <th>الحالة</th>
              <th>عدد الطلبات</th>
              <th>إجمالي المشتريات (دينار عراقي)</th>
              <th>تاريخ الانضمام</th>
              <th>الوسوم</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSubscribers
              .map(
                (s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.email}</td>
                <td>${s.phone}</td>
                <td>${s.status === 'active' ? 'نشط' : 'ملغي الاشتراك'}</td>
                <td>${s.totalOrders}</td>
                <td class="money">${s.totalSpent.toLocaleString('en-US')} IQD</td>
                <td>${s.joinedDate}</td>
                <td><span class="tag">${s.tags.join(', ')}</span></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers_directory_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم استخراج جدول Excel (.xls) المنسق بنجاح!' : 'Excel file exported successfully!');
  };

  // 3. Export JSON
  const handleExportJSON = () => {
    setIsExportMenuOpen(false);
    const payload = {
      exportedAt: new Date().toISOString(),
      currency: 'IQD',
      totalCount: filteredSubscribers.length,
      subscribers: filteredSubscribers,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `subscribers_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isAr ? 'تم استخراج ملف JSON البرمجي بنجاح' : 'JSON file exported successfully!');
  };

  // 4. Export Markdown Table (.md)
  const handleExportMarkdown = () => {
    setIsExportMenuOpen(false);
    const headerLine = '| # | العميل | البريد الإلكتروني | الهاتف | الحالة | الطلبات | إجمالي المشتريات (IQD) | الانضمام | الوسوم |';
    const separator = '| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |';
    const rows = filteredSubscribers.map(
      (s, i) =>
        `| ${i + 1} | **${s.name}** | \`${s.email}\` | ${s.phone} | ${
          s.status === 'active' ? '✅ نشط' : '❌ ملغي'
        } | ${s.totalOrders} | ${s.totalSpent.toLocaleString('en-US')} IQD | ${s.joinedDate} | ${s.tags.join(', ')} |`
    );

    const mdContent = `# 📋 دليل المشتركين والعملاء - متجر الرافدين الفاخر\n\n- **تاريخ الاستخراج:** ${new Date().toLocaleDateString('en-US')}\n- **إجمالي المشتركين:** ${filteredSubscribers.length}\n- **إجمالي القيمة المالية:** ${totalSpentAll.toLocaleString('en-US')} IQD\n\n${headerLine}\n${separator}\n${rows.join('\n')}\n`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم استخراج جدول Markdown (.md) بنجاح!' : 'Markdown table exported successfully!');
  };

  // 5. Copy to Clipboard (TSV)
  const handleCopyClipboard = () => {
    setIsExportMenuOpen(false);
    const headers = ['الاسم\tالبريد الإلكتروني\tالهاتف\tالحالة\tالطلبات\tالمشتريات (IQD)\tتاريخ الانضمام\tالوسوم'];
    const rows = filteredSubscribers.map(
      (s) =>
        `${s.name}\t${s.email}\t${s.phone}\t${s.status === 'active' ? 'نشط' : 'ملغي الاشتراك'}\t${s.totalOrders}\t${s.totalSpent}\t${s.joinedDate}\t${s.tags.join(', ')}`
    );
    const fullText = [headers, ...rows].join('\n');
    navigator.clipboard?.writeText(fullText);
    showToast(isAr ? 'تم نسخ بيانات الجدول للحافظة (TSV جاهز للّصق في Sheets)!' : 'Copied TSV to clipboard!');
  };

  // 6. Print / PDF
  const handlePrintPDF = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  // Add new subscriber
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formName) return;

    addSubscriber({
      name: formName,
      email: formEmail,
      phone: formPhone || '+964 770 000 0000',
      status: 'active',
      tags: formTag ? [formTag] : ['عميل جديد'],
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTag('');
    setIsAddModalOpen(false);
    showToast(isAr ? 'تمت إضافة العميل الجديد بنجاح!' : 'Subscriber added successfully!');
  };

  // Copy HTML string
  const handleCopyHtmlCode = () => {
    const html = generateEmailHtml(campaignData);
    navigator.clipboard?.writeText(html);
    showToast(isAr ? 'تم نسخ كود HTML للبريد الإلكتروني بنجاح!' : 'HTML code copied to clipboard!');
  };

  // Download HTML file
  const handleDownloadHtmlFile = () => {
    const html = generateEmailHtml(campaignData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email_template_${campaignData.templateType}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم تنزيل ملف القالب بصيغة HTML!' : 'HTML template file downloaded!');
  };

  // ---------------------------------------------------------
  // DISPATCH ENGINE (SEND TEST & BROADCAST)
  // ---------------------------------------------------------

  // Send Test Email
  const handleSendTestEmail = () => {
    setIsTestEmailModalOpen(false);
    showToast(isAr ? `جاري إرسال البريد التجريبي إلى: ${testEmailAddress}...` : `Sending test email to ${testEmailAddress}...`);

    setTimeout(() => {
      showToast(isAr ? `✅ تم إرسال البريد التجريبي بنجاح إلى ${testEmailAddress}` : `Test email delivered to ${testEmailAddress}`);
    }, 1200);
  };

  // Execute Broadcast via Mail Client (mailto: with BCC)
  const handleBroadcastViaMailto = () => {
    setIsDispatchModalOpen(false);
    const recipients = currentAudienceList.map((s) => s.email).join(',');
    const subject = encodeURIComponent(campaignData.subject);
    const body = encodeURIComponent(
      `${campaignData.headline}\n\n${campaignData.bodyText}\n\n${
        campaignData.discountCode
          ? `كود الخصم: ${campaignData.discountCode} (${campaignData.discountPercent || ''})\n`
          : ''
      }\nلزيارة المتجر والتسوق:\n${campaignData.ctaUrl}`
    );

    const mailtoUrl = `mailto:?bcc=${recipients}&subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    recordDispatchedCampaign('mailto');
    showToast(isAr ? 'تم فتح تطبيق البريد وإدراج قائمة المشتركين كـ BCC بنجاح!' : 'Mail client opened with BCC list!');
  };

  // Execute Broadcast via Live Dispatch Simulator / Resend
  const handleBroadcastViaSimulator = (channel: 'resend' | 'simulation') => {
    setIsSendingSimulation(true);
    setSimulationProgress(10);

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSendingSimulation(false);
            setIsDispatchModalOpen(false);
            recordDispatchedCampaign(channel);
            setActiveTab('history');
            showToast(
              isAr
                ? `🎉 تم إرسال الحملة بنجاح إلى ${currentAudienceList.length} مشترك وتم حفظها في السجل!`
                : `Broadcast sent to ${currentAudienceList.length} subscribers!`
            );
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const recordDispatchedCampaign = (channel: 'resend' | 'mailto' | 'simulation') => {
    const newRecord: SentCampaignRecord = {
      id: `camp-${Date.now()}`,
      name: campaignData.headline,
      subject: campaignData.subject,
      templateType: campaignData.templateType,
      sentDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      recipientsCount: currentAudienceList.length,
      openRate: Math.round((45 + Math.random() * 25) * 10) / 10,
      clickRate: Math.round((15 + Math.random() * 18) * 10) / 10,
      status: 'delivered',
      channel,
      campaignData: { ...campaignData },
    };
    setSentHistory((prev) => [newRecord, ...prev]);
  };

  // Re-load campaign from history into Studio
  const handleLoadCampaignFromHistory = (item: SentCampaignRecord) => {
    setCampaignData(item.campaignData);
    setActiveTab('studio');
    showToast(isAr ? `تم تحميل بيانات الحملة "${item.subject}" إلى الاستوديو للتعديل!` : 'Loaded campaign to studio!');
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    setSentHistory((prev) => prev.filter((it) => it.id !== id));
    showToast(isAr ? 'تم حذف الحملة من السجل' : 'Campaign deleted from history');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 start-6 z-50 p-3.5 bg-slate-900 border border-indigo-500/50 text-white rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isAr ? 'استوديو النشرات والحملات البريدية' : 'Newsletter Studio & Dispatcher'}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              v2.5 Pro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAr
              ? 'إدارة قاعدة المشتركين بالدينار العراقي، استوديو تصميم رسائل البريد التفاعلية مع معاينة حية، والإرسال الجماعي.'
              : 'Audience contact registry, interactive email campaign studio with live preview, and multi-channel broadcast.'}
          </p>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'directory' && (
            <>
              {/* Multi-Format Export Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4 text-indigo-400" />}
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="gap-2"
                >
                  <span>{isAr ? 'تصدير البيانات (صيغ متعددة)' : 'Export Options'}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">▼</span>
                </Button>

                {isExportMenuOpen && (
                  <div className="absolute end-0 top-full mt-1.5 w-68 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                      {isAr ? 'اختر صيغة التصدير' : 'Select Export Format'}
                    </div>

                    {/* Excel Option */}
                    <button
                      onClick={handleExportExcel}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold">{isAr ? 'ملف إكسل Excel (.xls)' : 'Excel Spreadsheet (.xls)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'جدول منسق بالدينار العراقي' : 'Styled spreadsheet with IQD'}</div>
                      </div>
                    </button>

                    {/* CSV Option */}
                    <button
                      onClick={handleExportCSV}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-slate-800 hover:text-indigo-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-semibold">{isAr ? 'ملف CSV (.csv)' : 'CSV File (.csv)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'ترميز UTF-8 المتوافق عالمياً' : 'UTF-8 with BOM standard'}</div>
                      </div>
                    </button>

                    {/* JSON Option */}
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="font-mono font-bold text-amber-400 text-xs w-4 text-center shrink-0">{`{ }`}</span>
                      <div>
                        <div className="font-semibold">{isAr ? 'ملف برمجيات JSON (.json)' : 'JSON Data (.json)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'هيكل برمجي لقواعد البيانات' : 'Structured JSON schema'}</div>
                      </div>
                    </button>

                    {/* Markdown Option */}
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="font-semibold">{isAr ? 'جدول ماركداون Markdown (.md)' : 'Markdown Table (.md)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'جاهز للتوثيق و GitHub' : 'Clean GitHub formatted table'}</div>
                      </div>
                    </button>

                    {/* Copy to Clipboard */}
                    <button
                      onClick={handleCopyClipboard}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-slate-800 hover:text-purple-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold">{isAr ? 'نسخ للحافظة (TSV)' : 'Copy to Clipboard (TSV)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'للصق المباشر في Google Sheets' : 'Paste directly to Sheets'}</div>
                      </div>
                    </button>

                    {/* Print / PDF */}
                    <button
                      onClick={handlePrintPDF}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-slate-800 hover:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-semibold">{isAr ? 'طباعة / تقرير PDF' : 'Print / Save as PDF'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'تنسيق طباعة مخصص' : 'Print-ready document'}</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                {isAr ? 'إضافة عميل' : 'Add Subscriber'}
              </Button>
            </>
          )}

          {activeTab === 'studio' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                leftIcon={<Send className="w-4 h-4 text-indigo-400" />}
                onClick={() => setIsTestEmailModalOpen(true)}
              >
                {isAr ? 'إرسال تجريبي لبريدي' : 'Send Test Email'}
              </Button>
              <Button
                variant="primary"
                leftIcon={<Radio className="w-4 h-4 text-white" />}
                onClick={() => setIsDispatchModalOpen(true)}
              >
                {isAr ? 'بث الحملة للجميع (Broadcast)' : 'Broadcast to Audience'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl max-w-xl">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isAr ? 'دليل المشتركين والعملاء' : 'Subscribers Directory'}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-mono">
            {subscribers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'studio'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isAr ? 'استوديو الحملات البريدية' : 'Email Campaign Studio'}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isAr ? 'سجل الحملات المرسلة' : 'Sent History'}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-mono">
            {sentHistory.length}
          </span>
        </button>
      </div>

      {/* -------------------------------------------------------------------------------- */}
      {/* TAB 1: SUBSCRIBERS DIRECTORY                                                     */}
      {/* -------------------------------------------------------------------------------- */}
      {activeTab === 'directory' && (
        <motion.div
          key="tab-directory"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{isAr ? 'إجمالي العملاء' : 'Total Subscribers'}</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{subscribers.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? 'قاعدة بيانات العملاء المسجلين' : 'Auto-synced with store accounts'}
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{isAr ? 'المشتركون النشطون' : 'Active Subscribers'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {subscribers.filter((s) => s.status === 'active').length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? 'مستعدون لاستقبال الحملات الإعلانية' : 'Ready for campaign broadcasts'}
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{isAr ? 'إجمالي المشتريات (بالدينار العراقي)' : 'Total Customer Value (IQD)'}</span>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalSpentAll, 'IQD', isAr ? 'ar' : 'en')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? 'عائد المبيعات التراكمي للعملاء بالدينار' : 'Cumulative sales volume in IQD'}
              </p>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1">
                <Input
                  icon={Search}
                  placeholder={isAr ? 'ابحث بالاسم، البريد الإلكتروني أو رقم الهاتف...' : 'Search subscriber name, email or phone...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="active">{isAr ? 'نشط في القائمة' : 'Active Only'}</option>
                  <option value="unsubscribed">{isAr ? 'ملغي الاشتراك' : 'Unsubscribed'}</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Subscribers Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'بيانات الاتصال' : 'Contact'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'الطلبات' : 'Orders'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'إجمالي المشتريات (IQD)' : 'Total Spent (IQD)'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الانضمام' : 'Joined'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name and Tags */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-sm">{sub.name}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {sub.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-mono text-xs">{sub.email}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{sub.phone}</div>
                      </td>

                      {/* Orders */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-white">{sub.totalOrders}</span> {isAr ? 'طلب' : 'orders'}
                      </td>

                      {/* Total Spent in Iraqi Dinar */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-400">
                        {formatCurrency(sub.totalSpent, 'IQD', isAr ? 'ar' : 'en')}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono">
                        {sub.joinedDate}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge
                          status={sub.status === 'active' ? 'active' : 'inactive'}
                          label={
                            sub.status === 'active'
                              ? isAr
                                ? 'نشط'
                                : 'Active'
                              : isAr
                              ? 'ملغي الاشتراك'
                              : 'Unsubscribed'
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-end whitespace-nowrap">
                        <button
                          onClick={() => deleteSubscriber(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSubscribers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                        {isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching subscribers found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* TAB 2: EMAIL CAMPAIGN STUDIO                                                     */}
      {/* -------------------------------------------------------------------------------- */}
      {activeTab === 'studio' && (
        <motion.div
          key="tab-studio"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Template Selector Banner */}
          <Card className="p-4 bg-slate-900/60 border-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'اختر قالب الحملة التسويقية' : 'Select Campaign Template'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'اختر من بين 5 قوالب مجهزة باحترافية أو خصص النصوص والصور كما يناسبك.'
                    : 'Choose from 5 high-converting templates or customize your copy and visuals.'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{isAr ? 'المشتركون المستهدفون:' : 'Target Audience:'}</span>
                <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {currentAudienceList.length} {isAr ? 'مشترك' : 'subscribers'}
                </span>
              </div>
            </div>

            {/* Template Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(Object.keys(templatePresets) as Array<EmailCampaignData['templateType']>).map((tKey) => {
                const item = templatePresets[tKey];
                const Icon = item.icon;
                const isSelected = campaignData.templateType === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => handleSelectTemplate(tKey)}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg bg-slate-900 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{isAr ? item.nameAr : item.nameEn}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.nameEn}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Side-by-Side Studio Layout: Form on Left, Live Preview on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Campaign Builder Form (5 cols on large screens) */}
            <div className="lg:col-span-5 space-y-5">
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'محتوى الرسالة والعرض' : 'Email Content & Details'}</span>
                  </h4>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${templatePresets[campaignData.templateType].badgeBg}`}>
                    {templatePresets[campaignData.templateType].nameAr}
                  </span>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'عنوان البريد الإلكتروني (Subject Line)' : 'Email Subject Line'}
                  </label>
                  <input
                    type="text"
                    value={campaignData.subject}
                    onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: 🎉 مرحباً بك! خصم 20% بانتظارك"
                  />
                </div>

                {/* Preheader */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'النص المعاين قبل الفتح (Preheader)' : 'Preheader Text'}
                  </label>
                  <input
                    type="text"
                    value={campaignData.preheader}
                    onChange={(e) => setCampaignData({ ...campaignData, preheader: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="النص الذي يظهر في صندوق الوارد بجانب العنوان"
                  />
                </div>

                {/* Headline inside email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'العنوان الداخلي الرئيسي (Headline)' : 'Main Banner Headline'}
                  </label>
                  <input
                    type="text"
                    value={campaignData.headline}
                    onChange={(e) => setCampaignData({ ...campaignData, headline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Body Text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'نص الرسالة التسويقية' : 'Body Copy'}
                  </label>
                  <textarea
                    rows={4}
                    value={campaignData.bodyText}
                    onChange={(e) => setCampaignData({ ...campaignData, bodyText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Coupon Block Inputs */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'قسيمة وكود الخصم' : 'Discount Coupon'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'اختياري' : 'Optional'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'كود الخصم' : 'Coupon Code'}</label>
                      <input
                        type="text"
                        value={campaignData.discountCode || ''}
                        onChange={(e) => setCampaignData({ ...campaignData, discountCode: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs font-bold rounded-lg px-2.5 py-1.5 uppercase"
                        placeholder="WELCOME20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'نسبة الخصم / الوصف' : 'Discount Label'}</label>
                      <input
                        type="text"
                        value={campaignData.discountPercent || ''}
                        onChange={(e) => setCampaignData({ ...campaignData, discountPercent: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5"
                        placeholder="20% خصم فوري"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'صلاحية العرض / الاستعجال' : 'Urgency Note'}</label>
                    <input
                      type="text"
                      value={campaignData.expireDate || ''}
                      onChange={(e) => setCampaignData({ ...campaignData, expireDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5"
                      placeholder="خلال 48 ساعة فقط"
                    />
                  </div>
                </div>

                {/* Hero Image Selector & Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'صورة الغلاف الرئيسية (Hero Banner)' : 'Hero Banner Image'}
                    </label>
                  </div>

                  <input
                    type="url"
                    value={campaignData.heroImage}
                    onChange={(e) => setCampaignData({ ...campaignData, heroImage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 font-mono"
                    placeholder="https://..."
                  />

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                    {heroPresets.map((hp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCampaignData({ ...campaignData, heroImage: hp.url })}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                          campaignData.heroImage === hp.url
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {hp.labelAr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA Button Text & Link */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'نص زر الشراء (CTA)' : 'Button Label'}
                    </label>
                    <input
                      type="text"
                      value={campaignData.ctaText}
                      onChange={(e) => setCampaignData({ ...campaignData, ctaText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2"
                      placeholder="تسوق التشكيلة الآن"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'رابط الزر (URL)' : 'Button Link'}
                    </label>
                    <input
                      type="text"
                      value={campaignData.ctaUrl}
                      onChange={(e) => setCampaignData({ ...campaignData, ctaUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 font-mono"
                      placeholder="https://store.example.com"
                    />
                  </div>
                </div>

                {/* Audience Selection */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'تحديد شريحة المشتركين المستهدفة' : 'Target Audience Segment'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAudience('active')}
                      className={`p-2.5 rounded-xl border text-start text-xs cursor-pointer transition-all ${
                        selectedAudience === 'active'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">{isAr ? 'المشتركون النشطون' : 'Active Subscribers'}</div>
                      <div className="text-[10px] text-slate-400">
                        {subscribers.filter((s) => s.status === 'active').length} {isAr ? 'مشترك' : 'users'}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAudience('vip')}
                      className={`p-2.5 rounded-xl border text-start text-xs cursor-pointer transition-all ${
                        selectedAudience === 'vip'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">{isAr ? 'عملاء VIP ذوو الإنفاق العالي' : 'High Spenders (VIP)'}</div>
                      <div className="text-[10px] text-slate-400">
                        {getAudienceSubscribers('vip').length} {isAr ? 'مشترك' : 'users'}
                      </div>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Action Buttons underneath Form */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  leftIcon={<Copy className="w-4 h-4 text-indigo-400" />}
                  onClick={handleCopyHtmlCode}
                  className="flex-1"
                >
                  {isAr ? 'نسخ كود HTML' : 'Copy HTML'}
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
                  onClick={handleDownloadHtmlFile}
                  className="flex-1"
                >
                  {isAr ? 'تحميل كملف .html' : 'Download .html'}
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Responsive Preview (7 cols on large screens) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Preview Controls Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'المعاينة الحية المتجاوبة' : 'Live Responsive Preview'}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live React Render
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Desktop Preview */}
                  <button
                    onClick={() => {
                      setPreviewDevice('desktop');
                      setShowHtmlCode(false);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      previewDevice === 'desktop' && !showHtmlCode
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isAr ? 'معاينة سطح المكتب (Desktop)' : 'Desktop View'}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>

                  {/* Mobile Preview */}
                  <button
                    onClick={() => {
                      setPreviewDevice('mobile');
                      setShowHtmlCode(false);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      previewDevice === 'mobile' && !showHtmlCode
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isAr ? 'معاينة شاشة الهاتف (Mobile 375px)' : 'Mobile View'}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>

                  {/* HTML Code Inspector */}
                  <button
                    onClick={() => setShowHtmlCode(!showHtmlCode)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      showHtmlCode
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isAr ? 'عرض الكود المصدري (HTML)' : 'Inspect HTML Code'}
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="p-4 sm:p-6 bg-slate-950 border border-slate-800/80 rounded-2xl min-h-[580px] flex items-center justify-center overflow-x-auto shadow-inner">
                {showHtmlCode ? (
                  <div className="w-full max-h-[640px] overflow-y-auto font-mono text-[11px] bg-slate-900 p-4 rounded-xl text-slate-300 border border-slate-800 whitespace-pre">
                    {generateEmailHtml(campaignData)}
                  </div>
                ) : (
                  <WelcomeEmailTemplate
                    data={campaignData}
                    previewDevice={previewDevice}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* TAB 3: SENT CAMPAIGN HISTORY                                                     */}
      {/* -------------------------------------------------------------------------------- */}
      {activeTab === 'history' && (
        <motion.div
          key="tab-history"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Top Performance Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'إجمالي الحملات المرسلة' : 'Total Campaigns Sent'}</div>
              <div className="text-2xl font-bold text-white">{sentHistory.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'أرشيف الإرسال الكامل' : 'All dispatched messages'}</p>
            </Card>

            <Card>
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'متوسط نسبة الفتح' : 'Avg. Open Rate'}</div>
              <div className="text-2xl font-bold text-indigo-400">
                {(
                  sentHistory.reduce((acc, c) => acc + c.openRate, 0) /
                  (sentHistory.length || 1)
                ).toFixed(1)}
                %
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'أعلى من المعدل العام' : 'Exceeds regional avg.'}</p>
            </Card>

            <Card>
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'متوسط النقر والتفاعل' : 'Avg. Click Rate'}</div>
              <div className="text-2xl font-bold text-emerald-400">
                {(
                  sentHistory.reduce((acc, c) => acc + c.clickRate, 0) /
                  (sentHistory.length || 1)
                ).toFixed(1)}
                %
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'تفاعل المشترين مع أزرار الشراء' : 'Direct clicks to catalog'}</p>
            </Card>

            <Card>
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'إجمالي الرسائل المستلمة' : 'Total Reach'}</div>
              <div className="text-2xl font-bold text-white">
                {sentHistory.reduce((acc, c) => acc + c.recipientsCount, 0)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'وصول ناجح للمشتركين' : 'Delivered recipients'}</p>
            </Card>
          </div>

          {/* History List Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-start">{isAr ? 'عنوان الحملة' : 'Campaign Subject'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'القالب' : 'Template'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الإرسال' : 'Sent Date'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'المستلمون' : 'Delivered To'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'نسبة الفتح' : 'Open Rate'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'نسبة النقر' : 'Click Rate'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'قناة البث' : 'Channel'}</th>
                    <th className="py-3.5 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sentHistory.map((item) => {
                    const preset = templatePresets[item.templateType] || templatePresets.welcome;
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Name & Subject */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-white text-sm truncate">{item.subject}</div>
                          <div className="text-slate-400 text-[11px] truncate mt-0.5">{item.name}</div>
                        </td>

                        {/* Template Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${preset.badgeBg}`}>
                            {isAr ? preset.nameAr : preset.nameEn}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-xs">
                          {item.sentDate}
                        </td>

                        {/* Delivered to */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-white">{item.recipientsCount}</span> {isAr ? 'مشترك' : 'recipients'}
                        </td>

                        {/* Open Rate */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-400">{item.openRate}%</span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(item.openRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Click Rate */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">{item.clickRate}%</span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(item.clickRate * 2, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Channel Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.channel}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-end whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewingHistoryItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title={isAr ? 'معاينة الرسالة' : 'Preview Email'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleLoadCampaignFromHistory(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title={isAr ? 'تعديل في الاستوديو' : 'Edit in Studio'}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title={isAr ? 'حذف من السجل' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* MODAL 1: ADD SUBSCRIBER                                                          */}
      {/* -------------------------------------------------------------------------------- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isAr ? 'إضافة عميل أو مشترك جديد' : 'Add New Subscriber'}
        description={isAr ? 'أدخل معلومات الاتصال الخاصة بالعميل لحفظها في القاعدة.' : 'Register new customer contact details.'}
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={isAr ? 'الاسم الكامل' : 'Full Name'}
            placeholder={isAr ? 'محمد الجبوري' : 'Ali Hassan'}
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Input
            label={isAr ? 'البريد الإلكتروني' : 'Email Address'}
            type="email"
            placeholder="customer@example.com"
            required
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />

          <Input
            label={isAr ? 'رقم الهاتف / الجوال' : 'Phone Number'}
            placeholder="+964 770 123 4567"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />

          <Input
            label={isAr ? 'وسم / تصنيف مخصص' : 'Customer Tag'}
            placeholder={isAr ? 'عميل مميز' : 'VIP'}
            value={formTag}
            onChange={(e) => setFormTag(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" type="submit">
              {isAr ? 'حفظ العميل' : 'Save Subscriber'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* -------------------------------------------------------------------------------- */}
      {/* MODAL 2: SEND TEST EMAIL                                                         */}
      {/* -------------------------------------------------------------------------------- */}
      <Modal
        isOpen={isTestEmailModalOpen}
        onClose={() => setIsTestEmailModalOpen(false)}
        title={isAr ? 'إرسال بريد تجريبي إلى بريدي' : 'Send Test Email to Admin'}
        description={isAr ? 'أدخل البريد الإلكتروني الذي ترغب في استلام المعاينة التجريبية عليه.' : 'Send a test preview to verify inbox appearance.'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label={isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Test Email'}
            type="email"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            placeholder="admin@example.com"
          />

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">{isAr ? 'محتوى الرسالة التجريبية:' : 'Preview Specs:'}</div>
            <div>• العنوان: {campaignData.subject}</div>
            <div>• القالب: {templatePresets[campaignData.templateType].nameAr}</div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsTestEmailModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleSendTestEmail}
            >
              {isAr ? 'إرسال الآن' : 'Dispatch Test Now'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* -------------------------------------------------------------------------------- */}
      {/* MODAL 3: BROADCAST DISPATCH CONFIRMATION & EXECUTION                             */}
      {/* -------------------------------------------------------------------------------- */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          if (!isSendingSimulation) setIsDispatchModalOpen(false);
        }}
        title={isAr ? 'تأكيد وإطلاق البث الجماعي للحملة' : 'Confirm Campaign Broadcast'}
        description={isAr ? 'اختر آلية الإرسال المناسبة لإطلاق الحملة لجميع المشتركين.' : 'Select dispatch channel to send campaign to audience.'}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Campaign Summary Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'العنوان الرئيسي:' : 'Subject:'}</span>
              <span className="font-bold text-white text-sm">{campaignData.subject}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'القالب المستخدم:' : 'Template:'}</span>
              <span className="text-indigo-400 font-semibold">{templatePresets[campaignData.templateType].nameAr}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'عدد المشتركين المستهدفين:' : 'Target Audience:'}</span>
              <span className="font-bold text-emerald-400 text-sm">
                {currentAudienceList.length} {isAr ? 'مشترك نشط' : 'recipients'}
              </span>
            </div>
          </div>

          {/* Simulation Progress Bar */}
          {isSendingSimulation ? (
            <div className="space-y-3 p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-center">
              <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <Send className="w-4 h-4 text-indigo-400 animate-bounce" />
                <span>{isAr ? 'جاري إرسال الحملة إلى المشتركين...' : 'Dispatching emails in progress...'}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                />
              </div>
              <div className="text-xs font-mono text-indigo-300">
                {simulationProgress}% {isAr ? 'مكتمل' : 'completed'}
              </div>
            </div>
          ) : (
            /* Dispatch Options */
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isAr ? 'اختر قناة البث والإرسال:' : 'Select Dispatch Channel:'}
              </div>

              {/* Channel 1: Resend / Automated API */}
              <button
                type="button"
                onClick={() => handleBroadcastViaSimulator('resend')}
                className="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-950/40 text-start flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {isAr ? 'إرسال مباشر وسريع عبر Resend API' : 'Broadcast via Resend API'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isAr ? 'إرسال فوري مع تسجيل تقارير التسليم ونسب الفتح التقديرية' : 'Direct API dispatch with delivery tracking'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/30">
                  {isAr ? 'موصى به' : 'Recommended'}
                </span>
              </button>

              {/* Channel 2: Mailto with BCC */}
              <button
                type="button"
                onClick={handleBroadcastViaMailto}
                className="w-full p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-start flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-200">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isAr ? 'فتح في تطبيق البريد المباشر (BCC)' : 'Open in Default Mail Client (BCC)'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isAr ? 'يفتح Gmail / Outlook مع وضع عناوين المشتركين في النسخة المخفية BCC' : 'Opens native client with all emails in BCC'}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              disabled={isSendingSimulation}
              onClick={() => setIsDispatchModalOpen(false)}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* -------------------------------------------------------------------------------- */}
      {/* MODAL 4: PREVIEW SENT CAMPAIGN FROM HISTORY                                      */}
      {/* -------------------------------------------------------------------------------- */}
      <Modal
        isOpen={!!previewingHistoryItem}
        onClose={() => setPreviewingHistoryItem(null)}
        title={previewingHistoryItem?.subject || ''}
        description={isAr ? `أرسلت بتاريخ: ${previewingHistoryItem?.sentDate}` : `Sent on: ${previewingHistoryItem?.sentDate}`}
        maxWidth="lg"
      >
        {previewingHistoryItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl text-xs border border-slate-800">
              <div>
                <span className="text-slate-400">{isAr ? 'المستلمون:' : 'Delivered:'} </span>
                <span className="font-bold text-white">{previewingHistoryItem.recipientsCount}</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'نسبة الفتح:' : 'Open Rate:'} </span>
                <span className="font-bold text-indigo-400">{previewingHistoryItem.openRate}%</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'نسبة النقر:' : 'Click Rate:'} </span>
                <span className="font-bold text-emerald-400">{previewingHistoryItem.clickRate}%</span>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800/80">
              <WelcomeEmailTemplate
                data={previewingHistoryItem.campaignData}
                previewDevice="desktop"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="primary"
                onClick={() => {
                  handleLoadCampaignFromHistory(previewingHistoryItem);
                  setPreviewingHistoryItem(null);
                }}
              >
                {isAr ? 'تعديل وإعادة استخدام في الاستوديو' : 'Re-use in Studio'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscribersList;
