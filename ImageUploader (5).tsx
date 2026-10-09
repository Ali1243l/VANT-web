import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Star,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { uploadImageToSupabase, uploadDataUrlToSupabase, fileToOptimizedDataUrl } from '../../lib/storage';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  onRawFiles?: (files: File[]) => void | Promise<void>;
  enableAutoColorSort?: boolean;
  dropzoneTitle?: React.ReactNode;
  dropzoneSubtitle?: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxFiles = 8,
  onRawFiles,
  enableAutoColorSort = false,
  dropzoneTitle,
  dropzoneSubtitle,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample thumbnails for quick insertion
  const sampleSuggestions = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
  ];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadNotice(null);

    // If custom onRawFiles handler is provided (e.g. automatic color clustering & variant generation)
    if (onRawFiles) {
      try {
        await onRawFiles(fileArray);
      } catch (err) {
        console.error('Error handling raw files in ImageUploader:', err);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      return;
    }

    const newUrls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const uploadedUrl = await uploadImageToSupabase(file, 'catalog');
        if (uploadedUrl && (uploadedUrl.startsWith('http://') || uploadedUrl.startsWith('https://'))) {
          newUrls.push(uploadedUrl);
        } else if (uploadedUrl && uploadedUrl.startsWith('data:')) {
          const permUrl = await uploadDataUrlToSupabase(uploadedUrl, 'catalog', 'shirt');
          newUrls.push(permUrl);
        } else {
          const fallbackDataUrl = await fileToOptimizedDataUrl(file);
          newUrls.push(fallbackDataUrl);
        }
      } catch (err) {
        console.warn('Error uploading image file, falling back to data URL:', err);
        try {
          const fallbackDataUrl = await fileToOptimizedDataUrl(file);
          newUrls.push(fallbackDataUrl);
        } catch {
          newUrls.push(URL.createObjectURL(file));
        }
      }
    }

    if (newUrls.length > 0) {
      const combined = [...images, ...newUrls].slice(0, maxFiles);
      onChange(combined);
      setUploadNotice(`✓ تم رفع وتخزين ${newUrls.length} صور في السحابة بنجاح`);
      setTimeout(() => setUploadNotice(null), 3500);
    }

    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([target, ...filtered]);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-200">
          صور المنتج والوسائط (Cloud Storage & Gallery)
        </label>
        <span className="text-[11px] text-slate-400 font-mono">
          {images.length} / {maxFiles} صور
        </span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 overflow-hidden ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/15 scale-[1.01] shadow-lg shadow-indigo-500/20'
            : enableAutoColorSort
            ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 via-slate-900/60 to-slate-900/40 hover:border-indigo-400/80 hover:bg-slate-900/70'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xs text-indigo-300 font-bold">
              جاري فحص القمصان، قراءة درجات القماش، وتقسيم الألوان تلقائياً...
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Client-Side Canvas Processing • Zero Clicks Needed
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
                {enableAutoColorSort ? (
                  <Wand2 className="w-5 h-5 text-indigo-300" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              {enableAutoColorSort && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  قراءة وفرز تلقائي حسب اللون
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-200">
                {dropzoneTitle || (
                  <>
                    اسحب القمصان والصور هنا، أو <span className="text-indigo-400 underline">استعرض الملفات</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {dropzoneSubtitle ||
                  'يقوم النظام فورياً بقراءة درجات الألوان وتوزيع الصور وتوليد الخيارات تلقائياً بدون الحاجة لإضافة لون يدوي.'}
              </p>
            </div>
          </>
        )}
      </div>

      {uploadNotice && (
        <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Uploaded Gallery Grid with Reordering & Badges */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((url, index) => {
            const isPrimary = index === 0;

            return (
              <div
                key={index}
                className={`relative aspect-square rounded-xl overflow-hidden border group bg-slate-900 ${
                  isPrimary
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <img
                  src={url}
                  alt={`Product thumb ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary Badge */}
                {isPrimary && (
                  <div className="absolute top-1.5 start-1.5 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>رئيسية</span>
                  </div>
                )}

                {/* Hover Action Controls */}
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                  <div className="flex items-center justify-between">
                    {!isPrimary ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsPrimary(index);
                        }}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 text-[10px] flex items-center gap-1"
                        title="تعيين كصورة رئيسية"
                      >
                        <Star className="w-3 h-3" />
                        <span>رئيسية</span>
                      </button>
                    ) : <span />}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="p-1 rounded bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                      title="حذف الصورة"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Reorder Arrows */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, 'left');
                      }}
                      className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                      title="تحريك لليسار"
                    >
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, 'right');
                      }}
                      className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                      title="تحريك لليمين"
                    >
                      <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preset sample suggestions */}
      <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
        <span className="text-[10px] text-slate-400 shrink-0">
          عينات سريعة:
        </span>
        {sampleSuggestions.map((thumb, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (images.length < maxFiles) {
                onChange([...images, thumb]);
              }
            }}
            className="w-7 h-7 rounded-lg border border-slate-700 overflow-hidden shrink-0 hover:scale-105 transition-transform"
            title="إضافة عينة سريعة"
          >
            <img src={thumb} alt="sample" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
export default ImageUploader;
