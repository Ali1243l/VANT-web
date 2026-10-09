import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet } from './Sheet';
import { Button, Input } from './ui';
import { Product, ProductVariant, useAdminBridge } from './useAdminBridge';
import { ImageUploader } from './components/ImageUploader';
import {
  Plus,
  X,
  Sparkles,
  Shirt,
  FileText,
  Image as ImageIcon,
  Box,
  Coins,
  Info,
  Check,
  Palette,
  ChevronDown,
  Trash2,
  Sliders,
  Layers,
  ArrowRight,
  UploadCloud,
  Loader2,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { toEnglishDigits, formatCurrency } from './format';
import {
  extractDominantColor,
  groupImagesByColor,
  hexToRgb,
  colorDistance,
  getClosestLuxuryColorName,
} from './utils/colorExtraction';
import { translateArabicToEnglish } from './utils/magicTranslate';
import { uploadImageToSupabase, uploadDataUrlToSupabase } from '../lib/storage';

interface ProductFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
}

const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom'];

// Commercial retail preset palettes for quick 1-click addition
const LUXURY_COLOR_PRESETS = [
  { ar: 'أسود', en: 'Black', hex: '#0f172a' },
  { ar: 'أبيض', en: 'White', hex: '#f8fafc' },
  { ar: 'كحلي', en: 'Navy Blue', hex: '#172554' },
  { ar: 'زيتي', en: 'Olive Green', hex: '#4d5f2d' },
  { ar: 'ماروني / عنابي', en: 'Maroon', hex: '#800f2f' },
  { ar: 'بيج', en: 'Beige', hex: '#e2c7a8' },
  { ar: 'رصاصي', en: 'Grey', hex: '#64748b' },
  { ar: 'أزرق نيلي', en: 'Royal Blue', hex: '#1e40af' },
];

export const ProductFormSheet: React.FC<ProductFormSheetProps> = ({
  isOpen,
  onClose,
  editingProduct,
}) => {
  const { addProduct, updateProduct, lang } = useAdminBridge();
  const isAr = lang === 'ar';

  const [formData, setFormData] = useState<{
    name: string;
    nameEn: string;
    sku: string;
    category: string;
    price: string;
    salePrice: string;
    stock: string;
    status: 'active' | 'draft' | 'outOfStock' | 'lowStock';
    images: string[];
    sizes: string[];
    descriptionAr: string;
    descriptionEn: string;
    materialDetails: string;
    availabilityStatus: 'in_stock' | 'limited' | 'coming_soon' | 'sold_out';
    hasVariants: boolean;
    variants: ProductVariant[];
  }>({
    name: '',
    nameEn: '',
    sku: '',
    category: 'ملابس وأزياء',
    price: '',
    salePrice: '',
    stock: '15',
    status: 'active',
    images: [],
    sizes: ['M', 'L', 'XL'],
    descriptionAr: '',
    descriptionEn: '',
    materialDetails: '',
    availabilityStatus: 'in_stock',
    hasVariants: false,
    variants: [],
  });

  // Track expanded/collapsed cards for variants
  const [expandedVariantIds, setExpandedVariantIds] = useState<Record<string, boolean>>({});
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [variantCustomSizeInputs, setVariantCustomSizeInputs] = useState<Record<string, string>>({});
  const [variantShowCustom, setVariantShowCustom] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Magic Smart Upload (Client-Side Color Sorting) States
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState('');
  const [isDraggingMagic, setIsDraggingMagic] = useState(false);
  const [magicNotice, setMagicNotice] = useState<{
    title: string;
    subtitle: string;
    swatches: string[];
    count: number;
  } | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Magic Translation States
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [translateNotice, setTranslateNotice] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      const initialImages =
        editingProduct.images && editingProduct.images.length > 0
          ? editingProduct.images
          : editingProduct.imageUrl
          ? [editingProduct.imageUrl]
          : [];

      const variantsList = editingProduct.variants || [];
      const hasVars = !!(editingProduct.hasVariants && variantsList.length > 0);

      setFormData({
        name: editingProduct.name,
        nameEn: editingProduct.nameEn || '',
        sku: editingProduct.sku,
        category: editingProduct.category,
        price: editingProduct.price.toString(),
        salePrice: editingProduct.salePrice ? editingProduct.salePrice.toString() : '',
        stock: editingProduct.stock.toString(),
        status: editingProduct.status,
        images: initialImages,
        sizes: editingProduct.sizes || ['M', 'L', 'XL'],
        descriptionAr: editingProduct.descriptionAr || '',
        descriptionEn: editingProduct.descriptionEn || '',
        materialDetails: editingProduct.materialDetails || '',
        availabilityStatus: editingProduct.availabilityStatus || 'in_stock',
        hasVariants: hasVars,
        variants: variantsList,
      });

      // Expand all variants by default when opening
      const expandedMap: Record<string, boolean> = {};
      variantsList.forEach((v) => {
        expandedMap[v.id] = true;
      });
      setExpandedVariantIds(expandedMap);
    } else {
      // Reset form for fresh product
      const defaultSku = `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        name: '',
        nameEn: '',
        sku: defaultSku,
        category: 'ملابس وأزياء',
        price: '',
        salePrice: '',
        stock: '15',
        status: 'active',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80'],
        sizes: ['M', 'L', 'XL'],
        descriptionAr: '',
        descriptionEn: '',
        materialDetails: '',
        availabilityStatus: 'in_stock',
        hasVariants: false,
        variants: [],
      });
      setExpandedVariantIds({});
    }
    setShowCustomInput(false);
    setCustomSizeInput('');
    setVariantCustomSizeInputs({});
    setVariantShowCustom({});
  }, [editingProduct, isOpen]);

  // Standard sizes toggle for base product
  const toggleSize = (size: string) => {
    if (size === 'Custom') {
      setShowCustomInput((prev) => !prev);
      return;
    }
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const updated = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: updated };
    });
  };

  const addCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!formData.sizes.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, trimmed] }));
    }
    setCustomSizeInput('');
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  // Variant operations
  const handleAddNewVariant = (preset?: { ar: string; en: string; hex: string }) => {
    const newId = `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const baseP = parseFloat(formData.price) || 0;
    const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;

    const newVariant: ProductVariant = {
      id: newId,
      colorNameAr: preset ? preset.ar : isAr ? 'لون جديد' : 'New Color',
      colorNameEn: preset ? preset.en : 'New Color',
      colorHex: preset ? preset.hex : '#0f172a',
      price: baseP > 0 ? baseP : undefined,
      salePrice: baseSp,
      stock: 12,
      sizes: ['M', 'L', 'XL'],
      images: formData.images.length > 0 ? [...formData.images] : [],
    };

    setFormData((prev) => ({
      ...prev,
      hasVariants: true,
      variants: [...prev.variants, newVariant],
    }));

    setExpandedVariantIds((prev) => ({
      ...prev,
      [newId]: true,
    }));
  };

  const handleDeleteVariant = (id: string) => {
    setFormData((prev) => {
      const filtered = prev.variants.filter((v) => v.id !== id);
      return {
        ...prev,
        variants: filtered,
        hasVariants: filtered.length > 0,
      };
    });
  };

  const toggleVariantExpand = (id: string) => {
    setExpandedVariantIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  };

  const toggleVariantSize = (variantId: string, size: string) => {
    if (size === 'Custom') {
      setVariantShowCustom((prev) => ({
        ...prev,
        [variantId]: !prev[variantId],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id !== variantId) return v;
        const exists = v.sizes.includes(size);
        const updatedSizes = exists ? v.sizes.filter((s) => s !== size) : [...v.sizes, size];
        return { ...v, sizes: updatedSizes };
      }),
    }));
  };

  const addVariantCustomSize = (variantId: string) => {
    const inputVal = variantCustomSizeInputs[variantId]?.trim().toUpperCase();
    if (!inputVal) return;

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id !== variantId) return v;
        if (v.sizes.includes(inputVal)) return v;
        return { ...v, sizes: [...v.sizes, inputVal] };
      }),
    }));

    setVariantCustomSizeInputs((prev) => ({ ...prev, [variantId]: '' }));
  };

  const removeVariantSize = (variantId: string, size: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id !== variantId) return v;
        return { ...v, sizes: v.sizes.filter((s) => s !== size) };
      }),
    }));
  };

  // ========================================================
  // Task 4: Magic Bulk Image Upload & Client-Side Color Sorting
  // ========================================================
  const handleBulkMagicUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const fileList: File[] = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    setIsAnalyzingColors(true);
    setAnalyzingStatus(
      isAr
        ? `جاري فحص طيف درجات الألوان وتصفية الخلفيات لـ ${fileList.length} صور (HTML5 Canvas)...`
        : `Analyzing color spectrum and studio backdrops for ${fileList.length} images (HTML5 Canvas)...`
    );

    try {
      // Process client-side via 2-Pass Double-Check CIELAB Clustering
      const groupedClusters = await groupImagesByColor(fileList, 9.2);

      if (groupedClusters.length === 0) {
        setIsAnalyzingColors(false);
        return;
      }

      const baseP = parseFloat(formData.price) || 0;
      const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      const baseSizes = formData.sizes.length > 0 ? formData.sizes : ['M', 'L', 'XL'];

      let updatedVariants: ProductVariant[] = [...formData.variants];
      const newlyExpanded: Record<string, boolean> = { ...expandedVariantIds };
      const generatedSwatches: string[] = [];

      // If variants already exist, merge matching colors (Double-Check: CIELAB ΔE <= 9.2 AND same category)
      if (formData.hasVariants && updatedVariants.length > 0) {
        for (const cluster of groupedClusters) {
          generatedSwatches.push(cluster.hex);
          const clusterRgb = hexToRgb(cluster.hex);

          // Find closest matching existing variant
          let matchedIdx = -1;
          let bestDist = Infinity;

          updatedVariants.forEach((v, idx) => {
            const vRgb = hexToRgb(v.colorHex || '#000000');
            const dist = colorDistance(clusterRgb, vRgb);
            const sameCategory = cluster.colorNameAr === v.colorNameAr;
            if (sameCategory && dist < bestDist && dist <= 9.2) {
              bestDist = dist;
              matchedIdx = idx;
            }
          });

          if (matchedIdx !== -1) {
            // Append cluster images to matched variant
            const existing = updatedVariants[matchedIdx];
            const mergedImages = [...existing.images, ...cluster.images];
            updatedVariants[matchedIdx] = {
              ...existing,
              images: mergedImages,
            };
            newlyExpanded[existing.id] = true;
          } else {
            // Add as new variant
            const newVar: ProductVariant = {
              id: cluster.id,
              colorNameAr: cluster.colorNameAr,
              colorNameEn: cluster.colorNameEn,
              colorHex: cluster.hex,
              price: baseP > 0 ? baseP : undefined,
              salePrice: baseSp,
              stock: 12,
              sizes: [...baseSizes],
              images: cluster.images,
            };
            updatedVariants.push(newVar);
            newlyExpanded[newVar.id] = true;
          }
        }
      } else {
        // First-time generation: construct variants from all detected clusters
        updatedVariants = groupedClusters.map((cluster) => {
          generatedSwatches.push(cluster.hex);
          return {
            id: cluster.id,
            colorNameAr: cluster.colorNameAr,
            colorNameEn: cluster.colorNameEn,
            colorHex: cluster.hex,
            price: baseP > 0 ? baseP : undefined,
            salePrice: baseSp,
            stock: 12,
            sizes: [...baseSizes],
            images: cluster.images,
          };
        });

        updatedVariants.forEach((v) => {
          newlyExpanded[v.id] = true;
        });
      }

      // Automatically toggle hasVariants to TRUE and populate variants state
      setFormData((prev) => ({
        ...prev,
        hasVariants: true,
        variants: updatedVariants,
      }));

      setExpandedVariantIds((prev) => ({
        ...prev,
        ...newlyExpanded,
      }));

      setMagicNotice({
        title: isAr
          ? `✨ تم الفرز الذكي بنجاح: اكتشاف ${groupedClusters.length} درجات ألوان`
          : `✨ Magic Upload Complete: Identified ${groupedClusters.length} Colorways`,
        subtitle: isAr
          ? `تم تصنيف وفرز ${fileList.length} صورة بنجاح وتوليد بطاقات المتغيرات الملكية الجاهزة للتعديل.`
          : `Sorted ${fileList.length} images into discrete luxury variants with ready-to-publish color names.`,
        swatches: generatedSwatches,
        count: fileList.length,
      });

      // Clear notice after 7 seconds
      setTimeout(() => {
        setMagicNotice(null);
      }, 7000);
    } catch (err) {
      console.error('Magic upload error:', err);
    } finally {
      setIsAnalyzingColors(false);
    }
  };

  // Helper to re-detect color from a variant's first image
  const handleAutoDetectVariantColor = async (variantId: string) => {
    const targetVariant = formData.variants.find((v) => v.id === variantId);
    if (!targetVariant || !targetVariant.images || targetVariant.images.length === 0) return;

    try {
      const firstImgUrl = targetVariant.images[0];
      // Fetch or convert to blob
      const res = await fetch(firstImgUrl);
      const blob = await res.blob();
      const file = new File([blob], 'variant_image.jpg', { type: blob.type || 'image/jpeg' });
      const detectedHex = await extractDominantColor(file);
      const luxuryName = getClosestLuxuryColorName(detectedHex);

      updateVariant(variantId, {
        colorHex: detectedHex,
        colorNameAr: luxuryName.ar,
        colorNameEn: luxuryName.en,
      });
    } catch (err) {
      console.error('Error auto-detecting variant color:', err);
    }
  };

  // ========================================================
  // Phase 9: Magic Translation without Paid API Keys
  // ========================================================
  const handleMagicTranslate = async (
    sourceText: string,
    targetField: 'nameEn' | 'descriptionEn' | 'materialDetails' | string,
    isVariant = false,
    variantId?: string
  ) => {
    const trimmed = sourceText?.trim();
    if (!trimmed) {
      setTranslateNotice(
        isAr
          ? 'يرجى كتابة الحقل باللغة العربية أولاً لترجمته تلقائياً'
          : 'Please write the Arabic text first to auto-translate.'
      );
      setTimeout(() => setTranslateNotice(null), 3500);
      return;
    }

    setTranslatingField(targetField);
    setTranslateNotice(null);

    try {
      const isTitle = targetField === 'nameEn' || isVariant;
      const translated = await translateArabicToEnglish(trimmed, isTitle);

      if (isVariant && variantId) {
        updateVariant(variantId, { colorNameEn: translated });
      } else if (targetField === 'nameEn') {
        setFormData((prev) => ({ ...prev, nameEn: translated }));
      } else if (targetField === 'descriptionEn') {
        setFormData((prev) => ({ ...prev, descriptionEn: translated }));
      } else if (targetField === 'materialDetails') {
        setFormData((prev) => ({ ...prev, materialDetails: translated }));
      }
    } catch (err) {
      console.error('Magic translation error:', err);
    } finally {
      setTranslatingField(null);
    }
  };

  // ========================================================
  // Fully Automatic Shirt Color Reading & Variant Splitting on Drop
  // ========================================================
  const handleVariantImageDrop = async (variantId: string, files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      const clusters = await groupImagesByColor(files, 9.2);
      if (clusters.length === 0) return;

      const baseP = parseFloat(formData.price) || 0;
      const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      const baseSizes = formData.sizes.length > 0 ? formData.sizes : ['M', 'L', 'XL'];

      // Target current variant
      const currentVariant = formData.variants.find((v) => v.id === variantId);
      if (!currentVariant) return;

      const currentRgb = hexToRgb(currentVariant.colorHex || '#000000');

      // Determine which cluster matches current variant best
      let matchedClusterIdx = 0;
      let minClusterDist = Infinity;
      clusters.forEach((c, idx) => {
        const dist = colorDistance(hexToRgb(c.hex), currentRgb);
        if (dist < minClusterDist) {
          minClusterDist = dist;
          matchedClusterIdx = idx;
        }
      });

      const primaryCluster = clusters[matchedClusterIdx];
      const otherClusters = clusters.filter((_, idx) => idx !== matchedClusterIdx);

      const mergedCurrentImages = [...currentVariant.images, ...primaryCluster.images].slice(0, 10);
      const isCurrentFresh = currentVariant.images.length === 0;

      let updatedList = formData.variants.map((v) => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          colorHex: isCurrentFresh ? primaryCluster.hex : v.colorHex,
          colorNameAr: isCurrentFresh ? primaryCluster.colorNameAr : v.colorNameAr,
          colorNameEn: isCurrentFresh ? primaryCluster.colorNameEn : v.colorNameEn,
          images: mergedCurrentImages,
        };
      });

      const newlyExpanded: Record<string, boolean> = {
        ...expandedVariantIds,
        [variantId]: true,
      };

      // For every other distinct color detected among the dropped shirts:
      // Merge with an existing variant if color matches (Double-Check: CIELAB ΔE <= 9.2 AND same category), or AUTO-SPAWN A NEW VARIANT CARD!
      for (const extraCluster of otherClusters) {
        const clusterRgb = hexToRgb(extraCluster.hex);
        let existingMatchIdx = -1;
        let bestDist = Infinity;

        updatedList.forEach((v, idx) => {
          const vRgb = hexToRgb(v.colorHex || '#000000');
          const dist = colorDistance(clusterRgb, vRgb);
          const sameCategory = extraCluster.colorNameAr === v.colorNameAr;
          if (sameCategory && dist < bestDist && dist <= 9.2) {
            bestDist = dist;
            existingMatchIdx = idx;
          }
        });

        if (existingMatchIdx !== -1) {
          const existing = updatedList[existingMatchIdx];
          updatedList[existingMatchIdx] = {
            ...existing,
            images: [...existing.images, ...extraCluster.images].slice(0, 10),
          };
          newlyExpanded[existing.id] = true;
        } else {
          // Auto-spawn brand new variant card for this detected shirt color!
          const newVar: ProductVariant = {
            id: extraCluster.id,
            colorNameAr: extraCluster.colorNameAr,
            colorNameEn: extraCluster.colorNameEn,
            colorHex: extraCluster.hex,
            price: baseP > 0 ? baseP : undefined,
            salePrice: baseSp,
            stock: 12,
            sizes: [...baseSizes],
            images: extraCluster.images,
          };
          updatedList.push(newVar);
          newlyExpanded[newVar.id] = true;
        }
      }

      setFormData((prev) => ({
        ...prev,
        variants: updatedList,
        hasVariants: true,
      }));
      setExpandedVariantIds(newlyExpanded);

      if (otherClusters.length > 0) {
        setMagicNotice({
          title: isAr
            ? `✨ تم فحص القمصان بدبل تشيك: تقسيمها إلى ${clusters.length} ألوان دقيقة!`
            : `✨ Double-Checked: Split shirts into ${clusters.length} discrete colorways!`,
          subtitle: isAr
            ? `تم التحقق المزدوج من كل قميص وتوليد كروت منفصلة لجميع الألوان بدقة 100% وبدون دمج.`
            : `Verified every shirt via pairwise double-check and generated separate cards for all colors.`,
          swatches: clusters.map((c) => c.hex),
          count: files.length,
        });
      } else {
        setMagicNotice({
          title: isAr
            ? `✨ تم التعرف التلقائي على لون القميص: "${primaryCluster.colorNameAr}"`
            : `✨ Auto-Detected Shirt: "${primaryCluster.colorNameEn}"`,
          subtitle: isAr
            ? `تم تحديث كود اللون (${primaryCluster.hex}) وإضافة الصور فورياً.`
            : `Assigned hex code (${primaryCluster.hex}) and loaded images instantly.`,
          swatches: [primaryCluster.hex],
          count: files.length,
        });
      }

      setTimeout(() => setMagicNotice(null), 6000);
    } catch (err) {
      console.error('Error auto-sorting dropped variant images:', err);
    }
  };

  const handleBaseImageDrop = async (files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      const clusters = await groupImagesByColor(files, 9.2);
      if (clusters.length === 0) return;

      const baseP = parseFloat(formData.price) || 0;
      const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      const baseSizes = formData.sizes.length > 0 ? formData.sizes : ['M', 'L', 'XL'];

      // If 2 or more colors detected, automatically toggle hasVariants = true and build variants!
      if (clusters.length > 1) {
        const generatedVariants: ProductVariant[] = clusters.map((c) => ({
          id: c.id,
          colorNameAr: c.colorNameAr,
          colorNameEn: c.colorNameEn,
          colorHex: c.hex,
          price: baseP > 0 ? baseP : undefined,
          salePrice: baseSp,
          stock: 12,
          sizes: [...baseSizes],
          images: c.images,
        }));

        const expandedMap: Record<string, boolean> = {};
        generatedVariants.forEach((v) => {
          expandedMap[v.id] = true;
        });

        setFormData((prev) => ({
          ...prev,
          hasVariants: true,
          variants: generatedVariants,
        }));
        setExpandedVariantIds(expandedMap);

        setMagicNotice({
          title: isAr
            ? `✨ تم قراءة القمصان وتقسيمها إلى ${clusters.length} ألوان تلقائياً!`
            : `✨ Auto-Read Shirts & Split into ${clusters.length} Colorways!`,
          subtitle: isAr
            ? `تم تفعيل خيارات الألوان وتوزيع الصور وتوليد الكروت فورياً بدون أي تدخل يدوي.`
            : `Enabled variants, sorted images by fabric color, and synthesized variant cards.`,
          swatches: clusters.map((c) => c.hex),
          count: files.length,
        });
        setTimeout(() => setMagicNotice(null), 6000);
      } else {
        // Single color detected: add images to base product, and notify user
        const singleCluster = clusters[0];
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...singleCluster.images].slice(0, 10),
        }));

        setMagicNotice({
          title: isAr
            ? `✨ تم قراءة القميص وتحديد لونه: "${singleCluster.colorNameAr}"`
            : `✨ Auto-Detected Shirt Color: "${singleCluster.colorNameEn}"`,
          subtitle: isAr
            ? `تم التعرف على كود اللون (${singleCluster.hex}) وإضافة الصور. عند إضافة ألوان أخرى سيتم التقسيم تلقائياً.`
            : `Identified color (${singleCluster.hex}). Uploading additional colors will automatically split them.`,
          swatches: [singleCluster.hex],
          count: files.length,
        });
        setTimeout(() => setMagicNotice(null), 6000);
      }
    } catch (err) {
      console.error('Error auto-sorting base images:', err);
    }
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const priceNum = parseFloat(formData.price) || 0;
      const salePriceNum = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      let stockNum = parseInt(formData.stock, 10) || 0;

      // 1. Process and upload any remaining data URLs in formData.images to Supabase Storage
      const processedImages: string[] = [];
      for (const img of formData.images) {
        if (img && img.startsWith('data:')) {
          const permUrl = await uploadDataUrlToSupabase(img, 'catalog', 'shirt');
          processedImages.push(permUrl);
        } else if (img && img.trim()) {
          processedImages.push(img.trim());
        }
      }

      // 2. Process and upload any remaining data URLs in variants to Supabase Storage
      let variantsPayload: ProductVariant[] | undefined = undefined;
      const hasVariantsEnabled = formData.hasVariants && formData.variants.length > 0;

      if (hasVariantsEnabled) {
        const tempVariants: ProductVariant[] = [];
        for (const v of formData.variants) {
          const vImages: string[] = [];
          for (const img of v.images) {
            if (img && img.startsWith('data:')) {
              const permUrl = await uploadDataUrlToSupabase(img, 'catalog', `shirt_${v.colorNameEn || 'color'}`);
              vImages.push(permUrl);
            } else if (img && img.trim()) {
              vImages.push(img.trim());
            }
          }
          tempVariants.push({ ...v, images: vImages });
        }
        variantsPayload = tempVariants;
        stockNum = variantsPayload.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      }

      // Ensure all variant images are aggregated so they appear in galleries and database
      const allVariantImages = variantsPayload ? variantsPayload.flatMap((v) => v.images) : [];
      const combinedAllImages = Array.from(new Set([...processedImages, ...allVariantImages])).filter(Boolean);

      // Auto compute stock status
      let status = formData.status;
      if (stockNum === 0 || formData.availabilityStatus === 'sold_out') {
        status = 'outOfStock';
      } else if (stockNum <= 5 || formData.availabilityStatus === 'limited') {
        status = 'lowStock';
      }

      // Determine primary image
      let primaryImage =
        combinedAllImages.length > 0
          ? combinedAllImages[0]
          : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80';

      if (hasVariantsEnabled && variantsPayload && variantsPayload[0]?.images?.length > 0) {
        primaryImage = variantsPayload[0].images[0];
      }

      const productPayload = {
        name: formData.name,
        nameEn: formData.nameEn || formData.name,
        sku: formData.sku,
        category: formData.category,
        price: priceNum,
        salePrice: salePriceNum,
        stock: stockNum,
        status,
        imageUrl: primaryImage,
        images: combinedAllImages.length > 0 ? combinedAllImages : [primaryImage],
        sizes: formData.sizes,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        materialDetails: formData.materialDetails,
        availabilityStatus: formData.availabilityStatus,
        isOnOffer: !!salePriceNum,
        hasVariants: hasVariantsEnabled,
        variants: variantsPayload,
      };

      if (editingProduct) {
        updateProduct(editingProduct.id, productPayload);
      } else {
        addProduct(productPayload);
      }

      onClose();
    } catch (err) {
      console.error('Error during product form submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const regularPriceNum = parseFloat(formData.price) || 0;
  const salePriceNum = parseFloat(formData.salePrice) || 0;
  const hasDiscount = regularPriceNum > 0 && salePriceNum > 0 && salePriceNum < regularPriceNum;
  const computedDiscountPercent = hasDiscount
    ? Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100)
    : 0;
  const computedSavings = hasDiscount ? regularPriceNum - salePriceNum : 0;

  // Aggregate variant metrics for live status display
  const totalVariantsStock = formData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
      title={
        editingProduct
          ? isAr
            ? 'تعديل بيانات المنتج وخيارات الألوان'
            : 'Edit Product & Color Variants'
          : isAr
          ? 'إضافة منتج جديد للكتالوج (PIM)'
          : 'Add New Catalog Product (PIM)'
      }
      description={
        isAr
          ? 'إدارة متكاملة لخيارات الألوان المستقلة، والمخزون، ومعارض الصور، والمقاسات بالدينار العراقي.'
          : 'Advanced Product Information Management (PIM) with isolated color variants, inventory, and media galleries in IQD.'
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
            {formData.hasVariants && (
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Palette className="w-3.5 h-3.5" />
                {formData.variants.length} {isAr ? 'ألوان مفعلة' : 'Color variants'} • {totalVariantsStock} {isAr ? 'قطعة' : 'units'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSubmit()}
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-md shadow-indigo-600/30"
            >
              {editingProduct
                ? isAr
                  ? 'حفظ التعديلات'
                  : 'Save Changes'
                : isAr
                ? 'نشر المنتج الآن'
                : 'Publish Product'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-start pb-6">
        {/* ======================================================== */}
        {/* ✨ MAGIC SMART UPLOAD: CLIENT-SIDE COLOR SORTING DROPZONE */}
        {/* ======================================================== */}
        <div className="relative">
          {/* Hidden File Input for Bulk Upload */}
          <input
            ref={bulkFileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleBulkMagicUpload(e.target.files);
              if (e.target) e.target.value = '';
            }}
          />

          {/* Success / Feedback Banner */}
          <AnimatePresence>
            {magicNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-indigo-950/80 border border-emerald-500/40 shadow-xl backdrop-blur-md relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-300">
                        {magicNotice.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {magicNotice.subtitle}
                      </p>

                      {/* Extracted Swatches */}
                      {magicNotice.swatches.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {isAr ? 'الألوان المكتشفة:' : 'Identified Swatches:'}
                          </span>
                          {magicNotice.swatches.map((hex, idx) => (
                            <div
                              key={`${hex}-${idx}`}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-200 shadow-sm"
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="font-bold">{hex}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMagicNotice(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Dropzone Container */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingMagic(true);
            }}
            onDragLeave={() => setIsDraggingMagic(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingMagic(false);
              handleBulkMagicUpload(e.dataTransfer.files);
            }}
            className={`relative rounded-2xl p-4.5 sm:p-5 border-2 border-dashed transition-all duration-200 overflow-hidden ${
              isDraggingMagic
                ? 'border-indigo-400 bg-indigo-950/40 shadow-[0_0_30px_rgba(99,102,241,0.25)] scale-[1.008]'
                : 'border-indigo-500/35 hover:border-indigo-500/60 bg-gradient-to-br from-indigo-950/30 via-slate-950/70 to-purple-950/20 shadow-md'
            }`}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Active Scanning Animation */}
            {isAnalyzingColors ? (
              <div className="py-5 flex flex-col items-center justify-center text-center space-y-3 relative z-10">
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                    <Loader2 className="w-6.5 h-6.5 animate-spin" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -inset-1 rounded-2xl bg-indigo-500/15 blur-sm -z-10"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {isAr ? 'جاري الفرز الذكي وتحليل درجات القماش...' : 'AI Analyzing Colors & Clustering Variants...'}
                  </h4>
                  <p className="text-xs text-indigo-300 font-mono">
                    {analyzingStatus || (isAr ? 'معالجة محلية فورية عبر المتصفح' : 'Instant in-browser Canvas quantization')}
                  </p>
                </div>

                {/* Pulsing Scanline */}
                <div className="w-full max-w-md h-1.5 bg-slate-800 rounded-full overflow-hidden relative mt-2">
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="w-1/2 h-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 rounded-full"
                  />
                </div>

                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {isAr ? 'معالجة مجانية 100% بدون أي تكلفة أو استدعاء خارجي (Zero API Cost)' : '100% Free Client-Side Processing • Zero API Cost'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3.5 text-start">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-600/10 shrink-0">
                    <Wand2 className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        {isAr
                          ? '✨ الرفع والفرز الذكي للألوان (Magic Smart Upload)'
                          : '✨ Magic Smart Upload (AI Color Sorting)'}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        HTML5 Canvas API
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                      {isAr
                        ? 'اسحب وأفلت حزمة صور للمنتج بمختلف ألوانه دفعة واحدة (مثلاً 20 صورة). يتعرف النظام بدقة على أي خلفية (خشب، ورق ملون، استوديو أبيض)، ويميز التيشيرت الأبيض بدقة، ويجمع كل لون كمتغير مستقل مع معرض صوره.'
                        : 'Drag & drop a bulk batch of product images. The engine automatically adapts to any background (wood, colored paper, white studio), accurately detects white t-shirts, and synthesizes variants automatically.'}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {isAr ? 'عزل ذكي لأي خلفية (خشب/ملون/أبيض)' : 'Universal background isolation (wood/color/white)'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {isAr ? 'تمييز دقيق للتيشيرت الأبيض' : 'Accurate white t-shirt detection'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        {isAr ? 'دعم حزم 20+ قميص فورياً' : 'Supports 20+ shirts bulk upload'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => bulkFileInputRef.current?.click()}
                    leftIcon={<UploadCloud className="w-4 h-4" />}
                    className="w-full sm:w-auto shadow-md shadow-indigo-600/30 whitespace-nowrap cursor-pointer"
                  >
                    {isAr ? 'رفع حزمة صور للمنتج' : 'Bulk Upload Photos'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module: Basic Product Information & SKU */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                {isAr ? 'البيانات الأساسية والتصنيف' : 'Basic Info & Category'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              SKU: {formData.sku}
            </span>
          </div>

          {translateNotice && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{translateNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={isAr ? 'اسم المنتج (عربي)' : 'Product Title (Arabic)'}
              placeholder={isAr ? 'مثال: تيشيرت بيما قطن ملكي مطرز' : 'e.g. Royal Embroidered Tee'}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label={isAr ? 'اسم المنتج (إنجليزي)' : 'Product Title (English)'}
              placeholder="e.g. Royal Embroidered Pima Cotton Tee"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              action={
                <button
                  type="button"
                  onClick={() => handleMagicTranslate(formData.name, 'nameEn')}
                  disabled={translatingField === 'nameEn'}
                  title={isAr ? 'ترجمة سحرية من الاسم العربي' : 'Magic Translate from Arabic Title'}
                  className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {translatingField === 'nameEn' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'التصنيف / الفئة' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value="ملابس وأزياء">{isAr ? 'ملابس وأزياء' : 'Apparel'}</option>
                <option value="إلكترونيات">{isAr ? 'إلكترونيات' : 'Electronics'}</option>
                <option value="إكسسوارات">{isAr ? 'إكسسوارات' : 'Accessories'}</option>
                <option value="ملحقات الحاسوب">{isAr ? 'ملحقات الحاسوب' : 'PC Accessories'}</option>
                <option value="المنزل والديكور">{isAr ? 'المنزل والديكور' : 'Home & Living'}</option>
              </select>
            </div>

            <Input
              label={isAr ? 'رمز التخزين التعريفي (SKU)' : 'SKU Identifier'}
              placeholder="TEE-7701"
              required
              dir="ltr"
              className="font-mono text-left tracking-wider"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
        </div>

        {/* Module: Pricing in Iraqi Dinar & Live Promo Preview */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                {isAr ? 'التسعير الأساسي بالدينار العراقي والعروض' : 'Base Pricing & Promo (IQD)'}
              </h3>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              IQD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={
                isAr
                  ? formData.hasVariants
                    ? 'السعر الأساسي المعتمد (IQD) - يمكن تخصيصه لكل لون'
                    : 'السعر الأساسي (IQD)'
                  : formData.hasVariants
                  ? 'Base Regular Price (IQD) - Overridable per variant'
                  : 'Regular Price (IQD)'
              }
              type="text"
              inputMode="numeric"
              dir="ltr"
              className="font-mono text-left tracking-wider font-bold"
              placeholder="45000"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''),
                })
              }
              action={<span className="text-xs font-mono font-bold text-slate-400">IQD</span>}
            />

            <Input
              label={isAr ? 'سعر الخصم / التخفيض (اختياري - IQD)' : 'Sale Price (Optional - IQD)'}
              type="text"
              inputMode="numeric"
              dir="ltr"
              className="font-mono text-left tracking-wider font-bold"
              placeholder="39000"
              value={formData.salePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salePrice: toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''),
                })
              }
              action={<span className="text-xs font-mono font-bold text-slate-400">IQD</span>}
            />
          </div>

          {/* Dynamic Live Discount Box */}
          {hasDiscount && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-950/40 to-emerald-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isAr
                    ? `خصم مباشر مفعل بنسبة %${computedDiscountPercent}`
                    : `Active promo discount of ${computedDiscountPercent}% OFF`}
                </span>
              </div>
              <div className="text-xs font-medium text-emerald-300 flex items-center gap-1.5" dir="ltr">
                <span>{isAr ? 'توفير الزبون: ' : 'Customer Saves: '}</span>
                <strong className="font-mono font-bold text-emerald-400">
                  {formatCurrency(computedSavings, 'IQD', 'en')}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLOR VARIANTS TOGGLE SWITCH & ARCHITECTURE BANNER */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-slate-950/80 border border-indigo-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  formData.hasVariants
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {isAr
                      ? 'تفعيل خيارات الألوان (Color Variants)'
                      : 'Enable Color Variants System'}
                  </h3>
                  {formData.hasVariants && (
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {isAr ? 'مُفعل' : 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'إدارة المنتج تحت موديل واحد مع صور، أسعار، ومخزون ومقاسات منفصلة لكل لون.'
                    : 'Group multiple colors under one product with unique image galleries, stock, sizes, and pricing per color.'}
                </p>
              </div>
            </div>

            {/* Sleek Toggle Switch */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-semibold text-slate-300">
                {formData.hasVariants ? (isAr ? 'مفعل' : 'Enabled') : isAr ? 'معطل' : 'Disabled'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.hasVariants}
                onClick={() => {
                  const nextState = !formData.hasVariants;
                  setFormData((prev) => {
                    // If turning ON and no variants exist yet, seed with 1 default variant based on current product
                    let nextVariants = prev.variants;
                    if (nextState && nextVariants.length === 0) {
                      const baseP = parseFloat(prev.price) || 0;
                      const baseSp = prev.salePrice ? parseFloat(prev.salePrice) : undefined;
                      nextVariants = [
                        {
                          id: `var-${Date.now()}`,
                          colorNameAr: 'أسود ملكي',
                          colorNameEn: 'Royal Black',
                          colorHex: '#0f172a',
                          price: baseP > 0 ? baseP : undefined,
                          salePrice: baseSp,
                          stock: parseInt(prev.stock, 10) || 15,
                          sizes: prev.sizes.length > 0 ? prev.sizes : ['M', 'L', 'XL'],
                          images: prev.images.length > 0 ? [...prev.images] : [],
                        },
                      ];
                    }
                    return {
                      ...prev,
                      hasVariants: nextState,
                      variants: nextVariants,
                    };
                  });
                }}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  formData.hasVariants ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.hasVariants ? (isAr ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CASE A: COLOR VARIANTS BUILDER (WHEN ENABLED) */}
        {/* ======================================================== */}
        {formData.hasVariants ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Variants Control Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                      {isAr ? 'منشئ خيارات الألوان (Variants Builder)' : 'Color Variants Builder'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isAr
                        ? `إجمالي المخزون المحسوب: ${totalVariantsStock} قطعة عبر ${formData.variants.length} ألوان`
                        : `Total Stock across ${formData.variants.length} colors: ${totalVariantsStock} units`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddNewVariant()}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="shadow-sm shadow-indigo-600/30"
                  >
                    {isAr ? 'إضافة لون جديد' : 'Add New Color'}
                  </Button>
                </div>
              </div>

              {/* Quick Preset Palette Badges */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                  {isAr ? 'إضافة لون سريع من التشكيلة الملكية:' : 'Quick Add from Luxury Presets:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {LUXURY_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => handleAddNewVariant(preset)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/80 text-xs text-slate-300 flex items-center gap-2 transition-all cursor-pointer group"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{isAr ? preset.ar : preset.en}</span>
                      <Plus className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of Variant Cards with Framer Motion layout & AnimatePresence */}
            <div className="space-y-3.5">
              <AnimatePresence initial={false}>
                {formData.variants.map((variant, index) => {
                  const isExpanded = expandedVariantIds[variant.id] ?? true;
                  const variantStockNum = Number(variant.stock) || 0;
                  const hasCustomSize = variantShowCustom[variant.id];

                  return (
                    <motion.div
                      key={variant.id}
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md overflow-hidden transition-colors hover:border-slate-700/80 shadow-md"
                    >
                      {/* Variant Card Header (Collapsible & Summary) */}
                      <div
                        onClick={() => toggleVariantExpand(variant.id)}
                        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none bg-slate-950/40 hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* Color Swatch Dot */}
                          <div
                            className="w-8 h-8 rounded-xl border-2 border-slate-700/80 shadow-md flex items-center justify-center relative shrink-0 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: variant.colorHex }}
                          >
                            <span className="text-[10px] font-mono font-bold text-white drop-shadow">
                              #{index + 1}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-white">
                                {variant.colorNameAr || (isAr ? 'لون بدون اسم' : 'Unnamed Color')}
                              </h4>
                              {variant.colorNameEn && (
                                <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                                  ({variant.colorNameEn})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-mono text-slate-400">
                                {variant.colorHex}
                              </span>
                              <span className="text-slate-600">•</span>
                              <span className="text-[11px] text-indigo-400 font-semibold">
                                {variantStockNum} {isAr ? 'قطعة بالمخزن' : 'in stock'}
                              </span>
                              {variant.images && variant.images.length > 0 && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-[11px] text-slate-400">
                                    {variant.images.length} {isAr ? 'صور' : 'photos'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Delete & Chevron */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(variant.id)}
                            title={isAr ? 'حذف هذا اللون' : 'Delete Variant'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleVariantExpand(variant.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-indigo-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Variant Card Expanded Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-800/80 p-4 sm:p-5 space-y-4"
                          >
                            {/* Row 1: Color Names & Hex Color Picker */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                              <Input
                                label={isAr ? 'اسم اللون (عربي)' : 'Color Name (Arabic)'}
                                placeholder={isAr ? 'مثال: أسود، كحلي، زيتي' : 'e.g. Black, Navy'}
                                required
                                value={variant.colorNameAr}
                                onChange={(e) =>
                                  updateVariant(variant.id, { colorNameAr: e.target.value })
                                }
                              />

                              <Input
                                label={isAr ? 'اسم اللون (إنجليزي)' : 'Color Name (English)'}
                                placeholder="e.g. Black, Navy, Olive"
                                value={variant.colorNameEn}
                                onChange={(e) =>
                                  updateVariant(variant.id, { colorNameEn: e.target.value })
                                }
                                action={
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMagicTranslate(
                                        variant.colorNameAr,
                                        `var-${variant.id}`,
                                        true,
                                        variant.id
                                      )
                                    }
                                    disabled={translatingField === `var-${variant.id}`}
                                    title={isAr ? 'ترجمة اسم هذا اللون سحرياً' : 'Magic Translate color name'}
                                    className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {translatingField === `var-${variant.id}` ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                    ) : (
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    )}
                                  </button>
                                }
                              />

                              {/* Native & Hex Color Picker */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                  {isAr ? 'كود اللون (Hex Swatch)' : 'Color Code & Swatch'}
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="relative w-9 h-9.5 shrink-0 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer">
                                    <input
                                      type="color"
                                      value={variant.colorHex}
                                      onChange={(e) =>
                                        updateVariant(variant.id, { colorHex: e.target.value })
                                      }
                                      className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer opacity-100"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    dir="ltr"
                                    placeholder="#000000"
                                    value={variant.colorHex}
                                    onChange={(e) =>
                                      updateVariant(variant.id, { colorHex: e.target.value })
                                    }
                                    className="flex-1 bg-slate-900 border border-slate-800 font-mono text-xs text-white rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                                  />
                                  {variant.images && variant.images.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleAutoDetectVariantColor(variant.id)}
                                      title={
                                        isAr
                                          ? 'استخراج اللون تلقائياً من الصورة الأولى'
                                          : 'Auto-detect color from 1st image'
                                      }
                                      className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-200 transition-colors shrink-0 cursor-pointer"
                                    >
                                      <Wand2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Row 2: Pricing & Stock for this color */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                              <Input
                                label={isAr ? 'السعر لهذا اللون (IQD)' : 'Color Price (IQD)'}
                                type="text"
                                inputMode="numeric"
                                dir="ltr"
                                className="font-mono text-left tracking-wider font-bold"
                                placeholder={
                                  formData.price
                                    ? `${formData.price} (${isAr ? 'الأساسي' : 'base'})`
                                    : '45000'
                                }
                                value={variant.price !== undefined ? variant.price.toString() : ''}
                                onChange={(e) => {
                                  const val = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, '');
                                  updateVariant(variant.id, {
                                    price: val ? parseFloat(val) : undefined,
                                  });
                                }}
                                action={
                                  <span className="text-[11px] font-mono text-slate-400">IQD</span>
                                }
                              />

                              <Input
                                label={isAr ? 'سعر الخصم لهذا اللون (IQD)' : 'Color Sale Price (IQD)'}
                                type="text"
                                inputMode="numeric"
                                dir="ltr"
                                className="font-mono text-left tracking-wider font-bold"
                                placeholder={
                                  formData.salePrice
                                    ? `${formData.salePrice} (${isAr ? 'الأساسي' : 'base'})`
                                    : 'اختياري'
                                }
                                value={
                                  variant.salePrice !== undefined
                                    ? variant.salePrice.toString()
                                    : ''
                                }
                                onChange={(e) => {
                                  const val = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, '');
                                  updateVariant(variant.id, {
                                    salePrice: val ? parseFloat(val) : undefined,
                                  });
                                }}
                                action={
                                  <span className="text-[11px] font-mono text-slate-400">IQD</span>
                                }
                              />

                              <Input
                                label={isAr ? 'المخزون المتاح لهذا اللون' : 'Stock for this color'}
                                type="text"
                                inputMode="numeric"
                                dir="ltr"
                                className="font-mono text-left tracking-wider font-bold"
                                placeholder="15"
                                required
                                value={variant.stock.toString()}
                                onChange={(e) => {
                                  const val = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                                  updateVariant(variant.id, {
                                    stock: val ? parseInt(val, 10) : 0,
                                  });
                                }}
                                action={
                                  <span className="text-[11px] text-slate-400">
                                    {isAr ? 'قطعة' : 'units'}
                                  </span>
                                }
                              />
                            </div>

                            {/* Row 3: Specific Size Matrix for THIS Color */}
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                  <Shirt className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{isAr ? 'المقاسات المتوفرة لهذا اللون فقط:' : 'Available Sizes for this color:'}</span>
                                </label>
                                <span className="text-[11px] text-slate-400">
                                  {variant.sizes.length} {isAr ? 'مقاس محدد' : 'sizes selected'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {standardSizes.map((size) => {
                                  const isCustom = size === 'Custom';
                                  const isSelected = isCustom ? hasCustomSize : variant.sizes.includes(size);

                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => toggleVariantSize(variant.id, size)}
                                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all select-none cursor-pointer flex items-center gap-1 ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                      }`}
                                    >
                                      <span>{size}</span>
                                      {isSelected && !isCustom && (
                                        <span
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeVariantSize(variant.id, size);
                                          }}
                                          className="hover:text-rose-300 text-white/80 ms-0.5"
                                        >
                                          ×
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}

                                {variant.sizes
                                  .filter((s) => !standardSizes.slice(0, 7).includes(s))
                                  .map((custSize) => (
                                    <span
                                      key={custSize}
                                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/40 flex items-center gap-1"
                                    >
                                      <span>{custSize}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeVariantSize(variant.id, custSize)}
                                        className="hover:text-rose-400 text-violet-400 cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                              </div>

                              {hasCustomSize && (
                                <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                                  <input
                                    type="text"
                                    placeholder={
                                      isAr
                                        ? 'مقاس مخصص (مثال: 4XL، 38، 42mm)'
                                        : 'Custom size (e.g. 4XL, 38, 42mm)'
                                    }
                                    value={variantCustomSizeInputs[variant.id] || ''}
                                    onChange={(e) =>
                                      setVariantCustomSizeInputs((prev) => ({
                                        ...prev,
                                        [variant.id]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addVariantCustomSize(variant.id);
                                      }
                                    }}
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => addVariantCustomSize(variant.id)}
                                  >
                                    {isAr ? 'إضافة' : 'Add'}
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Row 4: Dedicated Image Uploader for THIS Variant */}
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>
                                    {isAr
                                      ? `معرض صور هذا اللون (${variant.colorNameAr}):`
                                      : `Media gallery for ${variant.colorNameEn || 'this color'}:`}
                                  </span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {variant.images.length}/6 {isAr ? 'صور' : 'photos'}
                                </span>
                              </div>

                              <ImageUploader
                                images={variant.images}
                                onChange={(imgs) => updateVariant(variant.id, { images: imgs })}
                                maxFiles={8}
                                onRawFiles={(files) => handleVariantImageDrop(variant.id, files)}
                                enableAutoColorSort={true}
                                dropzoneTitle={
                                  isAr ? (
                                    <>
                                      اسحب القمصان هنا أو <span className="text-indigo-400 underline">استعرض الملفات</span>
                                    </>
                                  ) : (
                                    <>
                                      Drop shirts here or <span className="text-indigo-400 underline">browse files</span>
                                    </>
                                  )
                                }
                                dropzoneSubtitle={
                                  isAr
                                    ? '✨ قراءة ذكية لدرجات القماش: يحتفظ بصور هذا اللون هنا، ويقسم باقي الألوان في كروت منفصلة تلقائياً!'
                                    : '✨ Auto-reads fabric colors: retains matching shirts here, and auto-generates cards for other colors!'
                                }
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CASE B: STANDARD SINGLE-PRODUCT (NO VARIANTS) */
          /* ======================================================== */
          <>
            {/* Base Image Uploader */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                    {isAr ? 'صور المنتج ومعرض الوسائط' : 'Product Media & Gallery'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {formData.images.length}/12 {isAr ? 'صور' : 'photos'}
                </span>
              </div>

              <ImageUploader
                images={formData.images}
                onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                maxFiles={12}
                onRawFiles={handleBaseImageDrop}
                enableAutoColorSort={true}
                dropzoneTitle={
                  isAr ? (
                    <>
                      اسحب كل القمصان أو المنتجات هنا ليتم قراءتها وتقسيمها، أو <span className="text-indigo-400 underline">استعرض الملفات</span>
                    </>
                  ) : (
                    <>
                      Drop all shirts or products here to auto-read and split, or <span className="text-indigo-400 underline">browse files</span>
                    </>
                  )
                }
                dropzoneSubtitle={
                  isAr
                    ? '✨ الذكاء اللوني الفوري: ضع كل القمصان دفعة واحدة وسيقرأ ألوانها ويقسمها تلقائياً حسب اللون مع المخزون والأسعار بدون أي نقرة!'
                    : '✨ Color AI: Drop all shirts at once to auto-read fabric colors and split into variants with stock & pricing with zero clicks!'
                }
              />
            </div>

            {/* Base Inventory & Stock */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Box className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                  {isAr ? 'المخزون وحالة التوفر والنشر' : 'Stock & Availability Status'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label={isAr ? 'كمية المخزون المتاحة' : 'Available Stock'}
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  className="font-mono text-left tracking-wider font-bold"
                  placeholder="15"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: toEnglishDigits(e.target.value).replace(/[^0-9]/g, ''),
                    })
                  }
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'حالة التوفر (Availability)' : 'Availability Status'}
                  </label>
                  <select
                    value={formData.availabilityStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, availabilityStatus: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="in_stock">{isAr ? 'متوفر بالمخزن (In Stock)' : 'In Stock'}</option>
                    <option value="limited">{isAr ? 'كمية محدودة (Limited)' : 'Limited Stock'}</option>
                    <option value="coming_soon">{isAr ? 'قريباً (Coming Soon)' : 'Coming Soon'}</option>
                    <option value="sold_out">{isAr ? 'نفد بالكامل (Sold Out)' : 'Sold Out'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'حالة النشر بالمتجر' : 'Publishing Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="active">{isAr ? 'نشط ومعروض' : 'Active / Published'}</option>
                    <option value="draft">{isAr ? 'مسودة غير منشورة' : 'Draft'}</option>
                    <option value="lowStock">{isAr ? 'مخزون منخفض' : 'Low Stock'}</option>
                    <option value="outOfStock">{isAr ? 'نفد من المخزون' : 'Out of Stock'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Base Sizes Matrix */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                    {isAr ? 'المقاسات والأحجام المتاحة' : 'Available Sizes Matrix'}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {formData.sizes.length} {isAr ? 'مقاسات مختارة' : 'sizes selected'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {standardSizes.map((size) => {
                  const isCustom = size === 'Custom';
                  const isSelected = isCustom ? showCustomInput : formData.sizes.includes(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 select-none cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <span>{size}</span>
                      {isSelected && !isCustom && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSize(size);
                          }}
                          className="hover:text-rose-300 text-white/80 ms-0.5"
                        >
                          ×
                        </span>
                      )}
                    </button>
                  );
                })}

                {formData.sizes
                  .filter((s) => !standardSizes.slice(0, 6).includes(s))
                  .map((custSize) => (
                    <span
                      key={custSize}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/40 flex items-center gap-1.5"
                    >
                      <span>{custSize}</span>
                      <button
                        type="button"
                        onClick={() => removeSize(custSize)}
                        className="hover:text-rose-400 text-violet-400 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>

              {showCustomInput && (
                <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                  <input
                    type="text"
                    placeholder={
                      isAr
                        ? 'أدخل مقاساً مخصصاً (مثال: 49mm، 15.6 بوصة، 42)'
                        : 'e.g. 49mm, 15.6 inch, 42'
                    }
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={addCustomSize}>
                    {isAr ? 'إضافة' : 'Add'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Module: Publishing & Availability status for variants products */}
        {formData.hasVariants && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Box className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                  {isAr ? 'حالة النشر والتوفر الإجمالية' : 'Overall Publishing & Availability Status'}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {totalVariantsStock} {isAr ? 'قطعة إجمالية' : 'Total Stock'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'حالة التوفر' : 'Availability Status'}
                </label>
                <select
                  value={formData.availabilityStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, availabilityStatus: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  <option value="in_stock">{isAr ? 'متوفر بالمخزن (In Stock)' : 'In Stock'}</option>
                  <option value="limited">{isAr ? 'كمية محدودة (Limited)' : 'Limited Stock'}</option>
                  <option value="coming_soon">{isAr ? 'قريباً (Coming Soon)' : 'Coming Soon'}</option>
                  <option value="sold_out">{isAr ? 'نفد بالكامل (Sold Out)' : 'Sold Out'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'حالة النشر بالمتجر' : 'Publishing Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  <option value="active">{isAr ? 'نشط ومعروض' : 'Active / Published'}</option>
                  <option value="draft">{isAr ? 'مسودة غير منشورة' : 'Draft'}</option>
                  <option value="lowStock">{isAr ? 'مخزون منخفض' : 'Low Stock'}</option>
                  <option value="outOfStock">{isAr ? 'نفد من المخزون' : 'Out of Stock'}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Module: Materials & Bilingual Descriptions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200">
              {isAr ? 'الخامات وتفاصيل الوصف' : 'Materials & Descriptions'}
            </h3>
          </div>

          <Input
            label={isAr ? 'الخامات وتفاصيل القماش / المواد (Material Details)' : 'Material & Fabric Specs'}
            placeholder={
              isAr
                ? 'مثال: قطن بيما بيروفي 100%، خياطة يدوية مزدوجة، مقاوم للانكماش'
                : 'e.g. 100% Peruvian Pima Cotton, Bespoke Double Stitch, Anti-Shrink'
            }
            value={formData.materialDetails}
            onChange={(e) => setFormData({ ...formData, materialDetails: e.target.value })}
            action={
              <button
                type="button"
                onClick={() => handleMagicTranslate(formData.materialDetails, 'materialDetails')}
                disabled={translatingField === 'materialDetails'}
                title={isAr ? 'ترجمة وتنسيق الخامات تلقائياً' : 'Translate specs into English'}
                className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {translatingField === 'materialDetails' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            }
          />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'وصف المنتج التفصيلي (باللغة العربية)' : 'Detailed Description (Arabic)'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  isAr
                    ? 'اكتب وصفاً تسويقياً شاملاً للمنتج ومزاياه واستخداماته وخيارات ألوانه...'
                    : 'Enter Arabic product description...'
                }
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'وصف المنتج التفصيلي (باللغة الإنجليزية)' : 'Detailed Description (English)'}
                </label>
                <button
                  type="button"
                  onClick={() => handleMagicTranslate(formData.descriptionAr, 'descriptionEn')}
                  disabled={translatingField === 'descriptionEn'}
                  title={isAr ? 'ترجمة الوصف تلقائياً من العربية' : 'Translate description from Arabic'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {translatingField === 'descriptionEn' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isAr ? 'ترجمة سحرية (Magic Translate)' : 'Magic Translate'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Enter comprehensive English product copy, features, color stories, and specs..."
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </form>
    </Sheet>
  );
};

export default ProductFormSheet;
