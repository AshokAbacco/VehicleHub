import { useRef, useState } from 'react';
import {
    Check, ChevronLeft, ChevronRight, Upload, X, Car, DollarSign,
    Settings2, FileText, Sparkles, User, MapPin, Image as ImageIcon, AlignLeft, Images, ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { allVehicles, setAllVehicles } from '../../data/adminMockData.js';

const categories = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Auto', 'Tractor', 'Commercial Vehicle'];
const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const transmissions = ['Manual', 'Automatic'];
const ownerships = ['1st Owner', '2nd Owner', '3rd Owner', '4+ Owner'];
const conditions = ['Excellent', 'Good', 'Fair', 'Needs Repair'];
const featuresList = [
    'Air Conditioner', 'Power Steering', 'Power Windows', 'ABS', 'Airbags',
    'Alloy Wheels', 'Sunroof', 'Reverse Camera', 'Parking Sensors', 'GPS Navigation',
    'Bluetooth', 'Touch Screen', 'Cruise Control', 'Leather Seats', 'Keyless Entry',
];
const documentSlots = [
    { key: 'rcFront', label: 'RC Image' },
    { key: 'insuranceDocument', label: 'Insurance Image' },
];

const steps = [
    { id: 1, label: 'Basic & Pricing', icon: Car },
    { id: 2, label: 'Details & Documents', icon: Settings2 },
    { id: 3, label: 'Condition & Features', icon: Sparkles },
    { id: 4, label: 'Seller & Location', icon: User },
    { id: 5, label: 'Images & Description', icon: ImageIcon },
];

const initialForm = {
    title: '', category: '', brand: '', model: '', variant: '', registrationNumber: '', vin: '',
    price: '', negotiable: 'No', emiAvailable: 'No',
    manufacturingYear: '', registrationYear: '', fuelType: '', transmission: '', kmDriven: '',
    ownership: '', color: '', seatingCapacity: '', engineCapacity: '', mileage: '',
    rcAvailable: 'Yes', insuranceAvailable: 'Yes', insuranceExpiry: '', pollutionCertificate: 'Yes',
    serviceBook: 'Yes', numberOfKeys: '2', loanPending: 'No', nocAvailable: 'Yes',
    vehicleCondition: '', accidentHistory: 'No', floodDamage: 'No',
    engineCondition: 'Good', tyreCondition: 'Good', batteryCondition: 'Good',
    features: [],
    sellerName: '', mobileNumber: '', email: '', sellerType: 'Individual', dealerName: '',
    country: 'India', state: '', city: '', area: '', pincode: '',
    images: [], documents: {}, description: '',
    publishImmediately: true, // admin-only toggle since admin IS the approver
};

const Field = ({ label, required, children, hint }) => (
    <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>
        {children}
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
);

const TextInput = (props) => (
    <input {...props} className={`w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10 ${props.className || ''}`} />
);

const TextArea = (props) => (
    <textarea {...props} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10" />
);

const PillGroup = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
            <button key={opt} type="button" onClick={() => onChange(opt)} className={`rounded-full border-2 px-3.5 py-2 text-sm font-medium transition ${value === opt ? 'border-[#001f3f] bg-[#001f3f] text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-[#001f3f]/30 hover:text-slate-900'}`}>
                {opt}
            </button>
        ))}
    </div>
);

const YesNoToggle = ({ value, onChange }) => (
    <div className="flex gap-2">
        {['Yes', 'No'].map((opt) => (
            <button key={opt} type="button" onClick={() => onChange(opt)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition ${value === opt ? (opt === 'Yes' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-600') : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}>
                {opt}
            </button>
        ))}
    </div>
);

const SectionHeading = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><Icon size={18} /></div>
        <div><h3 className="text-base font-bold text-slate-900">{title}</h3>{subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}</div>
    </div>
);

const MultiImageUpload = ({ images, onAdd, onRemove, max = 15 }) => {
    const inputRef = useRef(null);
    const handleFiles = (fileList) => {
        const files = Array.from(fileList).slice(0, Math.max(0, max - images.length));
        const newItems = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
        if (newItems.length) onAdd(newItems);
    };
    return (
        <div>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={images.length >= max}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-slate-400 transition hover:border-[#001f3f]/40 hover:bg-[#e6f2ff]/40 hover:text-[#001f3f] disabled:cursor-not-allowed disabled:opacity-50">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]"><Images size={20} /></div>
                <p className="text-sm font-semibold">Click to attach photos</p>
                <p className="text-xs text-slate-400">Select multiple images at once · JPG/PNG · up to {max}</p>
            </button>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
            {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {images.map((img, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-xl border-2 border-slate-200">
                            <img src={img.preview} alt={`Vehicle photo ${idx + 1}`} className="h-24 w-full object-cover" />
                            <button type="button" onClick={() => onRemove(idx)} className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"><X size={12} /></button>
                            {idx === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-[#001f3f] px-2 py-0.5 text-[10px] font-bold text-white">Cover</span>}
                        </div>
                    ))}
                </div>
            )}
            <p className="mt-2 text-xs text-slate-400">{images.length} / {max} photos added</p>
        </div>
    );
};

const DocumentSlot = ({ label, doc, onSelect, onRemove }) => {
    const inputRef = useRef(null);
    return (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 text-center transition hover:border-[#001f3f]/30">
            {doc ? (
                <div className="relative">
                    <img src={doc.preview} alt={label} className="h-24 w-full rounded-lg object-cover" />
                    <button type="button" onClick={onRemove} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md"><X size={11} /></button>
                </div>
            ) : (
                <button type="button" onClick={() => inputRef.current?.click()} className="flex h-24 w-full flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#001f3f]">
                    <Upload size={18} /><span className="text-[11px] font-medium">Upload</span>
                </button>
            )}
            <p className="mt-2 truncate text-[11px] font-medium text-slate-500">{label}</p>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect({ file: f, preview: URL.createObjectURL(f) }); }} />
        </div>
    );
};

export const AdminAddVehicleForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
    const toggleFeature = (feature) => setForm((prev) => ({ ...prev, features: prev.features.includes(feature) ? prev.features.filter((f) => f !== feature) : [...prev.features, feature] }));
    const addImages = (newItems) => setForm((prev) => ({ ...prev, images: [...prev.images, ...newItems] }));
    const removeImage = (idx) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    const setDocument = (key, doc) => setForm((prev) => ({ ...prev, documents: { ...prev.documents, [key]: doc } }));
    const removeDocument = (key) => setForm((prev) => { const next = { ...prev.documents }; delete next[key]; return { ...prev, documents: next }; });

    const validateStep = (currentStep) => {
        const req = {};
        if (currentStep === 1) {
            if (!form.title.trim()) req.title = 'Required';
            if (!form.category) req.category = 'Required';
            if (!form.brand.trim()) req.brand = 'Required';
            if (!form.model.trim()) req.model = 'Required';
            if (!form.price) req.price = 'Required';
        }
        if (currentStep === 2) {
            if (!form.manufacturingYear) req.manufacturingYear = 'Required';
            if (!form.fuelType) req.fuelType = 'Required';
            if (!form.transmission) req.transmission = 'Required';
            if (!form.kmDriven) req.kmDriven = 'Required';
            if (!form.ownership) req.ownership = 'Required';
            if (!form.color.trim()) req.color = 'Required';
        }
        if (currentStep === 4) {
            if (!form.sellerName.trim()) req.sellerName = 'Required';
        }
        setErrors(req);
        return Object.keys(req).length === 0;
    };

    const goNext = () => { if (!validateStep(step)) return; setStep((s) => Math.min(s + 1, steps.length)); };
    const goBack = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        if (!validateStep(4)) { setStep(4); return; }
        setSubmitting(true);
        await new Promise((res) => setTimeout(res, 900));

        // Admin-created listings publish directly (admin IS the approver) — appended to the live catalog
        const newVehicle = {
            id: `admin-v-${Date.now()}`,
            sellerId: 'admin-added',
            title: form.title,
            seller: form.dealerName || form.sellerName,
            category: form.category,
            price: Number(form.price) || 0,
            status: form.publishImmediately ? 'live' : 'draft',
            views: 0,
            thumb: '🚗',
            postedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            description: form.description,
            location: [form.area, form.city, form.state].filter(Boolean).join(', '),
            fuelType: form.fuelType,
            transmission: form.transmission,
            kmDriven: Number(form.kmDriven) || 0,
            sellerName: form.sellerName,
            sellerEmail: form.email,
            sellerPhone: form.mobileNumber,
        };
        setAllVehicles((prev) => [newVehicle, ...prev]);

        setSubmitting(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check size={26} /></div>
                <h3 className="text-lg font-bold text-slate-900">Vehicle added successfully</h3>
                <p className="max-w-sm text-sm text-slate-500">
                    "{form.title}" has been {form.publishImmediately ? 'published and is now live on the marketplace.' : 'saved as a draft.'}
                </p>
                <div className="mt-2 flex gap-3">
                    <button onClick={() => navigate('/admin/dashboard/all-vehicles')} className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">View All Vehicles</button>
                    <button onClick={() => { setForm(initialForm); setStep(1); setSubmitted(false); }} className="rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 hover:bg-[#002a55]">Add another vehicle</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="animate-fadeInUp flex items-center gap-3 rounded-2xl border border-[#001f3f]/15 bg-gradient-to-r from-[#e6f2ff] to-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#001f3f] text-white"><ShieldCheck size={18} /></div>
                <div>
                    <p className="text-sm font-bold text-slate-900">Adding as Admin</p>
                    <p className="text-xs text-slate-500">Vehicles added here can be published directly — no separate approval step needed.</p>
                </div>
            </div>

            <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                {/* Stepper */}
                <div className="mb-8 flex items-center justify-between overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                    {steps.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isDone = step > s.id;
                        return (
                            <div key={s.id} className="flex flex-1 items-center">
                                <button type="button" onClick={() => { if (isDone) setStep(s.id); }} className="flex shrink-0 flex-col items-center gap-1.5">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition ${isActive ? 'border-[#001f3f] bg-[#001f3f] text-white shadow-md shadow-[#001f3f]/20' : isDone ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                                        {isDone ? <Check size={15} /> : <Icon size={15} />}
                                    </div>
                                    <span className={`hidden text-[11px] font-semibold sm:block ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                                </button>
                                {idx < steps.length - 1 && <div className={`mx-2 h-0.5 flex-1 rounded ${step > s.id ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                            </div>
                        );
                    })}
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div>
                            <SectionHeading icon={Car} title="Basic Information" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2"><Field label="Vehicle Title" required><TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Maruti Suzuki Brezza ZXi+" />{errors.title && <p className="mt-1 text-xs font-medium text-red-500">{errors.title}</p>}</Field></div>
                                <div className="sm:col-span-2"><Field label="Vehicle Category" required><PillGroup options={categories} value={form.category} onChange={(v) => set('category', v)} />{errors.category && <p className="mt-1 text-xs font-medium text-red-500">{errors.category}</p>}</Field></div>
                                <Field label="Brand" required><TextInput value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Maruti Suzuki" />{errors.brand && <p className="mt-1 text-xs font-medium text-red-500">{errors.brand}</p>}</Field>
                                <Field label="Model" required><TextInput value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. Brezza" />{errors.model && <p className="mt-1 text-xs font-medium text-red-500">{errors.model}</p>}</Field>
                                <Field label="Variant"><TextInput value={form.variant} onChange={(e) => set('variant', e.target.value)} placeholder="e.g. ZXi+" /></Field>
                                <Field label="Registration Number"><TextInput value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} placeholder="e.g. HR-26-AB-1234" /></Field>
                                <Field label="VIN / Chassis Number" hint="Optional"><TextInput value={form.vin} onChange={(e) => set('vin', e.target.value)} placeholder="17-character VIN" /></Field>
                            </div>
                        </div>
                        <div>
                            <SectionHeading icon={DollarSign} title="Pricing" />
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Field label="Expected Price (₹)" required><TextInput type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 850000" />{errors.price && <p className="mt-1 text-xs font-medium text-red-500">{errors.price}</p>}</Field>
                                <Field label="Negotiable"><YesNoToggle value={form.negotiable} onChange={(v) => set('negotiable', v)} /></Field>
                                <Field label="EMI Available"><YesNoToggle value={form.emiAvailable} onChange={(v) => set('emiAvailable', v)} /></Field>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div>
                            <SectionHeading icon={Settings2} title="Vehicle Details" />
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field label="Manufacturing Year" required><TextInput type="number" value={form.manufacturingYear} onChange={(e) => set('manufacturingYear', e.target.value)} placeholder="e.g. 2022" />{errors.manufacturingYear && <p className="mt-1 text-xs font-medium text-red-500">{errors.manufacturingYear}</p>}</Field>
                                <Field label="Registration Year"><TextInput type="number" value={form.registrationYear} onChange={(e) => set('registrationYear', e.target.value)} placeholder="e.g. 2022" /></Field>
                                <Field label="Kilometer Driven" required><TextInput type="number" value={form.kmDriven} onChange={(e) => set('kmDriven', e.target.value)} placeholder="e.g. 24000" />{errors.kmDriven && <p className="mt-1 text-xs font-medium text-red-500">{errors.kmDriven}</p>}</Field>
                                <div className="sm:col-span-2 lg:col-span-3"><Field label="Fuel Type" required><PillGroup options={fuelTypes} value={form.fuelType} onChange={(v) => set('fuelType', v)} />{errors.fuelType && <p className="mt-1 text-xs font-medium text-red-500">{errors.fuelType}</p>}</Field></div>
                                <div className="sm:col-span-2 lg:col-span-3"><Field label="Transmission" required><PillGroup options={transmissions} value={form.transmission} onChange={(v) => set('transmission', v)} />{errors.transmission && <p className="mt-1 text-xs font-medium text-red-500">{errors.transmission}</p>}</Field></div>
                                <div className="sm:col-span-2 lg:col-span-3"><Field label="Ownership" required><PillGroup options={ownerships} value={form.ownership} onChange={(v) => set('ownership', v)} />{errors.ownership && <p className="mt-1 text-xs font-medium text-red-500">{errors.ownership}</p>}</Field></div>
                                <Field label="Color" required><TextInput value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="e.g. Pearl White" />{errors.color && <p className="mt-1 text-xs font-medium text-red-500">{errors.color}</p>}</Field>
                                <Field label="Seating Capacity"><TextInput type="number" value={form.seatingCapacity} onChange={(e) => set('seatingCapacity', e.target.value)} placeholder="e.g. 5" /></Field>
                                <Field label="Engine Capacity (CC)"><TextInput type="number" value={form.engineCapacity} onChange={(e) => set('engineCapacity', e.target.value)} placeholder="e.g. 1462" /></Field>
                                <Field label="Mileage (km/l)"><TextInput type="number" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} placeholder="e.g. 17.5" /></Field>
                            </div>
                        </div>
                        <div>
                            <SectionHeading icon={FileText} title="Documents" />
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field label="RC Available"><YesNoToggle value={form.rcAvailable} onChange={(v) => set('rcAvailable', v)} /></Field>
                                <Field label="Insurance Available"><YesNoToggle value={form.insuranceAvailable} onChange={(v) => set('insuranceAvailable', v)} /></Field>
                                <Field label="Insurance Expiry Date"><TextInput type="date" value={form.insuranceExpiry} onChange={(e) => set('insuranceExpiry', e.target.value)} /></Field>
                                <Field label="Pollution Certificate"><YesNoToggle value={form.pollutionCertificate} onChange={(v) => set('pollutionCertificate', v)} /></Field>
                                <Field label="Service Book"><YesNoToggle value={form.serviceBook} onChange={(v) => set('serviceBook', v)} /></Field>
                                <Field label="Number of Keys"><TextInput type="number" value={form.numberOfKeys} onChange={(e) => set('numberOfKeys', e.target.value)} /></Field>
                                <Field label="Loan Pending"><YesNoToggle value={form.loanPending} onChange={(v) => set('loanPending', v)} /></Field>
                                <Field label="NOC Available"><YesNoToggle value={form.nocAvailable} onChange={(v) => set('nocAvailable', v)} /></Field>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div>
                            <SectionHeading icon={Sparkles} title="Condition" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2"><Field label="Vehicle Condition"><PillGroup options={conditions} value={form.vehicleCondition} onChange={(v) => set('vehicleCondition', v)} /></Field></div>
                                <Field label="Accident History"><YesNoToggle value={form.accidentHistory} onChange={(v) => set('accidentHistory', v)} /></Field>
                                <Field label="Flood Damage"><YesNoToggle value={form.floodDamage} onChange={(v) => set('floodDamage', v)} /></Field>
                                <Field label="Engine Condition"><PillGroup options={conditions} value={form.engineCondition} onChange={(v) => set('engineCondition', v)} /></Field>
                                <Field label="Tyre Condition"><PillGroup options={conditions} value={form.tyreCondition} onChange={(v) => set('tyreCondition', v)} /></Field>
                                <Field label="Battery Condition"><PillGroup options={conditions} value={form.batteryCondition} onChange={(v) => set('batteryCondition', v)} /></Field>
                            </div>
                        </div>
                        <div>
                            <SectionHeading icon={Sparkles} title="Features" subtitle="Select all that apply" />
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                                {featuresList.map((feature) => {
                                    const checked = form.features.includes(feature);
                                    return (
                                        <button key={feature} type="button" onClick={() => toggleFeature(feature)} className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-xs font-semibold transition ${checked ? 'border-[#001f3f] bg-[#e6f2ff] text-[#001f3f]' : 'border-slate-200 bg-white text-slate-600 hover:border-[#001f3f]/30'}`}>
                                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${checked ? 'border-[#001f3f] bg-[#001f3f]' : 'border-slate-300'}`}>{checked && <Check size={11} className="text-white" />}</span>
                                            {feature}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                    <div className="space-y-8">
                        <div>
                            <SectionHeading icon={User} title="Seller Information" subtitle="Who this vehicle is listed on behalf of" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Seller Name" required><TextInput value={form.sellerName} onChange={(e) => set('sellerName', e.target.value)} placeholder="Full name" />{errors.sellerName && <p className="mt-1 text-xs font-medium text-red-500">{errors.sellerName}</p>}</Field>
                                <Field label="Mobile Number"><TextInput type="tel" value={form.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value)} placeholder="+91 98765 43210" /></Field>
                                <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" /></Field>
                                <Field label="Dealer / Individual"><PillGroup options={['Individual', 'Dealer']} value={form.sellerType} onChange={(v) => set('sellerType', v)} /></Field>
                                {form.sellerType === 'Dealer' && <div className="sm:col-span-2"><Field label="Dealer Name" hint="Optional"><TextInput value={form.dealerName} onChange={(e) => set('dealerName', e.target.value)} placeholder="e.g. RK Dealerships" /></Field></div>}
                            </div>
                        </div>
                        <div>
                            <SectionHeading icon={MapPin} title="Location" />
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field label="Country"><TextInput value={form.country} onChange={(e) => set('country', e.target.value)} /></Field>
                                <Field label="State"><TextInput value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="e.g. Haryana" /></Field>
                                <Field label="City"><TextInput value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Gurugram" /></Field>
                                <Field label="Area"><TextInput value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Sector 45" /></Field>
                                <Field label="Pincode"><TextInput value={form.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="e.g. 122003" /></Field>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5 */}
                {step === 5 && (
                    <div className="space-y-8">
                        <div>
                            <SectionHeading icon={ImageIcon} title="Vehicle Images" subtitle="Attach multiple photos at once" />
                            <MultiImageUpload images={form.images} onAdd={addImages} onRemove={removeImage} max={15} />
                        </div>
                        <div>
                            <SectionHeading icon={FileText} title="Documents" subtitle="Upload RC and Insurance images" />
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {documentSlots.map((slot) => (
                                    <DocumentSlot key={slot.key} label={slot.label} doc={form.documents[slot.key]} onSelect={(doc) => setDocument(slot.key, doc)} onRemove={() => removeDocument(slot.key)} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <SectionHeading icon={AlignLeft} title="Description" />
                            <Field label="Describe this vehicle for buyers">
                                <TextArea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Condition, history, why it's being sold..." />
                            </Field>
                        </div>
                        <div>
                            <SectionHeading icon={ShieldCheck} title="Publishing" />
                            <label className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Publish immediately</p>
                                    <p className="text-xs text-slate-400">Goes live right away. Turn off to save as a draft instead.</p>
                                </div>
                                <button type="button" onClick={() => set('publishImmediately', !form.publishImmediately)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${form.publishImmediately ? 'bg-[#001f3f]' : 'bg-slate-300'}`}>
                                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.publishImmediately ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </label>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                    <button type="button" onClick={goBack} disabled={step === 1} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronLeft size={15} /> Back
                    </button>
                    <p className="text-xs font-medium text-slate-400">Step {step} of {steps.length}</p>
                    {step < steps.length ? (
                        <button type="button" onClick={goNext} className="flex items-center gap-1.5 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-lg">
                            Next <ChevronRight size={15} />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={submitting} className="flex items-center gap-1.5 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-lg disabled:opacity-60">
                            {submitting ? 'Saving...' : form.publishImmediately ? 'Publish Vehicle' : 'Save as Draft'}
                            {!submitting && <Check size={15} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};