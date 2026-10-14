import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft, ArrowRight, Save, Check, User, FileText, Fingerprint, Car, Sofa,
    Wrench, Gauge, MapPin, Camera, ClipboardCheck, Loader2, Upload, X, Star, Navigation,
    Eye, Download,
} from 'lucide-react';
import {
    useGetInspectionByIdQuery,
    useUpdateSellerVerificationMutation,
    useUpdateDocumentVerificationMutation,
    useUpdateVehicleIdentityMutation,
    useUpdateVehicleCheckMutation,
    useUpdateTestDriveMutation,
    useUpdateLocationMutation,
    useUploadInspectionPhotosMutation,
    useSubmitInspectionMutation,
} from '../../services/fieldInspectorApiSlice.js';

const STEPS = [
    { id: 1, label: 'Seller Verification', icon: User },
    { id: 2, label: 'Document Verification', icon: FileText },
    { id: 3, label: 'Vehicle Identity', icon: Fingerprint },
    { id: 4, label: 'Exterior Inspection', icon: Car },
    { id: 5, label: 'Interior Inspection', icon: Sofa },
    { id: 6, label: 'Engine & Mechanical', icon: Wrench },
    { id: 7, label: 'Test Drive', icon: Gauge },
    { id: 8, label: 'Location Verification', icon: MapPin },
    { id: 9, label: 'Photos & Evidence', icon: Camera },
    { id: 10, label: 'Final Decision', icon: ClipboardCheck },
];


const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];

const StepShell = ({ title, subtitle, children }) => (
    <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-5">{children}</div>
    </div>
);

const CheckboxRow = ({ label, checked, onChange }) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[#001f3f]/20">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#001f3f]" />
        <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
);

const TextArea = (props) => (
    <textarea
        {...props}
        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
    />
);

// ---- Steps 4/5/6 share this ----
const ItemChecklist = ({ items, values, onChange }) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
            const val = values[item] || { condition: '', remarks: '' };
            return (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="mb-2 text-sm font-semibold text-slate-800">{item}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {CONDITIONS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => onChange(item, { ...val, condition: c })}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${val.condition === c ? 'border-[#001f3f] bg-[#001f3f] text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-[#001f3f]/30'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    <input
                        value={val.remarks}
                        onChange={(e) => onChange(item, { ...val, remarks: e.target.value })}
                        placeholder="Notes (optional)"
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-[#001f3f] focus:outline-none"
                    />
                </div>
            );
        })}
    </div>
);

// ---- Document Card (Step 2) ----
const statusStyles = {
    PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
    VERIFIED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    REJECTED: 'border-red-200 bg-red-50 text-red-700',
    MISSING: 'border-slate-200 bg-slate-100 text-slate-600',
    EXPIRED: 'border-orange-200 bg-orange-50 text-orange-700',
    MISMATCH: 'border-red-200 bg-red-50 text-red-700',
};

// Insert fl_attachment right after /upload/ in the Cloudinary URL so the link forces a download.
const toDownloadUrl = (url) => (url ? url.replace('/upload/', '/upload/fl_attachment/') : url);

const DocumentCard = ({ doc, onChange }) => {
    const isImage = doc.documentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.documentUrl);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                {/* Thumbnail / preview */}
                <div className="shrink-0 sm:w-36">
                    {doc.documentUrl ? (
                        isImage ? (
                            <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200">
                                <img src={doc.documentUrl} alt={doc.label} className="h-24 w-full object-cover sm:h-28" />
                            </a>
                        ) : (
                            <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:border-[#001f3f]/30 sm:h-28"
                            >
                                <FileText size={22} />
                                <span className="text-[10px] font-semibold">View File</span>
                            </a>
                        )
                    ) : (
                        <div className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300 sm:h-28">
                            <FileText size={20} />
                            <span className="text-[10px] font-medium">Not uploaded</span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-bold text-slate-900">{doc.label}</p>
                            <p className="text-xs text-slate-400">{doc.documentType.replace('_', ' ')}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[doc.status] || statusStyles.PENDING}`}>
                            {doc.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <input
                            value={doc.documentNumber}
                            onChange={(e) => onChange({ ...doc, documentNumber: e.target.value })}
                            placeholder="Document number (e.g. MH12AB1234)"
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#001f3f] focus:bg-white focus:outline-none"
                        />
                        <div className="flex gap-1.5">
                            {doc.documentUrl && (
                                <>
                                    <a
                                        href={doc.documentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#001f3f]/20 bg-[#e6f2ff] px-2.5 py-2 text-[11px] font-semibold text-[#001f3f] transition hover:bg-[#d5eaff]"
                                    >
                                        <Eye size={12} /> View
                                    </a>
                                    <a
                                        href={toDownloadUrl(doc.documentUrl)}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        <Download size={12} /> Download
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Verification status buttons */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {['PENDING', 'VERIFIED', 'REJECTED', 'MISSING', 'EXPIRED', 'MISMATCH'].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => onChange({ ...doc, status: s, rejectionReason: s === 'REJECTED' ? doc.rejectionReason : '' })}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${doc.status === s ? statusStyles[s] : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                    }`}
                            >
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <input
                        value={doc.remarks}
                        onChange={(e) => onChange({ ...doc, remarks: e.target.value })}
                        placeholder="Remarks (optional)"
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#001f3f] focus:bg-white focus:outline-none"
                    />

                    {/* Rejection reason — only when rejected, required */}
                    {doc.status === 'REJECTED' && (
                        <div className="mt-2">
                            <input
                                value={doc.rejectionReason}
                                onChange={(e) => onChange({ ...doc, rejectionReason: e.target.value })}
                                placeholder="Rejection reason (required)"
                                className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-700 placeholder:text-red-400 focus:outline-none ${!doc.rejectionReason ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 focus:border-[#001f3f]'
                                    }`}
                            />
                            {!doc.rejectionReason && (
                                <p className="mt-1 text-[11px] font-medium text-red-500">Rejection reason is required before continuing.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const InspectionVerify = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const { data, isLoading } = useGetInspectionByIdQuery(id);
    const inspection = data?.data;

    const [updateSeller] = useUpdateSellerVerificationMutation();
    const [updateDocs] = useUpdateDocumentVerificationMutation();
    const [updateIdentity] = useUpdateVehicleIdentityMutation();
    const [updateCheck] = useUpdateVehicleCheckMutation();
    const [updateTestDrive] = useUpdateTestDriveMutation();
    const [updateLocation] = useUpdateLocationMutation();
    const [uploadPhotos] = useUploadInspectionPhotosMutation();
    const [submitInspection, { isLoading: submitting }] = useSubmitInspectionMutation();

    // ---- Step 1: Seller ----
    const [sellerChecks, setSellerChecks] = useState({ identity: false, present: false, phone: false, address: false, owns: false, authorized: false });
    const [sellerNotes, setSellerNotes] = useState('');

    // ---- Step 2: Documents ----
    const DOC_CONFIG = [
        { type: 'RC', label: 'Registration Certificate', urlKey: 'rcFront' },
        { type: 'INSURANCE', label: 'Insurance', urlKey: 'insuranceDocument' },
        { type: 'POLLUTION', label: 'Pollution Certificate (PUC)', urlKey: null },
        { type: 'OWNERSHIP_PROOF', label: 'Ownership Proof', urlKey: null },
        { type: 'OTHER', label: 'Other Document', urlKey: null },
    ];

    const [docs, setDocs] = useState(
        DOC_CONFIG.map((cfg) => ({
            documentType: cfg.type,
            label: cfg.label,
            documentUrl: inspection?.vehicleListing?.[cfg.urlKey] || null,
            documentNumber: '',
            status: 'PENDING',
            remarks: '',
            rejectionReason: '',
        }))
    );
    useEffect(() => {
        if (inspection?.vehicleListing) {
            setDocs(DOC_CONFIG.map((cfg) => {
                const existing = inspection.documents?.find((d) => d.documentType === cfg.type);
                return {
                    documentType: cfg.type,
                    label: cfg.label,
                    documentUrl: existing?.documentUrl || inspection.vehicleListing[cfg.urlKey] || null,
                    documentNumber: existing?.documentNumber || '',
                    status: existing?.status || 'PENDING',
                    remarks: existing?.remarks || '',
                    rejectionReason: existing?.rejectionReason || '',
                };
            }));
        }
    }, [inspection?.vehicleListing, inspection?.documents]);

    // ---- Step 3: Identity ----
    const [identity, setIdentity] = useState({ observedRegistrationNumber: '', observedVin: '', observedEngineNumber: '', registrationMatch: false, vinMatch: false, engineMatch: false, notes: '' });

    // ---- Steps 4/5/6 ----
    const EXTERIOR_ITEMS = ['Front', 'Rear', 'Left Side', 'Right Side', 'Bonnet', 'Boot', 'Doors', 'Windows', 'Lights', 'Tyres', 'Bumpers', 'Windshield'];
    const INTERIOR_ITEMS = ['Dashboard', 'Seats', 'Seat Belts', 'AC', 'Infotainment', 'Power Windows', 'Central Locking', 'Steering', 'Horn', 'Floor/Carpet', 'Boot Interior'];
    const MECHANICAL_ITEMS = ['Engine Start', 'Engine Sound', 'Oil Leakage', 'Coolant Leakage', 'Brakes', 'Clutch', 'Gearbox', 'Suspension', 'Battery'];
    const [exterior, setExterior] = useState({});
    const [interior, setInterior] = useState({});
    const [mechanical, setMechanical] = useState({});
    const [exteriorNotes, setExteriorNotes] = useState('');
    const [interiorNotes, setInteriorNotes] = useState('');
    const [mechanicalNotes, setMechanicalNotes] = useState('');

    // ---- Step 7: Test Drive ----
    const [testDriveDone, setTestDriveDone] = useState(true);
    const [testDriveRating, setTestDriveRating] = useState(0);
    const [testDriveNotes, setTestDriveNotes] = useState('');
    const [skipReason, setSkipReason] = useState('');

    // ---- Step 8: Location ----
    const [actualAddress, setActualAddress] = useState('');
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [locationMatched, setLocationMatched] = useState(false);
    const [vehiclePresent, setVehiclePresent] = useState(false);
    const [sellerPresent, setSellerPresent] = useState(false);
    const [locationRemarks, setLocationRemarks] = useState('');

    // ---- Step 9: Photos ----
    const [photoCategory, setPhotoCategory] = useState('Vehicle Front');
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    // ---- Step 10: Final ----
    const [finalResult, setFinalResult] = useState('VERIFIED');
    const [finalRating, setFinalRating] = useState(0);
    const [finalNotes, setFinalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [correctionReason, setCorrectionReason] = useState('');
    const STORAGE_KEY = `field-inspection-draft:${id}`;

    const buildDraftPayload = () => ({
        id,
        inspectionNo: inspection?.inspectionNo,
        step,
        sellerChecks,
        sellerNotes,
        docs,
        identity,
        exterior,
        interior,
        mechanical,
        exteriorNotes,
        interiorNotes,
        mechanicalNotes,
        testDriveDone,
        testDriveRating,
        testDriveNotes,
        skipReason,
        actualAddress,
        coords,
        locationMatched,
        vehiclePresent,
        sellerPresent,
        locationRemarks,
        photoCategory,
        finalResult,
        finalRating,
        finalNotes,
        rejectionReason,
        correctionReason,
    });

    useEffect(() => {
        if (!inspection || !id) return;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            const draft = JSON.parse(saved);
            if (!draft || draft.id !== id) return;

            if (typeof draft.step === 'number') setStep(draft.step);
            if (draft.sellerChecks) setSellerChecks(draft.sellerChecks);
            if (draft.sellerNotes !== undefined) setSellerNotes(draft.sellerNotes);
            if (draft.docs?.length) setDocs(draft.docs);
            if (draft.identity) setIdentity(draft.identity);
            if (draft.exterior) setExterior(draft.exterior);
            if (draft.interior) setInterior(draft.interior);
            if (draft.mechanical) setMechanical(draft.mechanical);
            if (draft.exteriorNotes !== undefined) setExteriorNotes(draft.exteriorNotes);
            if (draft.interiorNotes !== undefined) setInteriorNotes(draft.interiorNotes);
            if (draft.mechanicalNotes !== undefined) setMechanicalNotes(draft.mechanicalNotes);
            if (draft.testDriveDone !== undefined) setTestDriveDone(draft.testDriveDone);
            if (draft.testDriveRating !== undefined) setTestDriveRating(draft.testDriveRating);
            if (draft.testDriveNotes !== undefined) setTestDriveNotes(draft.testDriveNotes);
            if (draft.skipReason !== undefined) setSkipReason(draft.skipReason);
            if (draft.actualAddress !== undefined) setActualAddress(draft.actualAddress);
            if (draft.coords) setCoords(draft.coords);
            if (draft.locationMatched !== undefined) setLocationMatched(draft.locationMatched);
            if (draft.vehiclePresent !== undefined) setVehiclePresent(draft.vehiclePresent);
            if (draft.sellerPresent !== undefined) setSellerPresent(draft.sellerPresent);
            if (draft.locationRemarks !== undefined) setLocationRemarks(draft.locationRemarks);
            if (draft.photoCategory) setPhotoCategory(draft.photoCategory);
            if (draft.finalResult) setFinalResult(draft.finalResult);
            if (draft.finalRating !== undefined) setFinalRating(draft.finalRating);
            if (draft.finalNotes !== undefined) setFinalNotes(draft.finalNotes);
            if (draft.rejectionReason !== undefined) setRejectionReason(draft.rejectionReason);
            if (draft.correctionReason !== undefined) setCorrectionReason(draft.correctionReason);
        } catch (error) {
            console.warn('Unable to restore inspection draft', error);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [inspection, id, STORAGE_KEY]);

    useEffect(() => {
        if (!inspection || !id) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buildDraftPayload()));
    }, [inspection, id, step, sellerChecks, sellerNotes, docs, identity, exterior, interior, mechanical, exteriorNotes, interiorNotes, mechanicalNotes, testDriveDone, testDriveRating, testDriveNotes, skipReason, actualAddress, coords, locationMatched, vehiclePresent, sellerPresent, locationRemarks, photoCategory, finalResult, finalRating, finalNotes, rejectionReason, correctionReason]);

    // Resume where the inspector left off: jump to the first incomplete step and
    // refill each step's fields from whatever was already saved to the backend.
    const hydratedRef = useRef(false);
    useEffect(() => {
        if (hydratedRef.current || !inspection) return;
        hydratedRef.current = true;

        const checklist = inspection.checklist || {};
        const vehicleChecks = inspection.vehicleChecks || [];
        const getCheck = (category, item) => vehicleChecks.find((c) => c.category === category && c.item === item);

        const stepFlags = [
            checklist.sellerVerified, checklist.documentsVerified, checklist.vehicleIdentityVerified,
            checklist.exteriorVerified, checklist.interiorVerified, checklist.mechanicalVerified,
            checklist.testDriveCompleted, checklist.locationVerified, checklist.photosCompleted,
        ];
        const firstIncomplete = stepFlags.findIndex((done) => !done);
        setStep(firstIncomplete === -1 ? 10 : firstIncomplete + 1);

        if (checklist.sellerVerified) {
            setSellerChecks({ identity: true, present: true, phone: true, address: true, owns: true, authorized: true });
        }
        if (checklist.sellerNotes) setSellerNotes(checklist.sellerNotes);

        const regCheck = getCheck('Identity', 'Registration Number Match');
        const vinCheck = getCheck('Identity', 'VIN/Chassis Number Match');
        const engineCheck = getCheck('Identity', 'Engine Number Match');
        if (regCheck || vinCheck || engineCheck) {
            setIdentity({
                observedRegistrationNumber: regCheck?.remarks || '',
                observedVin: vinCheck?.remarks || '',
                observedEngineNumber: engineCheck?.remarks || '',
                registrationMatch: regCheck?.status === 'VERIFIED',
                vinMatch: vinCheck?.status === 'VERIFIED',
                engineMatch: engineCheck?.status === 'VERIFIED',
                notes: checklist.identityNotes || '',
            });
        }

        const buildItemMap = (category) => {
            const map = {};
            vehicleChecks.filter((c) => c.category === category).forEach((c) => {
                map[c.item] = { condition: c.condition || '', remarks: c.remarks || '' };
            });
            return map;
        };
        if (vehicleChecks.some((c) => c.category === 'Exterior')) setExterior(buildItemMap('Exterior'));
        if (vehicleChecks.some((c) => c.category === 'Interior')) setInterior(buildItemMap('Interior'));
        if (vehicleChecks.some((c) => c.category === 'Mechanical')) setMechanical(buildItemMap('Mechanical'));
        if (checklist.exteriorNotes) setExteriorNotes(checklist.exteriorNotes);
        if (checklist.interiorNotes) setInteriorNotes(checklist.interiorNotes);
        if (checklist.mechanicalNotes) setMechanicalNotes(checklist.mechanicalNotes);

        const testDriveCheck = vehicleChecks.find((c) => c.category === 'TestDrive');
        if (testDriveCheck) {
            const done = testDriveCheck.status === 'VERIFIED';
            setTestDriveDone(done);
            if (done) {
                const ratingMatch = /Rating: (\d+)\/5/.exec(testDriveCheck.remarks || '');
                if (ratingMatch) setTestDriveRating(Number(ratingMatch[1]));
            } else {
                setSkipReason(testDriveCheck.remarks || '');
            }
        }
        if (checklist.testDriveNotes) setTestDriveNotes(checklist.testDriveNotes);

        if (inspection.location) {
            const loc = inspection.location;
            setActualAddress(loc.actualAddress || '');
            setCoords({ lat: loc.actualLatitude ?? null, lng: loc.actualLongitude ?? null });
            setLocationMatched(!!loc.locationMatched);
            setVehiclePresent(!!loc.vehiclePresent);
            setSellerPresent(!!loc.sellerPresent);
            setLocationRemarks(loc.remarks || '');
        }
    }, [inspection]);

    if (isLoading || !inspection) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    }

    const goNext = () => setStep((s) => Math.min(s + 1, 10));
    const goBack = () => setStep((s) => Math.max(s - 1, 1));

    const captureLocation = () => {
        if (!navigator.geolocation) return toast.error('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(
            (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => toast.error('Unable to capture location')
        );
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const formData = new FormData();
        files.forEach((f) => formData.append('photos', f));
        formData.append('category', photoCategory);
        setUploadingPhotos(true);
        try {
            await uploadPhotos({ id, formData }).unwrap();
            toast.success('Photos uploaded');
        } catch (err) {
            toast.error(err?.data?.message || 'Upload failed');
        } finally {
            setUploadingPhotos(false);
            e.target.value = '';
        }
    };
    const handleSaveStep = async () => {
        try {
            if (step === 1) {
                await updateSeller({ id, checks: sellerChecks, notes: sellerNotes, status: Object.values(sellerChecks).every(Boolean) ? 'VERIFIED' : 'NEEDS_CORRECTION' }).unwrap();
            } else if (step === 2) {
                const uploadedDocs = docs.filter((d) => d.documentUrl);
                const missingReason = uploadedDocs.find((d) => d.status === 'REJECTED' && !d.rejectionReason?.trim());
                if (missingReason) {
                    toast.error(`Please provide a rejection reason for ${missingReason.label}`);
                    return;
                }
                await updateDocs({ id, documents: uploadedDocs }).unwrap();
            } else if (step === 3) {
                const allMatch = identity.registrationMatch && identity.vinMatch && identity.engineMatch;
                await updateIdentity({ id, ...identity, status: allMatch ? 'MATCHED' : 'MISMATCH' }).unwrap();
            } else if (step === 4) {
                await updateCheck({ id, category: 'Exterior', items: EXTERIOR_ITEMS.map((i) => ({ item: i, condition: exterior[i]?.condition, status: exterior[i]?.condition ? 'VERIFIED' : 'PENDING', remarks: exterior[i]?.remarks })), notes: exteriorNotes }).unwrap();
            } else if (step === 5) {
                await updateCheck({ id, category: 'Interior', items: INTERIOR_ITEMS.map((i) => ({ item: i, condition: interior[i]?.condition, status: interior[i]?.condition ? 'VERIFIED' : 'PENDING', remarks: interior[i]?.remarks })), notes: interiorNotes }).unwrap();
            } else if (step === 6) {
                await updateCheck({ id, category: 'Mechanical', items: MECHANICAL_ITEMS.map((i) => ({ item: i, condition: mechanical[i]?.condition, status: mechanical[i]?.condition ? 'VERIFIED' : 'PENDING', remarks: mechanical[i]?.remarks })), notes: mechanicalNotes }).unwrap();
            } else if (step === 7) {
                await updateTestDrive({ id, completed: testDriveDone, rating: testDriveRating, notes: testDriveNotes, reasonIfSkipped: skipReason }).unwrap();
            } else if (step === 8) {
                await updateLocation({ id, actualAddress, actualLatitude: coords.lat, actualLongitude: coords.lng, locationMatched, vehiclePresent, sellerPresent, remarks: locationRemarks }).unwrap();
            }
            toast.success('Saved');
            if (step < 10) goNext();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save this step');
        }
    };

    const handleSubmitFinal = async () => {
        try {
            await submitInspection({ id, result: finalResult, finalRating: finalRating || undefined, finalNotes, rejectionReason, correctionReason }).unwrap();
            localStorage.removeItem(STORAGE_KEY);
            toast.success('Inspection submitted successfully');
            navigate(`/field-inspector/reports/${id}`);
        } catch (err) {
            const incomplete = err?.data?.data?.incomplete;
            toast.error(
                incomplete ? `Please complete: ${incomplete.join(', ')}` : (err?.data?.message || 'Submission failed')
            );
        }
    };

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Verify — {inspection.inspectionNo} | VehicleHub Inspector</title></Helmet>

            {/* Sticky header with progress */}
            <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="font-mono text-xs font-semibold text-[#001f3f]">{inspection.inspectionNo}</p>
                        <h1 className="text-lg font-bold text-slate-900">{inspection.vehicleListing?.title}</h1>
                    </div>
                    <span className="rounded-full bg-[#e6f2ff] px-3 py-1.5 text-sm font-bold text-[#001f3f]">{step} / 10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#001f3f] transition-all duration-300" style={{ width: `${(step / 10) * 100}%` }} />
                </div>
                <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                    {STEPS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setStep(s.id)}
                                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${step === s.id ? 'bg-[#001f3f] text-white' : step > s.id ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {step > s.id ? <Check size={11} /> : <Icon size={11} />} {s.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* STEP 1 — Seller Verification */}
            {step === 1 && (
                <StepShell title="Step 1 — Seller Verification" subtitle="Confirm the seller's identity and authorization.">
                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div><p className="text-xs text-slate-400">Name</p><p className="text-sm font-semibold text-slate-800">{inspection.seller?.fullName}</p></div>
                        <div><p className="text-xs text-slate-400">Phone</p><p className="text-sm font-semibold text-slate-800">{inspection.seller?.phone}</p></div>
                        <div><p className="text-xs text-slate-400">Email</p><p className="text-sm font-semibold text-slate-800">{inspection.seller?.email}</p></div>
                    </div>
                    <div className="space-y-2.5">
                        <CheckboxRow label="Seller identity matches account" checked={sellerChecks.identity} onChange={(v) => setSellerChecks({ ...sellerChecks, identity: v })} />
                        <CheckboxRow label="Seller is physically present" checked={sellerChecks.present} onChange={(v) => setSellerChecks({ ...sellerChecks, present: v })} />
                        <CheckboxRow label="Seller mobile number verified" checked={sellerChecks.phone} onChange={(v) => setSellerChecks({ ...sellerChecks, phone: v })} />
                        <CheckboxRow label="Seller address verified" checked={sellerChecks.address} onChange={(v) => setSellerChecks({ ...sellerChecks, address: v })} />
                        <CheckboxRow label="Seller owns vehicle" checked={sellerChecks.owns} onChange={(v) => setSellerChecks({ ...sellerChecks, owns: v })} />
                        <CheckboxRow label="Seller authorization confirmed" checked={sellerChecks.authorized} onChange={(v) => setSellerChecks({ ...sellerChecks, authorized: v })} />
                    </div>
                    <div className="mt-4"><TextArea rows={3} value={sellerNotes} onChange={(e) => setSellerNotes(e.target.value)} placeholder="Inspector remarks..." /></div>
                </StepShell>
            )}

            {/* STEP 2 — Documents */}
            {step === 2 && (
                <StepShell title="Step 2 — Document Verification" subtitle="Review each document submitted by the seller.">
                    <div className="space-y-4">
                        {docs.filter((doc) => doc.documentUrl).map((doc) => (
                            <DocumentCard
                                key={doc.documentType}
                                doc={doc}
                                onChange={(updated) => {
                                    setDocs((prev) => prev.map((d) => (d.documentType === updated.documentType ? updated : d)));
                                }}
                            />
                        ))}
                        {!docs.some((doc) => doc.documentUrl) && (
                            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
                                No documents have been uploaded by the seller yet. You can continue — documents will appear here once uploaded.
                            </p>
                        )}
                    </div>
                </StepShell>
            )}

            {/* STEP 3 — Vehicle Identity */}
            {step === 3 && (
                <StepShell title="Step 3 — Vehicle Identity Verification" subtitle="Compare physical vehicle against listing data.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="mb-1 text-xs text-slate-400">Listed Registration No.</p>
                            <p className="mb-2 text-sm font-semibold text-slate-800">{inspection.vehicleListing?.registrationNumber || '—'}</p>
                            <input value={identity.observedRegistrationNumber} onChange={(e) => setIdentity({ ...identity, observedRegistrationNumber: e.target.value })} placeholder="Observed reg. number" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#001f3f] focus:outline-none" />
                            <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                                <input type="checkbox" checked={identity.registrationMatch} onChange={(e) => setIdentity({ ...identity, registrationMatch: e.target.checked })} className="accent-[#001f3f]" /> Matches
                            </label>
                        </div>
                        <div>
                            <p className="mb-1 text-xs text-slate-400">Listed VIN/Chassis</p>
                            <p className="mb-2 text-sm font-semibold text-slate-800">{inspection.vehicleListing?.vin || '—'}</p>
                            <input value={identity.observedVin} onChange={(e) => setIdentity({ ...identity, observedVin: e.target.value })} placeholder="Observed VIN" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#001f3f] focus:outline-none" />
                            <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                                <input type="checkbox" checked={identity.vinMatch} onChange={(e) => setIdentity({ ...identity, vinMatch: e.target.checked })} className="accent-[#001f3f]" /> Matches
                            </label>
                        </div>
                        <div>
                            <p className="mb-1 text-xs text-slate-400">Engine Number (observed)</p>
                            <input value={identity.observedEngineNumber} onChange={(e) => setIdentity({ ...identity, observedEngineNumber: e.target.value })} placeholder="Observed engine number" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#001f3f] focus:outline-none" />
                            <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                                <input type="checkbox" checked={identity.engineMatch} onChange={(e) => setIdentity({ ...identity, engineMatch: e.target.checked })} className="accent-[#001f3f]" /> Matches
                            </label>
                        </div>
                    </div>
                    <div className="mt-4"><TextArea rows={3} value={identity.notes} onChange={(e) => setIdentity({ ...identity, notes: e.target.value })} placeholder="Mismatch details / notes..." /></div>
                </StepShell>
            )}

            {/* STEP 4 — Exterior */}
            {step === 4 && (
                <StepShell title="Step 4 — Exterior Inspection" subtitle="Inspect each exterior component and rate its condition.">
                    <ItemChecklist items={EXTERIOR_ITEMS} values={exterior} onChange={(item, val) => setExterior({ ...exterior, [item]: val })} />
                    <div className="mt-4"><TextArea rows={3} value={exteriorNotes} onChange={(e) => setExteriorNotes(e.target.value)} placeholder="Overall exterior notes..." /></div>
                </StepShell>
            )}

            {/* STEP 5 — Interior */}
            {step === 5 && (
                <StepShell title="Step 5 — Interior Inspection" subtitle="Inspect interior components.">
                    <ItemChecklist items={INTERIOR_ITEMS} values={interior} onChange={(item, val) => setInterior({ ...interior, [item]: val })} />
                    <div className="mt-4"><TextArea rows={3} value={interiorNotes} onChange={(e) => setInteriorNotes(e.target.value)} placeholder="Overall interior notes..." /></div>
                </StepShell>
            )}

            {/* STEP 6 — Mechanical */}
            {step === 6 && (
                <StepShell title="Step 6 — Engine & Mechanical" subtitle="Check mechanical systems.">
                    <ItemChecklist items={MECHANICAL_ITEMS} values={mechanical} onChange={(item, val) => setMechanical({ ...mechanical, [item]: val })} />
                    <div className="mt-4"><TextArea rows={3} value={mechanicalNotes} onChange={(e) => setMechanicalNotes(e.target.value)} placeholder="Mechanical notes / warning lights..." /></div>
                </StepShell>
            )}

            {/* STEP 7 — Test Drive */}
            {step === 7 && (
                <StepShell title="Step 7 — Test Drive" subtitle="Record test drive performance.">
                    <div className="mb-4 flex gap-2">
                        <button onClick={() => setTestDriveDone(true)} className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition ${testDriveDone ? 'border-[#001f3f] bg-[#e6f2ff] text-[#001f3f]' : 'border-slate-200 text-slate-500'}`}>Test Drive Completed</button>
                        <button onClick={() => setTestDriveDone(false)} className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition ${!testDriveDone ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-200 text-slate-500'}`}>Skipped</button>
                    </div>
                    {testDriveDone ? (
                        <>
                            <p className="mb-2 text-sm font-semibold text-slate-700">Overall rating</p>
                            <div className="mb-4 flex gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button key={n} onClick={() => setTestDriveRating(n)}>
                                        <Star size={26} className={n <= testDriveRating ? 'fill-[#001f3f] text-[#001f3f]' : 'text-slate-300'} />
                                    </button>
                                ))}
                            </div>
                            <TextArea rows={4} value={testDriveNotes} onChange={(e) => setTestDriveNotes(e.target.value)} placeholder="Acceleration, braking, steering, gear shifting, suspension, noise, AC, overall drive..." />
                        </>
                    ) : (
                        <TextArea rows={3} value={skipReason} onChange={(e) => setSkipReason(e.target.value)} placeholder="Reason for skipping test drive (required)..." />
                    )}
                </StepShell>
            )}

            {/* STEP 8 — Location */}
            {step === 8 && (
                <StepShell title="Step 8 — Location Verification" subtitle="Confirm the vehicle's physical location.">
                    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-400">Expected Location</p>
                        <p className="text-sm font-semibold text-slate-800">
                            {[inspection.vehicleListing?.area, inspection.vehicleListing?.city, inspection.vehicleListing?.state].filter(Boolean).join(', ') || 'Not set'}
                        </p>
                    </div>
                    <input value={actualAddress} onChange={(e) => setActualAddress(e.target.value)} placeholder="Actual address observed" className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#001f3f] focus:outline-none" />
                    <button onClick={captureLocation} className="mb-4 flex items-center gap-2 rounded-xl border-2 border-[#001f3f] px-4 py-2.5 text-sm font-bold text-[#001f3f] transition hover:bg-[#e6f2ff]">
                        <Navigation size={15} /> Capture Current Location
                    </button>
                    {coords.lat && <p className="mb-4 text-xs text-slate-500">Captured: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>}
                    <div className="space-y-2.5">
                        <CheckboxRow label="Vehicle is physically present" checked={vehiclePresent} onChange={setVehiclePresent} />
                        <CheckboxRow label="Vehicle location matches seller location" checked={locationMatched} onChange={setLocationMatched} />
                        <CheckboxRow label="Seller is present" checked={sellerPresent} onChange={setSellerPresent} />
                    </div>
                    <div className="mt-4"><TextArea rows={3} value={locationRemarks} onChange={(e) => setLocationRemarks(e.target.value)} placeholder="Location notes..." /></div>
                </StepShell>
            )}

            {/* STEP 9 — Photos */}
            {step === 9 && (
                <StepShell title="Step 9 — Photos & Evidence" subtitle="Upload evidence photos by category.">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <select value={photoCategory} onChange={(e) => setPhotoCategory(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#001f3f] focus:outline-none">
                            {['Vehicle Front', 'Vehicle Rear', 'Vehicle Left', 'Vehicle Right', 'Interior', 'Dashboard', 'Engine', 'Tyres', 'RC', 'Insurance', 'VIN/Chassis', 'Engine Number', 'Registration Plate', 'Damage', 'Other'].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#002a55]">
                            {uploadingPhotos ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                            Upload Photos
                            <input type="file" accept="image/*" multiple hidden onChange={handlePhotoUpload} disabled={uploadingPhotos} />
                        </label>
                    </div>
                    {inspection.photos?.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                            {inspection.photos.map((p) => (
                                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                                    <img src={p.imageUrl} alt={p.category} className="h-full w-full object-cover" />
                                    <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white">{p.category}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-center text-sm text-slate-400">No photos uploaded yet.</p>
                    )}
                </StepShell>
            )}

            {/* STEP 10 — Final Decision */}
            {step === 10 && (
                <StepShell title="Step 10 — Final Inspection Decision" subtitle="Review everything and submit your final verdict.">
                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                            { value: 'VERIFIED', label: 'Verified', color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
                            { value: 'REJECTED', label: 'Rejected', color: 'border-red-300 bg-red-50 text-red-700' },
                            { value: 'NEEDS_CORRECTION', label: 'Needs Correction', color: 'border-amber-300 bg-amber-50 text-amber-700' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFinalResult(opt.value)}
                                className={`rounded-xl border-2 py-4 text-sm font-bold transition ${finalResult === opt.value ? opt.color : 'border-slate-200 text-slate-400'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {finalResult === 'REJECTED' && (
                        <TextArea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Rejection reason (required)..." />
                    )}
                    {finalResult === 'NEEDS_CORRECTION' && (
                        <TextArea rows={3} value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} placeholder="Correction reason (required)..." />
                    )}

                    <p className="mb-2 mt-4 text-sm font-semibold text-slate-700">Overall inspector rating</p>
                    <div className="mb-4 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} onClick={() => setFinalRating(n)}>
                                <Star size={28} className={n <= finalRating ? 'fill-[#001f3f] text-[#001f3f]' : 'text-slate-300'} />
                            </button>
                        ))}
                    </div>

                    <TextArea rows={4} value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)} placeholder="Final notes..." />

                    <button
                        onClick={handleSubmitFinal}
                        disabled={submitting}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-lg disabled:opacity-60"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Submit Final Inspection
                    </button>
                </StepShell>
            )}

            {/* Sticky bottom action bar */}
            <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-xl">
                <button onClick={goBack} disabled={step === 1} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                    <ArrowLeft size={15} /> Previous
                </button>
                {step < 10 && (
                    <button onClick={handleSaveStep} className="flex items-center gap-1.5 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#002a55]">
                        <Save size={15} /> Save & Continue <ArrowRight size={15} />
                    </button>
                )}
            </div>
        </div>
    );
};