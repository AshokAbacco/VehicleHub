import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { X, Save, Loader2, Image as ImageIcon, FileText, Check, Trash2, Plus } from 'lucide-react';
import { useUpdateVehicleMutation, useDeleteVehicleImageMutation } from '../../services/sellerApiSlice.js';

const FIELD_GROUPS = [
    {
        title: 'Basic',
        fields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'category', label: 'Category', type: 'select', options: ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Auto', 'Tractor', 'Commercial Vehicle'] },
            { key: 'brand', label: 'Brand', type: 'text' },
            { key: 'model', label: 'Model', type: 'text' },
            { key: 'variant', label: 'Variant', type: 'text' },
            { key: 'registrationNumber', label: 'Registration Number', type: 'text' },
            { key: 'vin', label: 'VIN', type: 'text' },
            { key: 'price', label: 'Price (₹)', type: 'number' },
            { key: 'negotiable', label: 'Negotiable', type: 'boolean' },
            { key: 'emiAvailable', label: 'EMI Available', type: 'boolean' },
        ],
    },
    {
        title: 'Details',
        fields: [
            { key: 'manufacturingYear', label: 'Mfg. Year', type: 'number' },
            { key: 'registrationYear', label: 'Registration Year', type: 'number' },
            { key: 'kmDriven', label: 'KM Driven', type: 'number' },
            { key: 'fuelType', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] },
            { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic'] },
            { key: 'color', label: 'Color', type: 'text' },
            { key: 'ownership', label: 'Ownership', type: 'text' },
            { key: 'seatingCapacity', label: 'Seating Capacity', type: 'number' },
            { key: 'engineCapacity', label: 'Engine Capacity (CC)', type: 'number' },
            { key: 'mileage', label: 'Mileage', type: 'number' },
        ],
    },
    {
        title: 'Documents & Condition',
        fields: [
            { key: 'rcAvailable', label: 'RC Available', type: 'boolean' },
            { key: 'insuranceAvailable', label: 'Insurance Available', type: 'boolean' },
            { key: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
            { key: 'pollutionCertificate', label: 'Pollution Certificate', type: 'boolean' },
            { key: 'serviceBook', label: 'Service Book', type: 'boolean' },
            { key: 'numberOfKeys', label: 'Number of Keys', type: 'number' },
            { key: 'loanPending', label: 'Loan Pending', type: 'boolean' },
            { key: 'nocAvailable', label: 'NOC Available', type: 'boolean' },
            { key: 'vehicleCondition', label: 'Vehicle Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Needs Repair'] },
            { key: 'accidentHistory', label: 'Accident History', type: 'boolean' },
            { key: 'floodDamage', label: 'Flood Damage', type: 'boolean' },
            { key: 'engineCondition', label: 'Engine Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Needs Repair'] },
            { key: 'tyreCondition', label: 'Tyre Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Needs Repair'] },
            { key: 'batteryCondition', label: 'Battery Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Needs Repair'] },
        ],
    },
    {
        title: 'Seller Information',
        fields: [
            { key: 'sellerName', label: 'Seller Name', type: 'text' },
            { key: 'mobileNumber', label: 'Mobile Number', type: 'text' },
            { key: 'email', label: 'Seller Email', type: 'email' },
            { key: 'sellerType', label: 'Seller Type', type: 'select', options: ['Individual', 'Dealer'] },
            { key: 'dealerName', label: 'Dealer Name', type: 'text' },
        ],
    },
    {
        title: 'Location',
        fields: [
            { key: 'city', label: 'City', type: 'text' },
            { key: 'state', label: 'State', type: 'text' },
            { key: 'pincode', label: 'Pincode', type: 'text' },
            { key: 'area', label: 'Area', type: 'text' },
            { key: 'country', label: 'Country', type: 'text' },
        ],
    },
];

const FEATURE_OPTIONS = [
    'Air Conditioner', 'Airbags', 'Parking Sensors', 'Cruise Control', 'Leather Seats',
    'GPS Navigation', 'Alloy Wheels', 'Power Steering', 'Power Windows', 'Sunroof',
    'Bluetooth', 'Keyless Entry', 'Touch Screen', 'Reverse Camera', 'ABS',
];

// Derives a readable name from a Cloudinary/storage URL for documents that only have a URL, not a stored name.
const docNameFromUrl = (url) => {
    try {
        const last = url.split('/').pop().split('?')[0];
        return decodeURIComponent(last.replace(/^v\d+_/, ''));
    } catch {
        return 'Document';
    }
};

export const EditVehicleModal = ({ vehicle, onClose }) => {
    const [form, setForm] = useState(() => {
        const initial = {};
        FIELD_GROUPS.flatMap((group) => group.fields).forEach(({ key }) => {
            initial[key] = key === 'features' && Array.isArray(vehicle?.[key]) ? vehicle[key].join('\n') : vehicle?.[key] ?? '';
        });
        initial.features = Array.isArray(vehicle?.features) ? vehicle.features : [];
        return initial;
    });
    const [updateVehicle, { isLoading }] = useUpdateVehicleMutation();
    const [deleteVehicleImage] = useDeleteVehicleImageMutation();
    const [existingImages, setExistingImages] = useState(() => Array.isArray(vehicle?.images) ? vehicle.images : []);
    const [newImages, setNewImages] = useState([]); // [{ file, previewUrl }]

    useEffect(() => {
        return () => newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeExistingImage = async (url) => {
        setExistingImages((prev) => prev.filter((img) => img !== url));
        try {
            await deleteVehicleImage({ id: vehicle.id, imageUrl: url }).unwrap();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete image');
            setExistingImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
        }
    };
    const addNewImages = (fileList) => {
        const files = Array.from(fileList || []);
        setNewImages((prev) => [...prev, ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))]);
    };
    const removeNewImage = (previewUrl) => setNewImages((prev) => {
        const target = prev.find((img) => img.previewUrl === previewUrl);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return prev.filter((img) => img.previewUrl !== previewUrl);
    });

    // ---- RC / Insurance (single-slot documents) ----
    const [rcFrontUrl, setRcFrontUrl] = useState(vehicle?.rcFront || null);
    const [rcFrontFile, setRcFrontFile] = useState(null);
    const [insuranceUrl, setInsuranceUrl] = useState(vehicle?.insuranceDocument || null);
    const [insuranceFile, setInsuranceFile] = useState(null);

    const replaceRcFront = (file) => { setRcFrontFile(file); setRcFrontUrl(URL.createObjectURL(file)); };
    const removeRcFront = () => { setRcFrontFile(null); setRcFrontUrl(null); };
    const replaceInsurance = (file) => { setInsuranceFile(file); setInsuranceUrl(URL.createObjectURL(file)); };
    const removeInsurance = () => { setInsuranceFile(null); setInsuranceUrl(null); };

    // ---- Additional documents (generic array on the vehicle) ----
    const [existingDocuments, setExistingDocuments] = useState(() => Array.isArray(vehicle?.documents) ? vehicle.documents : []);
    const [newDocuments, setNewDocuments] = useState([]); // [{ file, name }]

    const removeExistingDocument = (url) => setExistingDocuments((prev) => prev.filter((doc) => doc !== url));
    const addNewDocuments = (fileList) => {
        const files = Array.from(fileList || []);
        setNewDocuments((prev) => [...prev, ...files.map((file) => ({ file, name: file.name }))]);
    };
    const removeNewDocument = (name) => setNewDocuments((prev) => prev.filter((doc) => doc.name !== name));

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!vehicle) return null;

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (key === 'features') return;
                if (value !== undefined && value !== null) formData.append(key, String(value));
            });
            (form.features || []).forEach((item) => formData.append('features', item));
            formData.append('existingImages', JSON.stringify(existingImages));
            newImages.forEach((img) => formData.append('images', img.file));

            if (rcFrontFile) formData.append('rcFront', rcFrontFile);
            else if (!rcFrontUrl) formData.append('removeRcFront', 'true');

            if (insuranceFile) formData.append('insuranceDocument', insuranceFile);
            else if (!insuranceUrl) formData.append('removeInsuranceDocument', 'true');

            formData.append('existingDocuments', JSON.stringify(existingDocuments));
            newDocuments.forEach((doc) => formData.append('documents', doc.file));

            await updateVehicle({ id: vehicle.id, formData }).unwrap();
            toast.success('Vehicle updated successfully');
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update vehicle');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="animate-fadeInUp relative my-auto flex max-h-[calc(100dvh-1rem)] min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-linear-to-r from-[#001f3f] to-[#003d7a] px-4 py-3 sm:px-6 sm:py-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Edit Listing</p>
                        <h2 className="truncate text-lg font-bold text-white">{vehicle.title}</h2>
                    </div>
                    <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                        {FIELD_GROUPS.map((group) => (
                            <div key={group.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">{group.title}</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {group.fields.map((field) => (
                                        <div key={field.key}>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">{field.label}</label>
                                            {field.type === 'select' ? (
                                                <select value={form[field.key] ?? ''} onChange={(e) => set(field.key, e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none">
                                                    <option value="">Select</option>
                                                    {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                                                </select>
                                            ) : field.type === 'boolean' ? (
                                                <select value={form[field.key] === true || form[field.key] === 'true' || form[field.key] === 'Yes' ? 'Yes' : 'No'} onChange={(e) => set(field.key, e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none">
                                                    <option value="Yes">Yes</option><option value="No">No</option>
                                                </select>
                                            ) : (
                                                <input type={field.type} value={field.type === 'date' && form[field.key] ? String(form[field.key]).slice(0, 10) : form[field.key] ?? ''} onChange={(e) => set(field.key, e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><ImageIcon size={15} /> Vehicle photos</div>
                                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#001f3f] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#002a55]">
                                    <Plus size={13} /> Add more
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addNewImages(e.target.files); e.target.value = ''; }} />
                                </label>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                {existingImages.map((image, index) => (
                                    <div key={image} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                                        <img src={image} alt={`Vehicle ${index + 1}`} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(image)}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                                            aria-label="Remove image"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {newImages.map((img) => (
                                    <div key={img.previewUrl} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-emerald-300">
                                        <img src={img.previewUrl} alt="New upload" className="h-full w-full object-cover" />
                                        <span className="absolute bottom-1 left-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">New</span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(img.previewUrl)}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                                            aria-label="Remove image"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {!existingImages.length && !newImages.length && <p className="text-xs text-slate-400">No photos yet. Use "Add more" to upload some.</p>}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-900"><FileText size={15} /> Documents</div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {[
                                    { label: 'RC Document', url: rcFrontUrl, onReplace: replaceRcFront, onRemove: removeRcFront },
                                    { label: 'Insurance Document', url: insuranceUrl, onReplace: replaceInsurance, onRemove: removeInsurance },
                                ].map((doc) => (
                                    <div key={doc.label} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-600">{doc.label}</p>
                                            {doc.url ? (
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="truncate text-xs text-[#001f3f] hover:underline">View document</a>
                                            ) : (
                                                <p className="text-xs text-slate-400">Not uploaded</p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200" title={doc.url ? 'Replace' : 'Upload'}>
                                                <Plus size={14} />
                                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) doc.onReplace(e.target.files[0]); e.target.value = ''; }} />
                                            </label>
                                            {doc.url && (
                                                <button type="button" onClick={doc.onRemove} className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100" title="Remove">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold text-slate-600">Additional documents</p>
                                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#001f3f] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#002a55]">
                                        <Plus size={13} /> Add document
                                        <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => { addNewDocuments(e.target.files); e.target.value = ''; }} />
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    {existingDocuments.map((docUrl) => (
                                        <div key={docUrl} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm">
                                            <a href={docUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-[#001f3f] hover:underline">{docNameFromUrl(docUrl)}</a>
                                            <button type="button" onClick={() => removeExistingDocument(docUrl)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100" aria-label="Remove document">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                    {newDocuments.map((doc) => (
                                        <div key={doc.name} className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm">
                                            <span className="min-w-0 flex-1 truncate text-emerald-700">{doc.name} <span className="text-[10px] font-bold uppercase text-emerald-600">New</span></span>
                                            <button type="button" onClick={() => removeNewDocument(doc.name)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100" aria-label="Remove document">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                    {!existingDocuments.length && !newDocuments.length && <p className="text-xs text-slate-400">No additional documents uploaded.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-1 flex items-center justify-between gap-3">
                                <label className="block text-sm font-bold text-slate-900">Features</label>
                                <span className="text-xs font-medium text-slate-400">{form.features?.length || 0} selected</span>
                            </div>
                            <p className="mb-4 text-xs text-slate-500">Select the features included with this vehicle.</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {FEATURE_OPTIONS.map((feature) => {
                                    const selected = (form.features || []).includes(feature);
                                    return <button key={feature} type="button" onClick={() => set('features', selected ? form.features.filter((item) => item !== feature) : [...(form.features || []), feature])} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${selected ? 'border-[#001f3f] bg-[#e6f2ff] text-[#001f3f]' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#001f3f]/30 hover:bg-white'}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-[#001f3f] bg-[#001f3f] text-white' : 'border-slate-300 bg-white text-transparent'}`}><Check size={13} /></span>{feature}</button>;
                                })}
                            </div>
                            {(form.features || []).some((feature) => !FEATURE_OPTIONS.includes(feature)) && <p className="mt-3 text-xs text-slate-500">Other backend features: {(form.features || []).filter((feature) => !FEATURE_OPTIONS.includes(feature)).join(', ')}</p>}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description</label>
                            <textarea
                                rows={4}
                                value={form.description ?? ''}
                                onChange={(e) => set('description', e.target.value)}
                                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                        <button type="button" onClick={onClose} className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-md disabled:opacity-60"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};