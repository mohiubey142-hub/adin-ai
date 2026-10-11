// src/components/cv-builder/components/MyDocuments.tsx
// ✅ FIXED: No header (App.tsx provides it)
// ✅ FIXED: No SidebarToggle (App.tsx provides it)
// ✅ FIXED: Content scrolls inside its own container
// ✅ FIXED: Neutral scrollbar (no purple)
// ✅ Removed GlobalSidebar render — App.tsx handles it
// ✅ UPDATED: DocumentCard uses paper design
// ✅ UPDATED: Download handler — PDF/TXT only (PNG available in editor only)
// ✅ NEW: Unlimited thumbnails — Intersection Observer in DocumentThumbnail handles perf

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Plus, FileText, Mail, ChevronDown, AlertTriangle, HardDrive } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useMyDocuments } from '../hooks/useMyDocuments';
import { useCoverLetters } from '../../cover-letter/hooks/useCoverLetters';
import { CVDocumentMeta } from '../types/documentTypes';
import DocumentCard from './DocumentCard';
import CVPreviewModal from './CVPreviewModal';
import CoverLetterPreviewModal from '../../cover-letter/components/CoverLetterPreviewModal';
import RemoveDocumentChoice from './RemoveDocumentChoice';
import {
    getStorageUsageMB,
    isStorageNearlyFull,
    isStorageCritical,
    loadDocumentData,
} from '../utils/storageUtils';
import { readCLDocument } from '../../cover-letter/utils/coverLetterStorage';

// ✅ Download generators
import { createDownloadActions } from '../handlers/downloadActions';

interface MyDocumentsProps {
    userId: string;
    onCreateNew: () => void;
    onEditDocument: (documentId: string) => void;
    onCreateCoverLetter?: () => void;
    onEditCoverLetter?: (documentId: string) => void;
    onBack?: () => void;
}

type TabKey = 'all' | 'resumes' | 'cover-letters';
type GroupKey = 'pinned' | 'today' | 'yesterday' | 'last7' | 'last28' | 'last30' | 'older';
type DownloadFormat = 'pdf' | 'txt';

interface QuickViewState {
    isOpen: boolean;
    id: string;
    kind: 'resume' | 'cover-letter';
    title: string;
}

interface RemoveChoiceState {
    isOpen: boolean;
    id: string;
    title: string;
    kind: 'resume' | 'cover-letter';
}

interface CombinedDoc {
    id: string;
    title: string;
    jobTitle?: string;
    template: string;
    lastEdited: number;
    pinned?: boolean;
    kind: 'resume' | 'cover-letter';
    data?: any | null;
    thumbnailUrl?: string | null;
}

// ✅ Unlimited — Intersection Observer in DocumentThumbnail handles perf
const LIVE_THUMBNAIL_LIMIT_PER_GROUP = Infinity;

const getStartOfDay = (date: Date = new Date()): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const groupGridCards = <T extends { id: string; lastEdited: number; pinned?: boolean }>(
    docs: T[]
): { key: GroupKey; label: string; items: T[] }[] => {
    const todayStart = getStartOfDay();
    const yesterdayStart = todayStart - 86400000;
    const last7Start = todayStart - 7 * 86400000;
    const last28Start = todayStart - 28 * 86400000;
    const last30Start = todayStart - 30 * 86400000;

    const pinned: T[] = [];
    const groups: Record<Exclude<GroupKey, 'pinned'>, T[]> = {
        today: [], yesterday: [], last7: [], last28: [], last30: [], older: [],
    };

    const sorted = [...docs].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return b.lastEdited - a.lastEdited;
    });

    sorted.forEach((doc) => {
        if (doc.pinned) { pinned.push(doc); return; }
        const ts = doc.lastEdited;
        if (ts >= todayStart) groups.today.push(doc);
        else if (ts >= yesterdayStart) groups.yesterday.push(doc);
        else if (ts >= last7Start) groups.last7.push(doc);
        else if (ts >= last28Start) groups.last28.push(doc);
        else if (ts >= last30Start) groups.last30.push(doc);
        else groups.older.push(doc);
    });

    const result: { key: GroupKey; label: string; items: T[] }[] = [];
    if (pinned.length > 0) result.push({ key: 'pinned', label: 'Pinned', items: pinned });
    if (groups.today.length > 0) result.push({ key: 'today', label: 'Today', items: groups.today });
    if (groups.yesterday.length > 0) result.push({ key: 'yesterday', label: 'Yesterday', items: groups.yesterday });
    if (groups.last7.length > 0) result.push({ key: 'last7', label: 'Last 7 Days', items: groups.last7 });
    if (groups.last28.length > 0) result.push({ key: 'last28', label: 'Last 28 Days', items: groups.last28 });
    if (groups.last30.length > 0) result.push({ key: 'last30', label: 'Last 30 Days', items: groups.last30 });
    if (groups.older.length > 0) result.push({ key: 'older', label: 'Older', items: groups.older });

    return result;
};

const MyDocuments: React.FC<MyDocumentsProps> = ({
    userId, onCreateNew, onEditDocument,
    onCreateCoverLetter, onEditCoverLetter,
}) => {
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const [emptyDropdownOpen, setEmptyDropdownOpen] = useState(false);
    const createDropdownRef = useRef<HTMLDivElement>(null);
    const emptyDropdownRef = useRef<HTMLDivElement>(null);

    const [quickView, setQuickView] = useState<QuickViewState>({
        isOpen: false, id: '', kind: 'resume', title: '',
    });

    const [removeChoice, setRemoveChoice] = useState<RemoveChoiceState>({
        isOpen: false, id: '', title: '', kind: 'resume',
    });

    const [storageMB, setStorageMB] = useState(0);
    const [storageWarning, setStorageWarning] = useState<'none' | 'warning' | 'critical'>('none');

    const [docDataMap, setDocDataMap] = useState<Record<string, any>>({});

    useEffect(() => {
        const updateStorage = () => {
            const mb = getStorageUsageMB();
            setStorageMB(mb);
            if (isStorageCritical()) setStorageWarning('critical');
            else if (isStorageNearlyFull()) setStorageWarning('warning');
            else setStorageWarning('none');
        };
        updateStorage();
        const interval = setInterval(updateStorage, 5000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (createDropdownRef.current && !createDropdownRef.current.contains(e.target as Node)) {
                setCreateDropdownOpen(false);
            }
            if (emptyDropdownRef.current && !emptyDropdownRef.current.contains(e.target as Node)) {
                setEmptyDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const {
        documents: resumeDocs, loading: resumeLoading, error: resumeError,
        removeDocument: removeResume,
        archiveDocument: archiveResume,
        togglePin: toggleResumePin,
        renameDocument: renameResume,
    } = useMyDocuments(userId);

    const {
        documents: coverDocs, loading: coverLoading, error: coverError,
        removeDocument: removeCover,
        archiveDocument: archiveCover,
        togglePin: toggleCoverPin,
        renameDocument: renameCover,
    } = useCoverLetters(userId);

    const loading = resumeLoading || coverLoading;
    const error = resumeError || coverError;

    const resumeDocsWithData = useMemo(
        () =>
            (resumeDocs || []).map((d: any) => ({
                ...d,
                data: docDataMap[d.id] ?? null,
                thumbnailUrl: null,
            })),
        [resumeDocs, docDataMap]
    );

    const coverDocsWithData = useMemo(
        () =>
            (coverDocs || []).map((d: any) => ({
                ...d,
                data: docDataMap[d.id] ?? null,
                thumbnailUrl: null,
            })),
        [coverDocs, docDataMap]
    );

    const allDocs: CombinedDoc[] = useMemo(() => {
        const resumes: CombinedDoc[] = resumeDocsWithData.map((d: any) => ({
            id: d.id,
            title: d.title,
            jobTitle: d.jobTitle,
            template: d.template,
            lastEdited: d.lastEdited,
            pinned: d.pinned,
            kind: 'resume',
            data: d.data,
            thumbnailUrl: d.thumbnailUrl,
        }));
        const covers: CombinedDoc[] = coverDocsWithData.map((d: any) => ({
            id: d.id,
            title: d.title,
            jobTitle: d.jobTitle,
            template: d.template,
            lastEdited: d.lastEdited,
            pinned: d.pinned,
            kind: 'cover-letter',
            data: d.data,
            thumbnailUrl: d.thumbnailUrl,
        }));
        return [...resumes, ...covers];
    }, [resumeDocsWithData, coverDocsWithData]);

    const allGroups = useMemo(() => groupGridCards(allDocs), [allDocs]);
    const resumeGroups = useMemo(() => groupGridCards(resumeDocsWithData), [resumeDocsWithData]);
    const coverGroups = useMemo(() => groupGridCards(coverDocsWithData), [coverDocsWithData]);

    const totalCount = (resumeDocs?.length || 0) + (coverDocs?.length || 0);

    useEffect(() => {
        if (loading) return;
        if (error) return;
        if (!userId) return;

        const toLoad = new Set<string>();

        const collectFrom = (groups: { items: { id: string; kind: 'resume' | 'cover-letter' }[] }[]) => {
            groups.forEach((group) => {
                group.items
                    .slice(0, LIVE_THUMBNAIL_LIMIT_PER_GROUP)
                    .forEach((doc) => toLoad.add(`${doc.kind}:${doc.id}`));
            });
        };

        collectFrom(allGroups as any);
        collectFrom(resumeGroups as any);
        collectFrom(coverGroups as any);

        const remaining = Array.from(toLoad).filter((key) => {
            const [, id] = key.split(':');
            return !(id in docDataMap);
        });
        if (remaining.length === 0) return;

        const scheduler: (cb: () => void) => number =
            typeof (window as any).requestIdleCallback === 'function'
                ? (cb) => (window as any).requestIdleCallback(cb, { timeout: 500 })
                : (cb) => window.setTimeout(cb, 1);

        let cancelled = false;

        const loadBatch = (index: number) => {
            if (cancelled) return;
            if (index >= remaining.length) return;

            const key = remaining[index];
            const [kind, id] = key.split(':') as ['resume' | 'cover-letter', string];

            let data: any = null;
            try {
                if (kind === 'resume') {
                    data = loadDocumentData(userId, id);
                } else {
                    data = readCLDocument(userId, id);
                }
            } catch (e) {
                console.warn('[MyDocuments] Failed to load thumbnail data for', key, e);
            }

            if (cancelled) return;

            setDocDataMap((prev) => (id in prev ? prev : { ...prev, [id]: data }));

            scheduler(() => loadBatch(index + 1));
        };

        scheduler(() => loadBatch(0));

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, error, userId, resumeDocs?.length, coverDocs?.length]);

    const closeQuickView = () => {
        setQuickView({ isOpen: false, id: '', kind: 'resume', title: '' });
    };

    const handleAllEdit = (id: string) => {
        const doc = allDocs.find(d => d.id === id);
        if (!doc) return;
        if (doc.kind === 'cover-letter') onEditCoverLetter?.(id);
        else onEditDocument(id);
    };

    const handleAllDelete = (id: string) => {
        const doc = allDocs.find(d => d.id === id);
        if (!doc) return;
        setRemoveChoice({
            isOpen: true,
            id: doc.id,
            title: doc.title,
            kind: doc.kind,
        });
    };

    const handleResumeDelete = (id: string) => {
        const doc = (resumeDocs || []).find((d: any) => d.id === id);
        if (!doc) return;
        setRemoveChoice({
            isOpen: true,
            id: doc.id,
            title: doc.title,
            kind: 'resume',
        });
    };

    const handleCoverDelete = (id: string) => {
        const doc = (coverDocs || []).find((d: any) => d.id === id);
        if (!doc) return;
        setRemoveChoice({
            isOpen: true,
            id: doc.id,
            title: doc.title,
            kind: 'cover-letter',
        });
    };

    const handleConfirmArchive = () => {
        const { id, kind } = removeChoice;
        if (kind === 'cover-letter') archiveCover(id);
        else archiveResume(id);
        setRemoveChoice({ isOpen: false, id: '', title: '', kind: 'resume' });
    };

    const handleConfirmDelete = () => {
        const { id, kind } = removeChoice;
        if (kind === 'cover-letter') removeCover(id);
        else removeResume(id);
        setRemoveChoice({ isOpen: false, id: '', title: '', kind: 'resume' });
    };

    const handleCancelRemove = () => {
        setRemoveChoice({ isOpen: false, id: '', title: '', kind: 'resume' });
    };

    const handleAllPin = (id: string) => {
        const doc = allDocs.find(d => d.id === id);
        if (!doc) return;
        if (doc.kind === 'cover-letter') toggleCoverPin(id);
        else toggleResumePin(id);
    };
    const handleAllRename = (id: string, newTitle: string) => {
        const doc = allDocs.find(d => d.id === id);
        if (!doc) return;
        if (doc.kind === 'cover-letter') renameCover(id, newTitle);
        else renameResume(id, newTitle);
    };

    // ═══════════════════════════════════════════════════════════
    // ✅ DOWNLOAD HANDLER — PDF / TXT only (PNG in editor)
    // ═══════════════════════════════════════════════════════════
    const handleDownload = useCallback(async (
        id: string,
        kind: 'resume' | 'cover-letter',
        format: DownloadFormat,
    ) => {
        const toastId = `dl-${id}-${format}`;
        try {
            toast.loading(`Generating ${format.toUpperCase()}...`, { id: toastId });

            if (kind === 'resume') {
                const data = loadDocumentData(userId, id);
                if (!data) {
                    toast.error('Document not found', { id: toastId });
                    return;
                }

                const getCompleteExperiences = (data.experiences || []).filter((exp: any) =>
                    exp.title?.trim() && exp.company?.trim() && exp.startDate?.trim() && exp.endDate?.trim() && exp.description?.trim()
                );

                const actions = createDownloadActions(
                    data.personalInfo || {},
                    data.phoneNumber || '',
                    data.selectedCountryCode || 'PK',
                    data.professionalSummary || '',
                    getCompleteExperiences,
                    data.educations || [],
                    data.projects || [],
                    data.certifications || [],
                    data.languages || [],
                    data.achievements || [],
                    data.skills || '',
                    data.template || 'modern',
                    data.profilePhoto || null,
                );

                const template = data.template || 'modern';

                if (format === 'pdf') {
                    switch (template) {
                        case 'classic': await actions.downloadClassicPDF(); break;
                        case 'minimal': await actions.downloadMinimalPDF(); break;
                        case 'modern': await actions.downloadModernPDF(); break;
                        case 'academic': await actions.downloadAcademicPDF(); break;
                        case 'creative': await actions.downloadCreativePDF(); break;
                        case 'teal-curve': await actions.downloadTealCurvePDF(); break;
                        case 'executive': await actions.downloadExecutivePDF(); break;
                        case 'standard': await actions.downloadStandardPDF(); break;
                        default: await actions.downloadPDF(); break;
                    }
                } else if (format === 'txt') {
                    await actions.downloadTXT();
                }

                toast.success('Downloaded!', { id: toastId });
            } else {
                // Cover letter
                const data = readCLDocument(userId, id);
                if (!data) {
                    toast.error('Document not found', { id: toastId });
                    return;
                }

                if (format === 'pdf') {
                    const { generateCoverLetterPDF } = await import('../../cover-letter/utils/pdfGenerator');
                    const pdfBlob = await generateCoverLetterPDF({
                        userName: data.userName || '',
                        email: data.email || '',
                        phoneNumber: data.phoneNumber || '',
                        selectedCountryCode: data.selectedCountryCode || '+92',
                        address: data.address || '',
                        linkedin: data.linkedin || '',
                        jobTitle: data.jobTitle || '',
                        company: data.company || '',
                        education: data.education || '',
                        experience: data.experience || '',
                        skills: data.skills || '',
                        additionalInfo: data.additionalInfo || '',
                        generatedLetter: data.generatedLetter || '',
                        selectedStyle: data.selectedStyle || 'professional',
                        profilePhoto: data.profilePhoto || null,
                        selectedTemplate: data.selectedTemplate || 'classic',
                        hiringManagerName: data.hiringManagerName || '',
                    });
                    const url = URL.createObjectURL(pdfBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `cover_letter_${(data.jobTitle || 'application').replace(/\s/g, '_')}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Downloaded!', { id: toastId });
                } else if (format === 'txt') {
                    const blob = new Blob([data.generatedLetter || ''], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `cover_letter_${(data.jobTitle || 'application').replace(/\s/g, '_')}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Downloaded!', { id: toastId });
                }
            }
        } catch (err) {
            console.error('[MyDocuments] Download failed:', err);
            toast.error('Download failed', { id: toastId });
        }
    }, [userId]);

    const handleCreateResume = () => {
        setCreateDropdownOpen(false);
        setEmptyDropdownOpen(false);
        onCreateNew();
    };
    const handleCreateCoverLetter = () => {
        setCreateDropdownOpen(false);
        setEmptyDropdownOpen(false);
        onCreateCoverLetter?.();
    };

    const galleryGridClass = "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-start";

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#ffffff', color: '#0f172a',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                        boxShadow: '0 10px 30px -10px rgba(2, 6, 23, 0.15)',
                    },
                }}
            />

            <div className="w-full h-full flex flex-col bg-slate-100 text-slate-900 overflow-hidden">
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

                        {storageWarning !== 'none' && (
                            <div className={`mb-5 rounded-xl border p-3.5 flex items-start gap-3 ${
                                storageWarning === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                            }`}>
                                <AlertTriangle size={18} className={storageWarning === 'critical' ? 'text-red-600' : 'text-amber-600'} />
                                <div className="flex-1 text-xs sm:text-sm">
                                    <p className={`font-semibold ${storageWarning === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                        {storageWarning === 'critical' ? 'Storage almost full!' : 'Storage getting full'}
                                    </p>
                                    <p className="text-slate-600 mt-0.5">
                                        Using {storageMB.toFixed(2)} MB. Delete or archive old documents to free up space.
                                    </p>
                                </div>
                            </div>
                        )}

                        {totalCount > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium uppercase tracking-wide mb-1">
                                        <FileText size={12} /> CVs
                                    </div>
                                    <p className="text-xl font-bold text-slate-900">{resumeDocs?.length || 0}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium uppercase tracking-wide mb-1">
                                        <Mail size={12} /> Cover Letters
                                    </div>
                                    <p className="text-xl font-bold text-slate-900">{coverDocs?.length || 0}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium uppercase tracking-wide mb-1">
                                        <HardDrive size={12} /> Storage
                                    </div>
                                    <p className="text-xl font-bold text-slate-900">
                                        {storageMB.toFixed(1)}<span className="text-xs font-medium text-slate-400 ml-0.5">MB</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Description + Create Button */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                            <div className="flex-1">
                                <p className="text-slate-600 text-sm sm:text-base">
                                    Manage and continue working on your saved career documents.
                                </p>
                            </div>

                            <div className="flex-shrink-0 self-start sm:self-auto">
                                {activeTab === 'all' && totalCount > 0 && (
                                    <div className="relative" ref={createDropdownRef}>
                                        <button
                                            onClick={() => setCreateDropdownOpen((v) => !v)}
                                            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold text-sm shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 whitespace-nowrap"
                                        >
                                            <Plus size={16} className="flex-shrink-0" />
                                            Create New
                                            <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-300 ${createDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {createDropdownOpen && (
                                            <div className="absolute right-0 top-full mt-2 z-30 w-56 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                                                <button onClick={handleCreateResume} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-purple-50 transition-colors duration-200">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm shadow-purple-600/20">
                                                        <FileText size={14} className="text-white" />
                                                    </div>
                                                    <span className="font-medium">Create New CV</span>
                                                </button>
                                                <div className="h-px bg-slate-100" />
                                                <button onClick={handleCreateCoverLetter} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-blue-50 transition-colors duration-200">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm shadow-blue-500/20">
                                                        <Mail size={14} className="text-white" />
                                                    </div>
                                                    <span className="font-medium">Create New Cover Letter</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'resumes' && (resumeDocs?.length || 0) > 0 && (
                                    <button
                                        onClick={onCreateNew}
                                        className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold text-sm shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 whitespace-nowrap"
                                    >
                                        <Plus size={16} className="flex-shrink-0" /> Create New CV
                                    </button>
                                )}

                                {activeTab === 'cover-letters' && (coverDocs?.length || 0) > 0 && (
                                    <button
                                        onClick={onCreateCoverLetter}
                                        className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 whitespace-nowrap"
                                    >
                                        <Plus size={16} className="flex-shrink-0" /> Create New Cover Letter
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tab buttons */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                            <div className="inline-grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm w-full max-w-md">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`min-w-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                        activeTab === 'all'
                                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-600/20'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab('resumes')}
                                    className={`min-w-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                        activeTab === 'resumes'
                                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-600/20'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    <FileText size={14} className="flex-shrink-0" />
                                    <span className="truncate">CVs</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('cover-letters')}
                                    className={`min-w-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                        activeTab === 'cover-letters'
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    <Mail size={14} className="flex-shrink-0" />
                                    <span className="truncate">Cover Letters</span>
                                </button>
                            </div>
                        </div>

                        {loading && (
                            <div className={galleryGridClass}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="rounded-2xl border border-slate-200 bg-slate-100 aspect-[3/4] animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!loading && error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* ALL TAB */}
                        {!loading && !error && activeTab === 'all' && (
                            <>
                                {totalCount === 0 ? (
                                    <EmptyState
                                        mode="all"
                                        emptyDropdownOpen={emptyDropdownOpen}
                                        setEmptyDropdownOpen={setEmptyDropdownOpen}
                                        emptyDropdownRef={emptyDropdownRef}
                                        onCreateResume={handleCreateResume}
                                        onCreateCoverLetter={handleCreateCoverLetter}
                                    />
                                ) : (
                                    <div className="space-y-10">
                                        {allGroups.map((group) => {
                                            const isPinnedGroup = group.key === 'pinned';
                                            return (
                                                <div key={group.key}>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <h2 className={`text-sm font-semibold tracking-wide uppercase ${isPinnedGroup ? 'text-amber-600' : 'text-slate-700'}`}>
                                                            {group.label}
                                                        </h2>
                                                        <span className="text-xs text-slate-400">({group.items.length})</span>
                                                        <div className={`flex-1 h-px ${isPinnedGroup ? 'bg-gradient-to-r from-amber-300 to-transparent' : 'bg-gradient-to-r from-purple-200 to-transparent'}`} />
                                                    </div>
                                                    <div className={galleryGridClass}>
                                                        {group.items.map((doc) => (
                                                            <DocumentCard
                                                                key={`${doc.kind}-${doc.id}`}
                                                                doc={doc as any}
                                                                userId={userId}
                                                                kind={doc.kind}
                                                                onEdit={handleAllEdit}
                                                                onDelete={handleAllDelete}
                                                                onTogglePin={handleAllPin}
                                                                onRename={handleAllRename}
                                                                onDownload={handleDownload}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* CVS TAB */}
                        {!loading && !error && activeTab === 'resumes' && (
                            <>
                                {(resumeDocs?.length || 0) === 0 ? (
                                    <EmptyState
                                        mode="resumes"
                                        onCreateResume={handleCreateResume}
                                        onCreateCoverLetter={handleCreateCoverLetter}
                                    />
                                ) : (
                                    <div className="space-y-10">
                                        {resumeGroups.map((group) => {
                                            const isPinnedGroup = group.key === 'pinned';
                                            return (
                                                <div key={group.key}>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <h2 className={`text-sm font-semibold tracking-wide uppercase ${isPinnedGroup ? 'text-amber-600' : 'text-slate-700'}`}>{group.label}</h2>
                                                        <span className="text-xs text-slate-400">({group.items.length})</span>
                                                        <div className={`flex-1 h-px ${isPinnedGroup ? 'bg-gradient-to-r from-amber-300 to-transparent' : 'bg-gradient-to-r from-purple-200 to-transparent'}`} />
                                                    </div>
                                                    <div className={galleryGridClass}>
                                                        {group.items.map((doc) => (
                                                            <DocumentCard
                                                                key={doc.id}
                                                                doc={doc}
                                                                userId={userId}
                                                                kind="resume"
                                                                onEdit={onEditDocument}
                                                                onDelete={handleResumeDelete}
                                                                onTogglePin={toggleResumePin}
                                                                onRename={renameResume}
                                                                onDownload={handleDownload}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* COVER LETTERS TAB */}
                        {!loading && !error && activeTab === 'cover-letters' && (
                            <>
                                {(coverDocs?.length || 0) === 0 ? (
                                    <EmptyState
                                        mode="cover-letters"
                                        onCreateResume={handleCreateResume}
                                        onCreateCoverLetter={handleCreateCoverLetter}
                                    />
                                ) : (
                                    <div className="space-y-10">
                                        {coverGroups.map((group) => {
                                            const isPinnedGroup = group.key === 'pinned';
                                            return (
                                                <div key={group.key}>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <h2 className={`text-sm font-semibold tracking-wide uppercase ${isPinnedGroup ? 'text-amber-600' : 'text-slate-700'}`}>{group.label}</h2>
                                                        <span className="text-xs text-slate-400">({group.items.length})</span>
                                                        <div className={`flex-1 h-px ${isPinnedGroup ? 'bg-gradient-to-r from-amber-300 to-transparent' : 'bg-gradient-to-r from-blue-200 to-transparent'}`} />
                                                    </div>
                                                    <div className={galleryGridClass}>
                                                        {group.items.map((doc: any) => (
                                                            <DocumentCard
                                                                key={doc.id}
                                                                doc={doc as any}
                                                                userId={userId}
                                                                kind="cover-letter"
                                                                onEdit={(id) => onEditCoverLetter?.(id)}
                                                                onDelete={handleCoverDelete}
                                                                onTogglePin={toggleCoverPin}
                                                                onRename={renameCover}
                                                                onDownload={handleDownload}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {quickView.isOpen && quickView.kind === 'resume' && (
                    <CVPreviewModal
                        isOpen={quickView.isOpen}
                        onClose={closeQuickView}
                        userId={userId}
                        documentId={quickView.id}
                        documentTitle={quickView.title}
                    />
                )}
                {quickView.isOpen && quickView.kind === 'cover-letter' && (
                    <CoverLetterPreviewModal
                        isOpen={quickView.isOpen}
                        onClose={closeQuickView}
                        userId={userId}
                        documentId={quickView.id}
                        documentTitle={quickView.title}
                    />
                )}

                <RemoveDocumentChoice
                    isOpen={removeChoice.isOpen}
                    documentTitle={removeChoice.title}
                    kind={removeChoice.kind}
                    onArchive={handleConfirmArchive}
                    onDeleteForever={handleConfirmDelete}
                    onCancel={handleCancelRemove}
                />
            </div>
        </>
    );
};

// =====================================================
// EmptyState — unchanged
// =====================================================
interface EmptyStateProps {
    mode?: 'all' | 'resumes' | 'cover-letters';
    onCreateResume?: () => void;
    onCreateCoverLetter?: () => void;
    emptyDropdownOpen?: boolean;
    setEmptyDropdownOpen?: (v: boolean) => void;
    emptyDropdownRef?: React.RefObject<HTMLDivElement>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    mode = 'all',
    onCreateResume,
    onCreateCoverLetter,
    emptyDropdownOpen = false,
    setEmptyDropdownOpen,
    emptyDropdownRef,
}) => {
    const isCoverOnly = mode === 'cover-letters';
    const isResumeOnly = mode === 'resumes';
    const isAll = mode === 'all';

    const title = isCoverOnly
        ? 'No Cover Letters yet'
        : isResumeOnly
            ? 'No CVs yet'
            : 'No Documents yet';

    const description = isCoverOnly
        ? 'Create your first professional cover letter to get started.'
        : isResumeOnly
            ? 'Create your first professional CV to get started.'
            : 'Create your first CV or cover letter to get started.';

    return (
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 rounded-2xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/60 to-blue-50/40">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 flex items-center justify-center mb-5">
                {isCoverOnly ? (
                    <Mail size={28} className="text-purple-600" />
                ) : (
                    <FileText size={28} className="text-purple-600" />
                )}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                {title}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-md px-4">
                {description}
            </p>

            {isAll && onCreateResume && onCreateCoverLetter && (
                <div className="relative" ref={emptyDropdownRef}>
                    <button
                        onClick={() => setEmptyDropdownOpen?.(!emptyDropdownOpen)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 whitespace-nowrap"
                    >
                        <Plus size={18} className="flex-shrink-0" />
                        Create New
                        <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ${emptyDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {emptyDropdownOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-64 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                            <button onClick={onCreateResume} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-purple-50 transition-colors duration-200">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm shadow-purple-600/20">
                                    <FileText size={14} className="text-white" />
                                </div>
                                <span className="font-medium">Create New CV</span>
                            </button>
                            <div className="h-px bg-slate-100" />
                            <button onClick={onCreateCoverLetter} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-900 hover:bg-blue-50 transition-colors duration-200">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm shadow-blue-500/20">
                                    <Mail size={14} className="text-white" />
                                </div>
                                <span className="font-medium">Create New Cover Letter</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isResumeOnly && onCreateResume && (
                <button
                    onClick={onCreateResume}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold shadow-md shadow-purple-600/20 transition-all duration-200"
                >
                    <Plus size={18} /> Create New CV
                </button>
            )}

            {isCoverOnly && onCreateCoverLetter && (
                <button
                    onClick={onCreateCoverLetter}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-md shadow-blue-500/20 transition-all duration-200"
                >
                    <Plus size={18} /> Create New Cover Letter
                </button>
            )}
        </div>
    );
};

export default MyDocuments;