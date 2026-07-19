import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check, Loader2 } from 'lucide-react';
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
    onCropSave
}) => {
    // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURN
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [rotation, setRotation] = useState(0);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        // ✅ croppedAreaPixels is ALREADY in PIXELS - use directly
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // ✅ Load image properly
    const createImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => {
                console.log('✅ Image loaded:', image.naturalWidth, 'x', image.naturalHeight);
                resolve(image);
            };
            image.onerror = (error) => {
                console.error('❌ Image load error:', error);
                reject(error);
            };
            image.src = url;
        });
    };

    const getCroppedImage = useCallback(async () => {
        if (!croppedAreaPixels || !imageSrc) return;

        setIsSaving(true);

        try {
            // ✅ Load the image
            const image = await createImage(imageSrc);
            
            // ✅ Get actual image dimensions
            const imageWidth = image.naturalWidth || image.width;
            const imageHeight = image.naturalHeight || image.height;

            // ✅ croppedAreaPixels is ALREADY in PIXELS - use directly
            const cropX = croppedAreaPixels.x;
            const cropY = croppedAreaPixels.y;
            const cropWidth = croppedAreaPixels.width;
            const cropHeight = croppedAreaPixels.height;

            // ✅ Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                setIsSaving(false);
                return;
            }

            // ✅ Set canvas size (output size)
            const outputSize = 400;
            canvas.width = outputSize;
            canvas.height = outputSize;

            // ✅ Clear canvas
            ctx.clearRect(0, 0, outputSize, outputSize);
            
            // ✅ Enable high quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // ✅ Draw cropped image using DIRECT pixel values
            ctx.drawImage(
                image,
                cropX,          // x position in source image (pixels)
                cropY,          // y position in source image (pixels)
                cropWidth,      // width to crop from source image (pixels)
                cropHeight,     // height to crop from source image (pixels)
                0,              // x position on canvas
                0,              // y position on canvas
                outputSize,     // width on canvas
                outputSize      // height on canvas
            );

            // ✅ Convert to PNG
            const croppedDataUrl = canvas.toDataURL('image/png');
            
            // ✅ Save the cropped image
            onCropSave(croppedDataUrl);
            setIsSaving(false);
            onClose();
        } catch (error) {
            console.error('❌ Error cropping image:', error);
            setIsSaving(false);
        }
    }, [croppedAreaPixels, imageSrc, onCropSave, onClose]);

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(parseFloat(e.target.value));
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    };

    // ✅ EARLY RETURN AFTER ALL HOOKS ARE CALLED
    if (!isOpen || !imageSrc) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-sm">✂️</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                            Crop Profile Photo
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center justify-center text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Instructions */}
                <div className="px-4 sm:px-5 pt-3 pb-1">
                    <p className="text-xs text-gray-400">
                        Drag to reposition • Scroll to zoom • 1:1 square crop
                    </p>
                </div>

                {/* Cropper */}
                <div className="relative w-full aspect-square max-h-[60vh] bg-gray-800/50">
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
                            cropAreaClassName: 'border-2 border-purple-500/80 shadow-[0_0_40px_rgba(168,85,247,0.3)]',
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 sm:p-5 border-t border-gray-700/50 space-y-4">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleZoomOut}
                            className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors flex items-center justify-center text-gray-300 hover:text-white"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={handleZoomChange}
                            className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                            style={{
                                background: `linear-gradient(to right, #a855f7 ${((zoom - 0.5) / 2.5) * 100}%, #374151 ${((zoom - 0.5) / 2.5) * 100}%)`
                            }}
                        />
                        <button
                            onClick={handleZoomIn}
                            className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors flex items-center justify-center text-gray-300 hover:text-white"
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={getCroppedImage}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
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