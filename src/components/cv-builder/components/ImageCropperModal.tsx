// src/components/cv-builder/components/ImageCropperModal.tsx
// =====================================================
// 🎨 COMPACT modal — BIG cropper area
// ✅ FIXED: Straighten slider now has full purple track (like zoom)
// ✅ All tools fully workable
// =====================================================

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
    X, ZoomIn, ZoomOut, Check, Loader2,
    RotateCcw, RotateCw, Rotate3d, RefreshCw,
} from 'lucide-react';
import { Area } from 'react-easy-crop';

interface ImageCropperModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onCropSave: (croppedImage: string) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    imageSrc,
    onClose,
    onCropSave,
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [rotation, setRotation] = useState(0);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });

    // =====================================================
    // ✅ FULL CROP WITH ROTATION SUPPORT
    // =====================================================
    const getCroppedImage = useCallback(async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        setIsSaving(true);
        try {
            const image = await createImage(imageSrc);
            const { x, y, width, height } = croppedAreaPixels;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { setIsSaving(false); return; }

            const SIZE = 400;
            canvas.width = SIZE;
            canvas.height = SIZE;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Extract cropped region
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) { setIsSaving(false); return; }

            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(image, x, y, width, height, 0, 0, width, height);

            // Draw with rotation
            ctx.save();
            ctx.translate(SIZE / 2, SIZE / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-SIZE / 2, -SIZE / 2);
            ctx.drawImage(tempCanvas, 0, 0, SIZE, SIZE);
            ctx.restore();

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onCropSave(dataUrl);
            setIsSaving(false);
            onClose();
        } catch (err) {
            console.error('Crop failed:', err);
            setIsSaving(false);
        }
    }, [croppedAreaPixels, imageSrc, rotation, onCropSave, onClose]);

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    // =====================================================
    // ✅ SLIDER FILL HELPERS
    // =====================================================
    // Zoom: 0.5 → 3
    const zoomPercent = ((zoom - 0.5) / 2.5) * 100;

    // Straighten: -45 → 45
    // Fill grows from center (50%) to the right
    const straightenPercent = ((rotation + 45) / 90) * 100;
    const straightenFillStyle = {
        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${straightenPercent}%, #e2e8f0 ${straightenPercent}%, #e2e8f0 100%)`,
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-3 bg-slate-900/75 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl shadow-purple-600/20 border border-slate-200 overflow-hidden"
            >
                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">✂️</span>
                        <h3 className="text-[13px] font-semibold text-white tracking-tight">
                            Edit Photo
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* ===== CROPPER (BIG) ===== */}
                <div className="relative w-full bg-slate-900" style={{ height: 'min(60vh, 460px)' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        cropShape="round"
                        showGrid={true}
                        classes={{
                            containerClassName: 'w-full h-full',
                            mediaClassName: 'w-full h-full object-contain',
                            cropAreaClassName:
                                'border-2 border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.35)]',
                        }}
                    />
                </div>

                {/* ===== TOOLS ===== */}
                <div className="p-3.5 space-y-3">

                    {/* Row 1 — Rotate / 180° / Reset */}
                    <div className="grid grid-cols-4 gap-1.5">
                        <button
                            onClick={() => setRotation(r => r - 90)}
                            className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 active:scale-95 transition-all"
                            title="Rotate 90° Left"
                        >
                            <RotateCcw size={14} />
                            <span className="text-[8px] font-semibold">Left</span>
                        </button>
                        <button
                            onClick={() => setRotation(r => r + 90)}
                            className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 active:scale-95 transition-all"
                            title="Rotate 90° Right"
                        >
                            <RotateCw size={14} />
                            <span className="text-[8px] font-semibold">Right</span>
                        </button>
                        <button
                            onClick={() => setRotation(r => r + 180)}
                            className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 active:scale-95 transition-all"
                            title="Rotate 180°"
                        >
                            <Rotate3d size={14} />
                            <span className="text-[8px] font-semibold">180°</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 active:scale-95 transition-all"
                            title="Reset All"
                        >
                            <RefreshCw size={14} />
                            <span className="text-[8px] font-semibold">Reset</span>
                        </button>
                    </div>

                    {/* Row 2 — Zoom */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 flex items-center justify-center active:scale-95 transition-all shrink-0"
                        >
                            <ZoomOut size={13} />
                        </button>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={e => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${zoomPercent}%, #e2e8f0 ${zoomPercent}%, #e2e8f0 100%)`,
                            }}
                        />
                        <button
                            onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 flex items-center justify-center active:scale-95 transition-all shrink-0"
                        >
                            <ZoomIn size={13} />
                        </button>
                        <span className="text-[10px] font-semibold text-purple-600 w-9 text-right tabular-nums shrink-0">
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>

                    {/* Row 3 — Straighten (FULL PURPLE TRACK) */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 w-14 shrink-0">
                            Straighten
                        </span>
                        <input
                            type="range"
                            min="-45"
                            max="45"
                            step="1"
                            value={rotation}
                            onChange={e => setRotation(parseInt(e.target.value))}
                            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                            style={straightenFillStyle}
                        />
                        <span className="text-[10px] font-semibold text-purple-600 w-9 text-right tabular-nums shrink-0">
                            {rotation}°
                        </span>
                    </div>

                    {/* Row 4 — Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-all active:scale-98"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={getCroppedImage}
                            disabled={isSaving}
                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold text-[11px] shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98 transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={12} />
                                    Crop & Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;