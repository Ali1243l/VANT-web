import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderPlus,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Star,
  MoveLeft,
  MoveRight,
  Link,
  Loader2,
  AlertCircle,
  FileImage,
  FolderTree,
} from 'lucide-react';
import {
  uploadImageToSupabase,
  getFilesFromDataTransfer,
  isImageFile,
  fileToOptimizedDataUrl,
} from '../lib/storage';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  primaryImage?: string;
  onPrimaryChange?: (primary: string) => void;
  isAr?: boolean;
  recommendedSpec?: string;
  allowMultiple?: boolean;
}

export default function ImageUploader({
  images = [],
  onChange,
  primaryImage,
  onPrimaryChange,
  isAr = true,
  recommendedSpec = '1200 × 1500 px (4:5)',
  allowMultiple = true,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [lastUploadedFolderName, setLastUploadedFolderName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Clean valid image strings list (strictly removes empty or invalid strings)
  const validImagesList = (images || []).filter((img) => typeof img === 'string' && img.trim().length > 0);

  const processFilesWithMetadata = async (
    filesWithMeta: Array<{ file: File; relativePath?: string }>
  ) => {
    const validItems = filesWithMeta.filter((item) => isImageFile(item.file));

    if (validItems.length === 0) {
      setErrorMessage(
        isAr
          ? 'لم يتم العثور على صور صالحة داخل المجلد أو الملفات المحددة.'
          : 'No valid images found in selected folder or files.'
      );
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    // Naturally sort items by path / filename
    validItems.sort((a, b) => {
      const nameA = a.relativePath || a.file.name;
      const nameB = b.relativePath || b.file.name;
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Detect if this was a folder upload
    const rootDir = validItems[0]?.relativePath?.includes('/')
      ? validItems[0].relativePath.split('/')[0]
      : null;
    if (rootDir) {
      setLastUploadedFolderName(rootDir);
    }

    // 1. Convert all files into instant crisp Data URLs
    const instantDataUrls: string[] = [];
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      setUploadProgress(
        isAr
          ? `جارِ معالجة وترتيب الصورة ${i + 1} من ${validItems.length} (${item.relativePath || item.file.name})...`
          : `Processing image ${i + 1} of ${validItems.length}...`
      );
      try {
        const dUrl = await fileToOptimizedDataUrl(item.file);
        if (dUrl) instantDataUrls.push(dUrl);
      } catch (err) {
        console.warn('Failed to process image:', item.file.name, err);
      }
    }

    if (instantDataUrls.length === 0) {
      setIsUploading(false);
      setUploadProgress(null);
      setErrorMessage(isAr ? 'فشلت معالجة الصور المختارة.' : 'Failed to process images.');
      return;
    }

    // Immediately update UI with crisp previews
    let currentImages = allowMultiple ? [...validImagesList, ...instantDataUrls] : [instantDataUrls[0]];
    onChange(currentImages);

    if (onPrimaryChange && (!primaryImage || !validImagesList.includes(primaryImage))) {
      onPrimaryChange(currentImages[0]);
    }

    // 2. Upload to Supabase Storage with clean folder paths
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      setUploadProgress(
        isAr
          ? `جارِ المزامنة السحابية للمجلد (${i + 1}/${validItems.length})...`
          : `Syncing folder items (${i + 1}/${validItems.length}) to cloud...`
      );

      try {
        const uploadedUrl = await uploadImageToSupabase(item.file, 'catalog', item.relativePath);
        if (uploadedUrl && uploadedUrl.startsWith('http')) {
          const localDUrl = instantDataUrls[i];
          currentImages = currentImages.map((img) => (img === localDUrl ? uploadedUrl : img));
          onChange(currentImages);
          if (onPrimaryChange && primaryImage === localDUrl) {
            onPrimaryChange(uploadedUrl);
          }
        }
      } catch (err) {
        console.warn('Cloud storage sync skipped, keeping high-res image data:', err);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    const withMeta = rawFiles.map((file) => ({
      file,
      relativePath: (file as any).webkitRelativePath || file.name,
    }));
    await processFilesWithMetadata(withMeta);
  };

  // Drag and Drop handling (supports folders recursively!)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsUploading(true);
      setUploadProgress(isAr ? 'جارِ فحص الملفات والمجلدات المسحوبة...' : 'Scanning dropped files and folders...');
      try {
        const extractedItems = await getFilesFromDataTransfer(e.dataTransfer.items);
        if (extractedItems.length > 0) {
          await processFilesWithMetadata(extractedItems);
        } else {
          setErrorMessage(isAr ? 'لم يتم العثور على أي صور داخل المجلد أو الملفات المسحوبة.' : 'No images found in dropped folder.');
          setIsUploading(false);
        }
      } catch (err) {
        setErrorMessage(isAr ? 'حدث خطأ أثناء قراءة المجلد المسحوب.' : 'Failed to parse dropped folder.');
        setIsUploading(false);
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  // Add manual URL
  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    const clean = manualUrl.trim();

    if (allowMultiple) {
      const nextImages = [...validImagesList, clean];
      onChange(nextImages);
      if (onPrimaryChange && (!primaryImage || !validImagesList.includes(primaryImage))) {
        onPrimaryChange(nextImages[0]);
      }
    } else {
      onChange([clean]);
      if (onPrimaryChange) {
        onPrimaryChange(clean);
      }
    }
    setManualUrl('');
  };

  // Remove image
  const handleRemoveImage = (indexToRemove: number) => {
    const targetUrl = validImagesList[indexToRemove];
    const nextImages = validImagesList.filter((_, idx) => idx !== indexToRemove);
    onChange(nextImages);

    if (onPrimaryChange && primaryImage === targetUrl) {
      onPrimaryChange(nextImages[0] || '');
    }
  };

  // Move image position
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= validImagesList.length) return;
    const reordered = [...validImagesList];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    onChange(reordered);
  };

  // Set as primary
  const handleSetPrimary = (url: string) => {
    if (onPrimaryChange) {
      onPrimaryChange(url);
    }
    const filtered = validImagesList.filter((img) => img !== url);
    onChange([url, ...filtered]);
  };

  return (
    <div className="space-y-3">
      {/* Sizing Specification Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white/90">
            {isAr ? 'إدارة ورفع صور القطعة' : 'Manage & Upload Images'}
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-mono text-emerald-300">
            {validImagesList.length} {isAr ? 'صور مضافة' : 'Images'}
          </span>
        </div>

        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
          {isAr ? `المقاس الموصى به: ${recommendedSpec}` : `Recommended: ${recommendedSpec}`}
        </span>
      </div>

      {/* Mode Switcher (File/Folder Upload vs Direct URL) */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeMode === 'upload' ? 'bg-[#004ad7] text-white shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>{isAr ? 'رفع ملفات أو مجلد كامل (Folders)' : 'Upload Files / Folders'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeMode === 'url' ? 'bg-[#004ad7] text-white shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          <Link className="h-3.5 w-3.5" />
          <span>{isAr ? 'إدخال رابط مباشر' : 'Paste Direct URL'}</span>
        </button>
      </div>

      {/* MODE 1: DRAG & DROP / FILE / FOLDER UPLOAD ZONE */}
      {activeMode === 'upload' && (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                : 'border-white/20 bg-black/30 hover:border-white/35 hover:bg-black/40'
            }`}
          >
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple={allowMultiple}
              accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.heic,.heif,.bmp,.svg"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            {/* Hidden native folder input */}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory=""
              // @ts-ignore
              directory=""
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            {isUploading ? (
              <div className="py-4 flex flex-col items-center justify-center gap-2.5 text-[#3b82f6]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <span className="text-xs font-semibold text-white">{uploadProgress || 'جارِ معالجة وترتيب المجلد...'}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 text-white/80">
                  <FolderTree className="h-6 w-6 text-emerald-400" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isAr
                      ? 'اسحب مجلد الصور الكامل أو عدة ملفات وأسقطها هنا'
                      : 'Drag & Drop an entire Image Folder or multiple files here'}
                  </h4>
                  <p className="text-[11px] text-white/50 mt-1 max-w-md mx-auto">
                    {isAr
                      ? 'يتم استخراج كافة الصور وترتيبها تلقائياً بالاسم وحفظ مساراتها المنظمة في السحابة بدون أي صور وهمية'
                      : 'Automatically extracts, organizes and persists folder structures to Supabase'}
                  </p>
                </div>

                {/* Upload Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>{isAr ? 'اختيار صور مفردة' : 'Choose Images'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.08] hover:bg-white/15 px-3.5 py-2 text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isAr ? 'رفع مجلد كامل (Upload Folder)' : 'Upload Entire Folder'}</span>
                  </button>
                </div>

                {lastUploadedFolderName && (
                  <div className="pt-1 text-[11px] text-emerald-400 font-mono">
                    ✓ {isAr ? `تمت معالجة المجلد: ${lastUploadedFolderName}` : `Processed folder: ${lastUploadedFolderName}`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: DIRECT MANUAL URL INPUT */}
      {activeMode === 'url' && (
        <form onSubmit={handleAddManualUrl} className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="h-10 flex-1 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#004ad7] hover:bg-[#3b82f6] px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
          >
            {isAr ? 'إضافة الرابط' : 'Add URL'}
          </button>
        </form>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* VISUAL THUMBNAILS GALLERY & REORDERING */}
      {validImagesList.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-semibold text-white/60 block">
            {isAr ? 'الصور المرفوعة للقطعة (انقر على النجمة لتعيينها كصورة رئيسية):' : 'Uploaded Images (Click star to set as Primary):'}
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {validImagesList.map((imgUrl, idx) => {
              const isPrimary = (primaryImage ? primaryImage === imgUrl : idx === 0);

              return (
                <div
                  key={`${imgUrl.slice(0, 30)}-${idx}`}
                  className={`group relative aspect-[4/5] rounded-xl overflow-hidden border transition-all ${
                    isPrimary
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'border-white/15 bg-black/40 hover:border-white/30'
                  }`}
                >
                  {/* Image Preview with foolproof direct display */}
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Primary Badge or Selector */}
                  <div className="absolute top-1.5 ltr:left-1.5 rtl:right-1.5 z-10">
                    {isPrimary ? (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{isAr ? 'الرئيسية' : 'Primary'}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(imgUrl)}
                        title={isAr ? 'تعيين كصورة رئيسية' : 'Set as primary'}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-white/80 hover:text-amber-300 hover:bg-black transition-all cursor-pointer shadow-sm"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Top Right: Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title={isAr ? 'حذف الصورة' : 'Remove Image'}
                    className="absolute top-1.5 ltr:right-1.5 rtl:left-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-red-500/80 text-white hover:bg-red-500 transition-all cursor-pointer shadow-md"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  {/* Bottom: Reorder Arrows & Index */}
                  <div className="absolute bottom-1.5 inset-x-1.5 z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-white/90 bg-black/60 px-1.5 py-0.2 rounded border border-white/10">
                      #{idx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, idx - 1)}
                          title={isAr ? 'تحريك للأمام' : 'Move Forward'}
                          className="flex h-5 w-5 items-center justify-center rounded bg-black/70 text-white hover:bg-black transition-all cursor-pointer border border-white/10"
                        >
                          <MoveRight className="h-3 w-3 rtl:rotate-180" />
                        </button>
                      )}
                      {idx < validImagesList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, idx + 1)}
                          title={isAr ? 'تحريك للخلف' : 'Move Backward'}
                          className="flex h-5 w-5 items-center justify-center rounded bg-black/70 text-white hover:bg-black transition-all cursor-pointer border border-white/10"
                        >
                          <MoveLeft className="h-3 w-3 rtl:rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
