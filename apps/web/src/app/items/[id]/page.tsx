'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api, BibliographicRecord, ItemCopy } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  BookOpen,
  Eye,
  Lock,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Send,
  Calendar,
  Layers,
  Archive,
  ExternalLink
} from 'lucide-react';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isStaff, hasPermission } = useAuth();

  const [record, setRecord] = useState<BibliographicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [folioIndex, setFolioIndex] = useState(0);

  // Status & notifications
  const [holdStatus, setHoldStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [placingHold, setPlacingHold] = useState(false);
  const [readingLists, setReadingLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [listStatus, setListStatus] = useState<string | null>(null);

  // Modals state
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [selectedCopyScanUrl, setSelectedCopyScanUrl] = useState<string | null>(null);

  // Scan request form state
  const [scanFormat, setScanFormat] = useState('High-Resolution PDF (300 DPI)');
  const [scanPurpose, setScanPurpose] = useState('');
  const [scanSubmitting, setScanSubmitting] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Permissions check
  const canViewDigital = isStaff || hasPermission('MEMBER_DIGITAL_ACCESS');

  useEffect(() => {
    if (!user) return;
    api
      .getReadingLists()
      .then((lists) => setReadingLists(lists || []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      setNotFound(false);
      try {
        const data = await api.getCatalogItem(id);
        setRecord(data);
        setFolioIndex(0);
      } catch {
        setRecord(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  const copies: ItemCopy[] = record?.copies || [];
  const hasCopies = copies.length > 0;
  const folios = record?.digitalFolios || [];
  const hasDigital = folios.length > 0 || copies.some((c) => !!c.imageUrl) || record?.accessLevel === 'DIGITISED_FULL';

  const handlePlaceHold = async (copyId?: string) => {
    if (!hasCopies) {
      setHoldStatus({
        type: 'error',
        text: 'This bibliographic record has no physical holding copies and cannot be held or reserved.',
      });
      return;
    }

    if (!user) {
      setHoldStatus({
        type: 'error',
        text: 'Please sign in to your library account to place a hold or reserve a physical copy.',
      });
      return;
    }

    setPlacingHold(true);
    setHoldStatus(null);
    try {
      await api.placeHold(record?.id || id);
      setHoldStatus({
        type: 'success',
        text: copyId
          ? `Hold placed successfully for copy! You will receive an alert once it is staged for collection.`
          : 'Hold placed successfully! We will notify you as soon as an available copy is staged for collection.',
      });
    } catch (err: any) {
      setHoldStatus({
        type: 'error',
        text: err.message || 'Could not place hold on this item.',
      });
    } finally {
      setPlacingHold(false);
      setTimeout(() => setHoldStatus(null), 7000);
    }
  };

  const handleReadInFullClick = () => {
    if (!hasDigital) return;

    if (canViewDigital) {
      setShowReaderModal(true);
    } else {
      setShowPermissionPrompt(true);
    }
  };

  const handleSubmitScanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    if (!user) {
      alert('Please sign in to submit a digital scan / reproduction request.');
      return;
    }

    setScanSubmitting(true);
    try {
      await api.createReproductionRequest({
        itemDescription: `${record.titleLatin} (${record.shelfmark})`,
        format: scanFormat,
        purpose: scanPurpose || 'Academic & Research Consultation',
      });
      setScanSuccess(true);
      setTimeout(() => {
        setScanSuccess(false);
        setShowScanModal(false);
        setScanPurpose('');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit reproduction request.');
    } finally {
      setScanSubmitting(false);
    }
  };

  const handleAddToList = async () => {
    if (!selectedListId || !record) return;
    try {
      await api.addToReadingList(selectedListId, record.id);
      setListStatus('Added to reading list.');
    } catch (err: any) {
      setListStatus(err.message || 'Could not add to reading list.');
    } finally {
      setTimeout(() => setListStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-stone-900 font-serif flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-base text-stone-700 tracking-wide font-amiri">Retrieving repository record...</p>
        </div>
      </div>
    );
  }

  if (notFound || !record) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-stone-900 font-serif">
        <TopBar />
        <Navbar />
        <div className="max-w-[650px] mx-auto py-24 px-5 text-center">
          <h1 className="text-3xl font-bold font-amiri mb-3 text-stone-950">Record Not Found</h1>
          <p className="text-stone-600 font-sans text-sm mb-6">
            We couldn&apos;t find a catalogue record matching &quot;{id}&quot;.
          </p>
          <Link
            prefetch
            href="/search"
            className="inline-block px-6 py-2.5 bg-black text-white rounded-full text-xs font-sans font-semibold tracking-wider hover:bg-stone-800"
          >
            ← Return to Catalogue Search
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentFolio = folios[folioIndex];

  // Helper for origin line matching screenshot aesthetic
  const isManuscript = record.format === 'MANUSCRIPT';
  const authorOrScribe =
    record.scribe ||
    (record.authors && record.authors.length > 0 ? record.authors.join(', ') : isManuscript ? 'an unnamed scribe' : 'Unknown author');
  const originLocation = record.placeOfPublication || record.originPlace || record.publisher || record.provenance || (isManuscript ? 'Malabar coast' : '');
  const originDate = record.publicationYear || record.originDate || 'undated';
  const originLine = isManuscript
    ? `Copied by ${authorOrScribe}, ${originLocation || 'Malabar coast'}, ${originDate}`
    : `By ${authorOrScribe}${originLocation ? `, ${originLocation}` : ''}, ${originDate}`;

  // Cover image resolver: record coverImageUrl or first folio or copy image
  const displayCoverImage =
    record.coverImageUrl || (folios.length > 0 ? folios[0]?.imageUrl : null);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-stone-900 font-serif selection:bg-amber-200">
      <TopBar />
      <Navbar />

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10">
        {/* Breadcrumb matching design */}
        <nav className="mb-6 sm:mb-8 text-xs sm:text-[13px] font-serif flex items-center gap-2 text-stone-600 tracking-wide">
          <Link prefetch href="/search" className="hover:text-stone-950 transition-colors">
            Collections
          </Link>
          <span className="text-stone-400 font-light">/</span>
          <Link
            prefetch
            href={`/search?format=${record.format}`}
            className="hover:text-stone-950 capitalize transition-colors"
          >
            {record.format.toLowerCase().replace(/_/g, ' ')}s
          </Link>
          <span className="text-stone-400 font-light">/</span>
          <span className="text-stone-900 font-medium truncate max-w-xs sm:max-w-md">{record.titleLatin}</span>
        </nav>

        {/* Hero Section: Two-Column Heritage Presentation */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start mb-12">
          {/* Left Column: Single Small Cover Presentation */}
          <div className="w-[180px] sm:w-[210px] flex-shrink-0 mx-auto md:mx-0">
            {/* Cover Frame */}
            <div className="w-full aspect-[3/4] bg-[#E5DFD4] border border-stone-400/80 shadow-xs relative overflow-hidden flex flex-col items-center justify-center p-1">
              {displayCoverImage ? (
                <div className="w-full h-full relative overflow-hidden bg-stone-900">
                  <img
                    src={displayCoverImage}
                    alt={record.titleLatin}
                    className="w-full h-full object-cover shadow-inner"
                  />
                  {hasDigital && canViewDigital && (
                    <button
                      type="button"
                      onClick={() => setShowReaderModal(true)}
                      className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white p-1.5 rounded-full shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                      title="Open Full Digital Reader"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                /* Hatching pattern placeholder matching exact screenshot aesthetic */
                <div
                  className="w-full h-full flex flex-col items-center justify-center text-center p-3 select-none relative"
                  style={{
                    backgroundColor: '#E8E3D8',
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgba(160, 150, 135, 0.22), rgba(160, 150, 135, 0.22) 2px, transparent 2px, transparent 12px)',
                  }}
                >
                  <div className="p-2 bg-[#E8E3D8]/90 border border-stone-400/50 shadow-xs text-center backdrop-blur-2xs">
                    <span className="font-sans text-[9px] uppercase tracking-[0.16em] text-stone-700 font-semibold block">
                      {isManuscript ? 'FOLIO 1R, COLOUR SCAN' : 'COVER / FOLIO SCAN'}
                    </span>
                    <span className="font-serif text-[9px] text-stone-500 italic mt-0.5 block">
                      KMLRI Repository Archive
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hero Details, Pills & Metadata Table */}
          <div className="flex-1 min-w-0 flex flex-col justify-start">
            {/* Format & Digitisation Tag */}
            <div className="font-serif text-xs text-stone-600 tracking-wide lowercase mb-1.5 flex items-center gap-1.5">
              <span>{record.format.replace(/_/g, ' ')}</span>
              <span>·</span>
              <span className={hasDigital ? 'text-stone-800 font-medium' : 'text-stone-500'}>
                {hasDigital ? 'digitised' : 'physical only'}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-amiri font-bold text-3xl sm:text-4xl md:text-[44px] text-stone-950 leading-[1.12] tracking-tight">
              {record.titleLatin}
            </h1>

            {/* Arabic Title (if available) */}
            {record.titleArabic && (
              <p className="font-amiri text-2xl sm:text-3xl text-stone-800 mt-1" dir="rtl">
                {record.titleArabic}
              </p>
            )}

            {/* Subtitle / Scribe & Origin Line */}
            <p className="font-serif text-sm sm:text-[15px] text-stone-700 mt-2.5 italic leading-relaxed">
              {originLine}
            </p>

            {/* Action Buttons Row matching screenshot */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-6">
              {/* Button 1: Read in Full (Black Pill) */}
              {hasDigital && (
                <button
                  type="button"
                  onClick={handleReadInFullClick}
                  className="rounded-full bg-black text-white px-7 py-2.5 text-xs font-sans font-semibold tracking-wide hover:bg-stone-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read in full</span>
                </button>
              )}

              {/* Button 2: Request a Scan (Outlined Pill) */}
              <button
                type="button"
                onClick={() => setShowScanModal(true)}
                className="rounded-full border border-stone-800 text-stone-900 bg-transparent px-6 py-2.5 text-xs font-sans font-semibold tracking-wide hover:bg-stone-200/60 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Request a scan</span>
              </button>

              {/* Button 3: Place a hold (Outlined Pill) */}
              <button
                type="button"
                disabled={!hasCopies || placingHold}
                onClick={() => handlePlaceHold()}
                title={
                  !hasCopies
                    ? 'No physical holding copies catalogued under this entry.'
                    : 'Place a physical hold / reservation on an available copy.'
                }
                className={`rounded-full border border-stone-800 px-6 py-2.5 text-xs font-sans font-semibold tracking-wide transition-colors shadow-xs flex items-center gap-2 ${
                  hasCopies
                    ? 'text-stone-900 bg-transparent hover:bg-stone-200/60 cursor-pointer'
                    : 'text-stone-400 border-stone-300 bg-stone-100/50 cursor-not-allowed opacity-60'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{placingHold ? 'Placing hold...' : 'Place a hold'}</span>
              </button>

              {/* Reading list shortcut for logged-in users */}
              {user && readingLists.length > 0 && (
                <div className="flex items-center gap-1.5 font-sans ml-auto">
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="border border-stone-300 text-xs px-2.5 py-2 rounded-full outline-none bg-white text-stone-800"
                  >
                    <option value="">Save to list…</option>
                    {readingLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddToList}
                    disabled={!selectedListId}
                    className="px-3.5 py-2 rounded-full border border-stone-800 text-xs font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Notification alert banners */}
            {holdStatus && (
              <div
                className={`mt-4 p-3.5 rounded-sm border text-xs font-sans flex items-center gap-2 ${
                  holdStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {holdStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                )}
                <span>{holdStatus.text}</span>
              </div>
            )}

            {listStatus && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-sans rounded-sm">
                {listStatus}
              </div>
            )}

            {/* Classic Oxford Double-Rule Divider matching screenshot */}
            <div className="border-t-2 border-b border-stone-800 py-0.5 my-7 w-full" />

            {/* Two-Column Specification Table matching screenshot */}
            <div className="space-y-3.5 text-xs sm:text-[13px] font-serif">
              {/* Row 1: Shelfmark */}
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                  Shelfmark
                </span>
                <span className="text-stone-900 font-mono text-xs sm:text-[13px] font-bold tracking-wider">
                  {record.shelfmark}
                </span>
              </div>

              {/* Row 2: Title (Arabic) */}
              {record.titleArabic && (
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                  <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                    Title (Arabic)
                  </span>
                  <span className="text-stone-900 font-amiri text-lg font-bold leading-normal">
                    {record.titleArabic}
                  </span>
                </div>
              )}

              {/* Row 3: Language */}
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                  Language
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-[13px]">
                  {record.language || 'Arabic, with Arabi-Malayalam glosses'}
                </span>
              </div>

              {/* Row 4: Extent */}
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                  Extent
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-[13px]">
                  {record.extent || '84 folios, 21 × 15 cm'}
                </span>
              </div>

              {/* Row 5: Material */}
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                  Material
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-[13px]">
                  {record.material || 'Laid paper, brown ink, red rubrication'}
                </span>
              </div>

              {/* Row 6: Binding */}
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                  Binding
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-[13px]">
                  {record.binding || 'Limp leather over paper boards'}
                </span>
              </div>

              {/* Row 7: Provenance */}
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                  Provenance
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-[13px]">
                  {record.provenance || 'Family deposit, Parappur, 2019'}
                </span>
              </div>

              {/* Row 8: Access */}
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-stone-500 font-sans text-xs w-36 sm:w-44 flex-shrink-0 font-normal">
                  Access
                </span>
                <span className="text-stone-900 font-serif text-xs sm:text-[13px]">
                  {record.accessLevel === 'DIGITISED_FULL'
                    ? 'Digitised in full; original by appointment'
                    : 'Physical reading room only; appointment required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Physical Holding Copies & Circulating Items */}
        <section className="mb-14 pt-8 border-t border-stone-300">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
            <div>
              <h2 className="font-amiri font-bold text-2xl text-stone-950 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-heritage-red" />
                <span>Holding Copies &amp; Circulating Items</span>
              </h2>
              <p className="font-sans text-xs text-stone-600 mt-1">
                Accessioned copies in library branches. Holds and checkouts can only be placed on active registered copies.
              </p>
            </div>
            {hasCopies && (
              <span className="font-sans text-xs font-bold text-stone-600 bg-stone-200/70 px-3 py-1 rounded-full self-start sm:self-auto">
                {copies.length} {copies.length === 1 ? 'Copy Registered' : 'Copies Registered'}
              </span>
            )}
          </div>

          {hasCopies ? (
            <div className="bg-white border border-stone-300 rounded-sm shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#F2ECE1] border-b border-stone-300 text-stone-700 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Copy #</th>
                      <th className="py-3 px-4">Barcode</th>
                      <th className="py-3 px-4">Holding Location</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4">Digital Facsimile</th>
                      <th className="py-3 px-4 text-right">Circulation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-sans">
                    {copies.map((copy) => {
                      const isAvailable = copy.status === 'AVAILABLE';
                      const isOnLoan = copy.status === 'ON_LOAN';
                      const activeLoan = copy.loans && copy.loans.length > 0 ? copy.loans[0] : null;

                      return (
                        <tr key={copy.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            Copy #{copy.copyNumber}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-stone-800">
                            {copy.barcode}
                          </td>
                          <td className="py-3.5 px-4 text-stone-700">
                            <span className="font-medium text-stone-900 block">{copy.location || 'Main Reading Room'}</span>
                            {copy.conditionNote && (
                              <span className="text-[11px] text-stone-500 italic block">{copy.conditionNote}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {isAvailable && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Available on Shelf
                              </span>
                            )}
                            {isOnLoan && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                On Loan {activeLoan?.dueDate ? `(Due ${new Date(activeLoan.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })})` : ''}
                              </span>
                            )}
                            {copy.status === 'RESERVED' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                Reserved
                              </span>
                            )}
                            {copy.status === 'IN_CONSERVATION' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-200 text-stone-700 border border-stone-300">
                                Conservation Lab
                              </span>
                            )}
                            {!isAvailable && !isOnLoan && copy.status !== 'RESERVED' && copy.status !== 'IN_CONSERVATION' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-600">
                                {copy.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {copy.imageUrl ? (
                              canViewDigital ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCopyScanUrl(copy.imageUrl!)}
                                  className="text-[11px] font-bold text-heritage-red hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Digital Scan</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScanPurpose(`Request access to copy scan ${copy.barcode}`);
                                    setShowScanModal(true);
                                  }}
                                  className="text-[11px] font-semibold text-stone-600 hover:text-black flex items-center gap-1 cursor-pointer"
                                >
                                  <Lock className="w-3 h-3 text-stone-500" />
                                  <span>Request Copy Scan</span>
                                </button>
                              )
                            ) : (
                              <span className="text-stone-400 font-serif italic text-xs">No copy scan attached</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isAvailable || isOnLoan ? (
                              <button
                                type="button"
                                onClick={() => handlePlaceHold(copy.id)}
                                disabled={placingHold}
                                className="px-4 py-1.5 rounded-full border border-stone-800 text-stone-900 text-xs font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                              >
                                {isOnLoan ? 'Hold Queue' : 'Place Hold'}
                              </button>
                            ) : (
                              <span className="text-stone-400 text-[11px]">Unavailable for loan</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Reference-Only Bibliographic Banner when copies count === 0 */
            <div className="bg-[#FFFDF9] border-2 border-dashed border-stone-400/80 p-6 sm:p-8 rounded-sm text-center max-w-2xl mx-auto shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F2ECE1] border border-stone-300 text-stone-800 flex items-center justify-center mx-auto shadow-inner">
                <BookOpen className="w-6 h-6 text-heritage-red" />
              </div>
              <h3 className="font-amiri font-bold text-xl text-stone-900">
                Reference Bibliographic Record Only
              </h3>
              <p className="font-sans text-xs text-stone-600 leading-relaxed">
                This entry exists in the KMLRI repository as a master catalog record. There are currently no physical circulating holding copies or accessioned barcode items registered under this title. Physical holds and loans are not available for this record.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowScanModal(true)}
                  className="rounded-full border border-stone-800 px-5 py-2 text-xs font-sans font-bold hover:bg-black hover:text-white transition-colors"
                >
                  Request Reprographic Scan
                </button>
                <Link
                  prefetch
                  href="/ask"
                  className="rounded-full bg-stone-200/80 hover:bg-stone-300 px-5 py-2 text-xs font-sans font-bold text-stone-800 transition-colors"
                >
                  Consult a Curator
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: Summary & Scholarly Metadata Tabs */}
        <section className="mb-14 pt-8 border-t border-stone-300 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Codicological Summary */}
          <div className="lg:col-span-8 space-y-6">
            {record.summary ? (
              <div className="bg-white p-6 sm:p-7 border border-stone-300 rounded-sm shadow-xs">
                <h3 className="font-sans text-xs uppercase tracking-wider text-heritage-muted font-bold mb-3">
                  Codicological Summary &amp; Historical Note
                </h3>
                <p className="font-serif text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line">
                  {record.summary}
                </p>
              </div>
            ) : (
              <div className="bg-white p-6 border border-stone-300 rounded-sm text-stone-500 font-sans text-xs italic">
                No extensive codicological summary attached to this record.
              </div>
            )}

            {/* Scholarly Citations */}
            {record.citations && (
              <div className="bg-white p-6 sm:p-7 border border-stone-300 rounded-sm shadow-xs space-y-4">
                <h3 className="font-sans text-xs uppercase tracking-wider text-heritage-muted font-bold">
                  Scholarly Citations &amp; Catalog References
                </h3>
                <div className="space-y-3 font-sans text-xs">
                  {Object.entries(record.citations).map(([format, text]) => (
                    <div key={format} className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-sm">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="uppercase text-stone-600 text-[10px] tracking-wider">{format}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(text as string);
                            alert(`Copied ${format.toUpperCase()} citation to clipboard.`);
                          }}
                          className="text-heritage-red hover:underline font-bold text-[11px] cursor-pointer"
                        >
                          Copy Citation
                        </button>
                      </div>
                      <p className="font-mono text-stone-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                        {text as string}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subjects & Metadata Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Subject Headings */}
            {record.subjects && record.subjects.length > 0 && (
              <div className="bg-white p-6 border border-stone-300 rounded-sm shadow-xs">
                <h3 className="font-sans text-xs uppercase tracking-wider text-stone-700 font-bold mb-3">
                  Subject Headings
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {record.subjects.map((sub, idx) => (
                    <Link
                      prefetch
                      key={idx}
                      href={`/search?q=${encodeURIComponent(sub)}`}
                      className="bg-[#F2ECE1] hover:bg-stone-300 text-stone-800 px-3 py-1 rounded-full text-xs font-sans transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Collections & Items */}
            {(record as any).related && (record as any).related.length > 0 && (
              <div className="bg-white p-6 border border-stone-300 rounded-sm shadow-xs space-y-3">
                <h3 className="font-sans text-xs uppercase tracking-wider text-stone-700 font-bold border-b border-stone-200 pb-2">
                  Related Holdings
                </h3>
                <div className="divide-y divide-stone-100">
                  {(record as any).related.map((r: any) => (
                    <Link
                      prefetch
                      key={r.id}
                      href={`/items/${r.id}`}
                      className="block py-2.5 hover:text-heritage-red group"
                    >
                      <span className="font-amiri text-base font-bold text-stone-900 group-hover:text-heritage-red block leading-snug">
                        {r.titleLatin}
                      </span>
                      <span className="text-[11px] font-sans text-stone-500 capitalize">
                        {r.format.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* =========================================================================
          MODAL 1: Digital Folio Reader Modal
      ========================================================================= */}
      {showReaderModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col backdrop-blur-xs">
          {/* Reader Top Header */}
          <div className="h-14 border-b border-white/15 px-4 sm:px-6 flex items-center justify-between text-white font-sans bg-black/60">
            <div className="min-w-0 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="truncate">
                <span className="font-amiri font-bold text-base text-white truncate block sm:inline">
                  {record.titleLatin}
                </span>
                <span className="text-xs text-stone-400 sm:ml-2 font-mono">
                  {record.shelfmark} · Folio {folioIndex + 1} of {folios.length || 1}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/10 rounded-full p-1 text-xs">
                <button
                  type="button"
                  disabled={folioIndex <= 0}
                  onClick={() => setFolioIndex(folioIndex - 1)}
                  className="px-3 py-1 hover:bg-white/20 rounded-full disabled:opacity-30 cursor-pointer"
                >
                  ← Prev
                </button>
                <span className="px-2 text-stone-300 font-mono">
                  {folioIndex + 1} / {folios.length || 1}
                </span>
                <button
                  type="button"
                  disabled={folioIndex >= folios.length - 1}
                  onClick={() => setFolioIndex(folioIndex + 1)}
                  className="px-3 py-1 hover:bg-white/20 rounded-full disabled:opacity-30 cursor-pointer"
                >
                  Next →
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowReaderModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Main Canvas */}
          <div className="flex-1 flex overflow-hidden">
            {/* Canvas Viewport */}
            <div className="flex-1 flex items-center justify-center p-4 bg-[#0F0F0F] relative overflow-auto">
              {currentFolio?.imageUrl || record.coverImageUrl ? (
                <img
                  src={currentFolio?.imageUrl || record.coverImageUrl}
                  alt={currentFolio?.label || `Folio ${folioIndex + 1}`}
                  className="max-h-full max-w-full object-contain shadow-2xl rounded-sm select-none"
                />
              ) : (
                <div className="text-center text-stone-400 font-sans p-8">
                  <p className="text-sm">No digitized facsimile attached to this folio page.</p>
                </div>
              )}
            </div>

            {/* OCR / Translation Sidebar (if available) */}
            {(currentFolio?.ocrTextArabic || currentFolio?.ocrTextLatin) && (
              <div className="w-80 border-l border-white/15 bg-[#141414] p-5 text-white overflow-y-auto hidden md:block">
                <h4 className="font-sans text-xs uppercase tracking-wider text-amber-400 font-bold mb-4">
                  Diplomatic Transcription
                </h4>
                {currentFolio.ocrTextArabic && (
                  <div className="mb-6">
                    <span className="text-[11px] text-stone-400 font-sans uppercase block mb-1">Arabic Text</span>
                    <p className="font-amiri text-lg text-amber-100 leading-relaxed" dir="rtl">
                      {currentFolio.ocrTextArabic}
                    </p>
                  </div>
                )}
                {currentFolio.ocrTextLatin && (
                  <div>
                    <span className="text-[11px] text-stone-400 font-sans uppercase block mb-1">Transliteration</span>
                    <p className="font-sans text-xs text-stone-300 leading-relaxed">
                      {currentFolio.ocrTextLatin}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reader Bottom Folio Thumbnails Strip */}
          {folios.length > 1 && (
            <div className="h-20 bg-black/80 border-t border-white/15 px-4 flex items-center gap-2 overflow-x-auto">
              {folios.map((folio, idx) => (
                <button
                  key={folio.id || idx}
                  type="button"
                  onClick={() => setFolioIndex(idx)}
                  className={`h-16 w-12 flex-shrink-0 rounded overflow-hidden border transition-all ${
                    idx === folioIndex ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  {folio.thumbnailUrl || folio.imageUrl ? (
                    <img src={folio.thumbnailUrl || folio.imageUrl} alt={folio.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-stone-800 flex items-center justify-center text-[10px] text-white">
                      #{idx + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 2: Single Copy Scan Viewer Modal
      ========================================================================= */}
      {selectedCopyScanUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col backdrop-blur-xs p-4 sm:p-6">
          <div className="flex justify-between items-center text-white mb-3">
            <h3 className="font-amiri font-bold text-lg">Copy Facsimile Preview</h3>
            <button
              type="button"
              onClick={() => setSelectedCopyScanUrl(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto bg-black rounded p-2">
            <img src={selectedCopyScanUrl} alt="Copy scan" className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: Digital Access Clearance Notice Modal
      ========================================================================= */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-300 font-sans space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-amiri font-bold text-2xl text-stone-900">
                Digital Reading Room Clearance Required
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Full-text digital access to this manuscript is reserved for registered Research Fellows, Scholars, and verified Institutional Members. Your current role does not have the <strong>MEMBER_DIGITAL_ACCESS</strong> permission enabled.
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded border border-stone-200 text-xs text-stone-700 space-y-1">
              <p><strong>Item:</strong> {record.titleLatin}</p>
              <p><strong>Shelfmark:</strong> {record.shelfmark}</p>
              <p><strong>Permission Required:</strong> Access Digital Reading Room</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPermissionPrompt(false);
                  setShowScanModal(true);
                }}
                className="w-full py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Submit Reproduction / Scan Request
              </button>
              <Link
                prefetch
                href="/ask"
                onClick={() => setShowPermissionPrompt(false)}
                className="w-full py-2.5 rounded-full border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-100 text-center transition-colors"
              >
                Apply for Researcher Elevation
              </Link>
              <button
                type="button"
                onClick={() => setShowPermissionPrompt(false)}
                className="text-xs text-stone-500 hover:text-stone-900 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: Reproduction / Request a Scan Modal
      ========================================================================= */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-300 font-sans space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-heritage-red" />
                <h3 className="font-amiri font-bold text-xl text-stone-900">
                  Request Digital Scan / Reproduction
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {scanSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-amiri font-bold text-xl text-stone-900">Request Submitted</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Your reproduction request for <strong>{record.titleLatin}</strong> has been received. Our preservation team will review and deliver your scan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitScanRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">Target Catalogue Title</label>
                  <input
                    type="text"
                    disabled
                    value={`${record.titleLatin} (${record.shelfmark})`}
                    className="w-full p-2.5 bg-stone-100 border border-stone-300 rounded font-serif text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Desired Scan Quality &amp; Format</label>
                  <select
                    value={scanFormat}
                    onChange={(e) => setScanFormat(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded outline-none focus:border-stone-800"
                  >
                    <option value="High-Resolution PDF (300 DPI)">High-Resolution PDF (300 DPI)</option>
                    <option value="Archival TIFF (600 DPI, Colour-Calibrated)">Archival TIFF (600 DPI, Colour-Calibrated)</option>
                    <option value="Greyscale Working Copy (PDF)">Greyscale Working Copy (PDF)</option>
                    <option value="Selective Folio Excerpt (Custom Extent)">Selective Folio Excerpt (Custom Extent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Research Objective / Specific Folios (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={scanPurpose}
                    onChange={(e) => setScanPurpose(e.target.value)}
                    placeholder="e.g. Critical edition research, folios 1r-15v required for comparative collation."
                    className="w-full p-2.5 bg-white border border-stone-300 rounded outline-none focus:border-stone-800 font-sans"
                  />
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
                  Reproduction scans are prepared in accordance with the institute&apos;s manuscript preservation protocols. You will be notified via email once approved.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScanModal(false)}
                    className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scanSubmitting}
                    className="px-6 py-2.5 rounded-full bg-black text-white font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{scanSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
