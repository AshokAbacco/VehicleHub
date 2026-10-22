// VehicleHub/VehicleHub/src/components/field-inspector/StepPhotos.jsx
// Photo evidence for one verification step (InspectionVerify.jsx).
//  - Take Picture: phones/tablets open the camera app; desktops open the webcam in a small
//    camera window (falls back to choosing a file when no camera is available).
//  - Upload Photo: choose one or more existing photos.
// Photos are uploaded straight away (the backend stores them in Cloudflare R2) and tagged with
// the step, so they are still there when the inspector comes back to the step.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import {
    Camera, Upload, Loader2, X, Trash2, RefreshCw, ChevronLeft, ChevronRight, ImageIcon, CheckCircle2, AlertCircle,
} from 'lucide-react';
import {
    useUploadInspectionPhotosMutation,
    useReplaceInspectionPhotoMutation,
    useDeleteInspectionPhotoMutation,
} from '../../services/fieldInspectorApiSlice.js';
import { photosForStep } from '../../utils/inspectionPhotos.js';

const MAX_BATCH = 20; // backend accepts up to 20 files per request
const MAX_EDGE = 1920; // photos are resized before upload — faster on mobile data

const isTouchDevice = () =>
    typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 1);

// Resize big camera photos to a JPEG (max 1920px). Keeps the original if anything fails
// (e.g. HEIC the browser can't decode) or if resizing doesn't make it smaller.
const shrinkImage = async (file) => {
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return file;
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
        if (scale === 1 && file.size < 1.5 * 1024 * 1024) { bitmap.close?.(); return file; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close?.();
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    } catch {
        return file;
    }
};

const errorText = (err, fallback) =>
    err?.status === 'FETCH_ERROR' ? "Can't reach the server. Check your connection and try again." : err?.data?.message || fallback;

// ---- Webcam window for desktops/laptops ----
const CameraModal = ({ onCapture, onClose, onUnavailable, busy, caption }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [ready, setReady] = useState(false);
    const unavailableRef = useRef(onUnavailable);
    useEffect(() => { unavailableRef.current = onUnavailable; });

    useEffect(() => {
        let cancelled = false;
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
            .then((stream) => {
                if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => { });
                }
            })
            .catch(() => { if (!cancelled) unavailableRef.current(); });
        return () => {
            cancelled = true;
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const snap = () => {
        const v = videoRef.current;
        if (!v?.videoWidth) return;
        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        canvas.getContext('2d').drawImage(v, 0, 0);
        canvas.toBlob((blob) => {
            if (blob) onCapture(new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
    };

    // Rendered on <body> so the step card's animation (transform) can't trap the overlay
    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Take picture">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">Take Picture</p>
                    <button type="button" onClick={onClose} aria-label="Close camera" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
                </div>
                <div className="relative bg-black">
                    <video ref={videoRef} playsInline muted onLoadedData={() => setReady(true)} className="max-h-[65vh] w-full object-contain" />
                    {!ready && (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
                            <Loader2 size={18} className="mr-2 animate-spin" /> Starting camera…
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <p className="min-w-0 text-xs text-slate-500">{caption}</p>
                    <button type="button" onClick={snap} disabled={!ready || busy} className="flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#002a55] disabled:opacity-50">
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />} Capture
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

// ---- Full-size preview with replace / remove ----
const PhotoPreview = ({ photos, index, onIndex, onClose, onReplace, onRemove, busy }) => {
    const photo = photos[index];
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
            if (e.key === 'ArrowRight' && index < photos.length - 1) onIndex(index + 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [index, photos.length, onClose, onIndex]);
    if (!photo) return null;

    return createPortal(
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Photo preview">
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
                <p className="truncate text-sm font-semibold">{photo.category} <span className="font-normal text-white/60">· {index + 1} of {photos.length}</span></p>
                <button type="button" onClick={onClose} aria-label="Close preview" className="rounded-lg p-1.5 hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
                {index > 0 && (
                    <button type="button" onClick={() => onIndex(index - 1)} aria-label="Previous photo" className="absolute left-2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"><ChevronLeft size={22} /></button>
                )}
                <img src={photo.imageUrl} alt={photo.category} className="max-h-full max-w-full rounded-lg object-contain" />
                {index < photos.length - 1 && (
                    <button type="button" onClick={() => onIndex(index + 1)} aria-label="Next photo" className="absolute right-2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"><ChevronRight size={22} /></button>
                )}
            </div>
            <div className="flex justify-center gap-3 px-4 py-4">
                <button type="button" disabled={busy} onClick={() => onReplace(photo)} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#001f3f] transition hover:bg-slate-100 disabled:opacity-50">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Replace
                </button>
                <button type="button" disabled={busy} onClick={() => onRemove(photo)} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50">
                    <Trash2 size={15} /> Remove
                </button>
            </div>
        </div>,
        document.body,
    );
};

/**
 * @param {string}   inspectionId
 * @param {string}   step        seller | documents | identity | exterior | interior | mechanical | testDrive | location | evidence
 * @param {Array}    photos      all photos of the inspection
 * @param {Function} onPhotosChange  receives the updated photos list from the server
 * @param {number}   required    minimum photos for this step (0 = optional)
 * @param {string[]} shots       suggested photo labels for this step
 * @param {string}   title
 */
export const StepPhotos = ({ inspectionId, step, photos, onPhotosChange, required = 0, shots = [], title = 'Photo evidence', hint }) => {
    const stepPhotos = useMemo(() => photosForStep(photos, step), [photos, step]);
    const usedLabels = useMemo(() => new Set(stepPhotos.map((p) => p.category)), [stepPhotos]);
    const nextShot = shots.find((s) => !usedLabels.has(s)) || shots[0] || '';

    // The label follows the next shot not yet taken, unless the inspector picks one
    const [labelChoice, setLabelChoice] = useState(null);
    const label = labelChoice ?? nextShot;

    const [uploading, setUploading] = useState(0); // number of photos being uploaded
    const [busyId, setBusyId] = useState(null);
    const [previewIndex, setPreviewIndex] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const replaceTarget = useRef(null);

    const cameraInput = useRef(null);
    const fileInput = useRef(null);
    const replaceInput = useRef(null);

    const [uploadPhotos] = useUploadInspectionPhotosMutation();
    const [replacePhoto] = useReplaceInspectionPhotoMutation();
    const [deletePhoto] = useDeleteInspectionPhotoMutation();

    const count = stepPhotos.length;
    const done = required > 0 && count >= required;
    const busy = uploading > 0 || Boolean(busyId);

    const upload = async (fileList) => {
        const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/') || !f.type);
        if (!files.length) return toast.error('Please choose an image file');
        setUploading(files.length);
        try {
            const ready = await Promise.all(files.map(shrinkImage));
            let latest = null;
            for (let i = 0; i < ready.length; i += MAX_BATCH) {
                const formData = new FormData();
                ready.slice(i, i + MAX_BATCH).forEach((f) => formData.append('photos', f));
                formData.append('step', step);
                formData.append('category', (label || title).trim());
                latest = await uploadPhotos({ id: inspectionId, formData }).unwrap();
            }
            if (latest?.data?.photos) onPhotosChange(latest.data.photos);
            setLabelChoice(null); // move on to the next suggested shot
            toast.success(files.length === 1 ? 'Photo uploaded' : `${files.length} photos uploaded`);
        } catch (err) {
            toast.error(errorText(err, 'Upload failed. Please try again.'));
        } finally {
            setUploading(0);
        }
    };

    const startReplace = (photo) => {
        replaceTarget.current = photo;
        replaceInput.current?.click();
    };

    const doReplace = async (file) => {
        const photo = replaceTarget.current;
        replaceTarget.current = null;
        if (!photo || !file) return;
        if (file.type && !file.type.startsWith('image/')) return toast.error('Please choose an image file');
        setBusyId(photo.id);
        try {
            const formData = new FormData();
            formData.append('photo', await shrinkImage(file));
            const res = await replacePhoto({ id: inspectionId, photoId: photo.id, formData }).unwrap();
            if (res?.data?.photos) onPhotosChange(res.data.photos);
            toast.success('Photo replaced');
        } catch (err) {
            toast.error(errorText(err, 'Could not replace the photo'));
        } finally {
            setBusyId(null);
        }
    };

    const doRemove = async (photo) => {
        if (!window.confirm('Remove this photo?')) return;
        setBusyId(photo.id);
        try {
            const res = await deletePhoto({ id: inspectionId, photoId: photo.id }).unwrap();
            if (res?.data?.photos) onPhotosChange(res.data.photos);
            const left = photosForStep(res?.data?.photos, step).length;
            if (previewIndex !== null) setPreviewIndex(left ? Math.min(previewIndex, left - 1) : null);
            toast.success('Photo removed');
        } catch (err) {
            toast.error(errorText(err, 'Could not remove the photo'));
        } finally {
            setBusyId(null);
        }
    };

    const takePicture = () => {
        // Phones & tablets: the camera app via the file input. Desktops: the webcam window.
        if (isTouchDevice() || !navigator.mediaDevices?.getUserMedia) cameraInput.current?.click();
        else setCameraOpen(true);
    };

    return (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <ImageIcon size={16} className="text-[#001f3f]" /> {title}
                        {!required && <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Optional</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {hint || (required ? `At least ${required} photos are required to continue.` : 'Attach supporting photos if needed.')}
                    </p>
                </div>
                {required > 0 ? (
                    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`} aria-live="polite">
                        {done ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                        {Math.min(count, 999)}/{required} images uploaded
                    </span>
                ) : (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {count} photo{count === 1 ? '' : 's'}
                    </span>
                )}
            </div>

            {required > 0 && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full transition-all duration-300 ${done ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (count / required) * 100)}%` }} />
                </div>
            )}

            {/* Controls */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                {shots.length > 0 && (
                    <select
                        value={label}
                        onChange={(e) => setLabelChoice(e.target.value)}
                        aria-label="Photo label"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#001f3f] focus:outline-none sm:w-56"
                    >
                        {shots.map((s) => (
                            <option key={s} value={s}>{usedLabels.has(s) ? `✓ ${s}` : s}</option>
                        ))}
                    </select>
                )}
                <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button type="button" onClick={takePicture} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#002a55] disabled:opacity-60">
                        <Camera size={15} /> Take Picture
                    </button>
                    <button type="button" onClick={() => fileInput.current?.click()} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#001f3f] bg-white px-4 py-2 text-sm font-bold text-[#001f3f] transition hover:bg-[#e6f2ff] disabled:opacity-60">
                        <Upload size={15} /> Upload Photo
                    </button>
                </div>
                {uploading > 0 && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Loader2 size={13} className="animate-spin" /> Uploading {uploading} photo{uploading === 1 ? '' : 's'}…
                    </span>
                )}
            </div>

            {/* Hidden inputs */}
            <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
            <input ref={replaceInput} type="file" accept="image/*" hidden onChange={(e) => { doReplace(e.target.files?.[0]); e.target.value = ''; }} />

            {/* Thumbnails */}
            {count > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {stepPhotos.map((p, idx) => (
                        <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <button type="button" onClick={() => setPreviewIndex(idx)} className="block h-full w-full" aria-label={`Preview ${p.category}`}>
                                <img src={p.imageUrl} alt={p.category} loading="lazy" className="h-full w-full object-cover" />
                            </button>
                            <span className="pointer-events-none absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white">{p.category}</span>
                            <div className="absolute right-1 top-1 flex gap-1">
                                <button type="button" onClick={() => startReplace(p)} disabled={busy} aria-label="Replace photo" title="Replace" className="rounded-md bg-white/90 p-1 text-[#001f3f] shadow-sm hover:bg-white disabled:opacity-50">
                                    <RefreshCw size={12} />
                                </button>
                                <button type="button" onClick={() => doRemove(p)} disabled={busy} aria-label="Remove photo" title="Remove" className="rounded-md bg-white/90 p-1 text-red-600 shadow-sm hover:bg-white disabled:opacity-50">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            {busyId === p.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 size={18} className="animate-spin text-[#001f3f]" /></div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white py-6 text-center text-xs text-slate-400">No photos for this step yet.</p>
            )}

            {cameraOpen && (
                <CameraModal
                    onClose={() => setCameraOpen(false)}
                    onCapture={(file) => upload([file])}
                    busy={uploading > 0}
                    caption={`${label ? `${label} · ` : ''}${required ? `${count}/${required} images uploaded` : `${count} photo${count === 1 ? '' : 's'}`}`}
                    onUnavailable={() => {
                        setCameraOpen(false);
                        toast.error('No camera found or camera access was blocked. Use Upload Photo instead.');
                    }}
                />
            )}

            {previewIndex !== null && stepPhotos[previewIndex] && (
                <PhotoPreview
                    photos={stepPhotos}
                    index={previewIndex}
                    onIndex={setPreviewIndex}
                    onClose={() => setPreviewIndex(null)}
                    onReplace={startReplace}
                    onRemove={doRemove}
                    busy={busy}
                />
            )}
        </div>
    );
};