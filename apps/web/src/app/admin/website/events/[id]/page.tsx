'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Minus,
  Plus,
  Trash2
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { api, ContentItem } from '@/lib/api';
import { slugify } from '@/lib/slugs';
import { ImageUploadField } from '@/components/content/ImageUploadField';
import { RichTextEditor } from '@/components/content/RichTextEditor';
import { RegistrationFieldsBuilder } from '@/components/content/RegistrationFieldsBuilder';
import { RegistrationSubmissionsList } from '@/components/content/RegistrationSubmissionsList';

export default function ManageEventDetailPage() {
  const params = useParams();
  const eventSlugOrId = params?.id as string;

  const [activeTab, setActiveTab] = useState<'registrations' | 'edit'>('registrations');
  const [regSubTab, setRegSubTab] = useState<'fields' | 'submissions'>('submissions');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const [eventData, setEventData] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [registrationEnabled, setRegistrationEnabled] = useState(false);

  const loadEvent = async () => {
    if (!eventSlugOrId) return;
    setLoading(true);
    try {
      const item = await api.getContentItem(eventSlugOrId);
      setEventData(item);
      setLoadError(null);
      populateForm(item);
    } catch (err: any) {
      setLoadError(err.message || 'Could not load this event from the server.');
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (item: ContentItem) => {
    setTitle(item.title);
    setSlug(item.slug);
    setKicker(item.kicker || '');
    setExcerpt(item.summary);
    setDescription(item.content || '');
    setDate(item.date || '');
    setTime(item.time || '');
    setLocation(item.venue || '');
    setCapacity(item.capacity || 0);
    setFeatured(!!item.featured);
    setTags((item.tags || []).join(', '));
    setStatus(item.status === 'DRAFT' ? 'DRAFT' : item.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE');
    setImageUrl(item.imageUrl || '');
    setRegistrationEnabled(!!item.registrationEnabled);
  };

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlugOrId]);

  const handleSaveEventEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData) return;

    const payload: Partial<ContentItem> = {
      category: 'EVENT',
      title,
      slug: slug || slugify(title),
      kicker,
      summary: excerpt,
      content: description,
      date,
      time,
      venue: location,
      capacity: Number(capacity),
      featured,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      imageUrl: imageUrl || undefined,
      registrationEnabled,
    };

    setSaving(true);
    try {
      const updated = await api.updateContentItem(eventData.id, payload);
      setEventData(updated);
      populateForm(updated);
      setNotificationType('success');
      setNotification('Event settings and program description updated successfully.');
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not save event changes.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const adjustRegistered = async (delta: number) => {
    if (!eventData) return;
    const next = Math.max(0, (eventData.registered || 0) + delta);
    try {
      const updated = await api.updateContentItem(eventData.id, { registered: next });
      setEventData(updated);
      setNotificationType('success');
      setNotification(`Registered attendee count updated to ${next}.`);
    } catch (err: any) {
      setNotificationType('error');
      setNotification(err.message || 'Could not update the registration count.');
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-8 text-center text-gray-500 font-mono text-xs">
          Loading event...
        </div>
      </div>
    );
  }

  if (loadError || !eventData) {
    return (
      <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
        <Link
          href="/admin/website/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#A52307] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{loadError || 'Event not found.'}</span>
        </div>
      </div>
    );
  }

  const capacityVal = eventData.capacity || 0;
  const registeredVal = eventData.registered || 0;
  const fillRate = capacityVal > 0 ? Math.round((registeredVal / capacityVal) * 100) : 0;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Top Breadcrumb & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link
          href="/admin/website/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#A52307] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/events/${eventData.slug}`}
            target="_blank"
            className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>
        </div>
      </div>

      {notification && (
        <div className={`p-4 border rounded-xl text-xs font-semibold flex items-center gap-2 ${
          notificationType === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notificationType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification}</span>
        </div>
      )}

      {/* Event Header Banner Card */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {eventData.kicker && (
                <span className="text-[10px] font-bold uppercase bg-[#A52307] text-white px-2 py-0.5 rounded">
                  {eventData.kicker}
                </span>
              )}
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                eventData.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
              }`}>
                {eventData.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {eventData.title}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
              /{eventData.slug} · ID: {eventData.id}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600 mt-2 flex-wrap">
              {eventData.date && (
                <span className="flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#A52307]" />
                  <span>{eventData.date}</span>
                </span>
              )}
              {eventData.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{eventData.time}</span>
                </span>
              )}
              {eventData.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{eventData.venue}</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#E2E0DB] text-center text-xs w-full md:w-auto">
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Registered</span>
              <span className="text-xl font-bold text-gray-900 mt-0.5 block">{registeredVal} / {capacityVal}</span>
            </div>
            <div className="px-3 border-r border-[#E2E0DB]">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Featured</span>
              <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{eventData.featured ? 'Yes' : 'No'}</span>
            </div>
            <div className="px-3">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Fill Rate</span>
              <span className="text-xl font-bold font-mono text-[#A52307] mt-0.5 block">
                {fillRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'registrations', label: 'Registration', icon: Users },
          { key: 'edit', label: 'Edit Event Program Details', icon: Edit3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#A52307] text-[#A52307]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Registration */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
            <div className="border-b border-[#E2E0DB] pb-3">
              <h3 className="text-base font-bold text-gray-900">Seat Count</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Quick manual adjustment of the registered / capacity counters shown on the public event card.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => adjustRegistered(-1)}
                disabled={registeredVal <= 0}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900 font-mono block">{registeredVal}</span>
                <span className="text-[11px] text-gray-500">of {capacityVal} seats registered</span>
              </div>
              <button
                type="button"
                onClick={() => adjustRegistered(1)}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden max-w-sm">
              <div
                className={`h-full ${registeredVal >= capacityVal && capacityVal > 0 ? 'bg-[#A52307]' : 'bg-emerald-600'}`}
                style={{ width: `${Math.min(100, fillRate)}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
            <div className="border-b border-[#E2E0DB] pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-900">Online Registration Form</h3>
                <p className="text-xs text-gray-500 mt-0.5">Configure the public registration form and review who has signed up.</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${eventData.registrationEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                {eventData.registrationEnabled ? 'Registration Enabled' : 'Registration Disabled'}
              </span>
            </div>

            {!eventData.registrationEnabled ? (
              <div className="p-6 text-center text-gray-400 text-xs border border-dashed border-gray-300 rounded-lg">
                Online registration is turned off for this event. Turn it on from the &quot;Edit Event Program Details&quot; tab to configure a
                registration form and start collecting sign-ups.
              </div>
            ) : (
              <>
                <div className="flex gap-2 border-b border-[#E2E0DB] pb-2">
                  <button
                    type="button"
                    onClick={() => setRegSubTab('submissions')}
                    className={`px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${
                      regSubTab === 'submissions' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Submissions
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegSubTab('fields')}
                    className={`px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${
                      regSubTab === 'fields' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Form Fields
                  </button>
                </div>

                {regSubTab === 'submissions' ? (
                  <RegistrationSubmissionsList contentItemId={eventData.id} />
                ) : (
                  <RegistrationFieldsBuilder contentItemId={eventData.id} />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Edit Event Details */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveEventEdits} className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
          <div className="border-b border-[#E2E0DB] pb-3">
            <h3 className="text-base font-bold text-gray-900">Event Configuration &amp; Program Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">Edit event headline, dates, venue, and capacity.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Eyebrow / Kicker</label>
              <input
                type="text"
                value={kicker}
                onChange={(e) => setKicker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Event Dates</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Timing / Hours</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Venue Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Total Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 outline-none"
              >
                <option value="ACTIVE">Active / Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Short Excerpt / Teaser</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Program Schedule &amp; Description</label>
              <RichTextEditor value={description} onChange={setDescription} placeholder="Write detailed session timings, keynote speaker names, and abstract submission deadlines..." />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadField value={imageUrl} onChange={setImageUrl} label="Featured Image" />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-800 block mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E0DB] flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
              />
              <span className="font-bold text-gray-800">Pin as Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={registrationEnabled}
                onChange={(e) => setRegistrationEnabled(e.target.checked)}
                className="rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
              />
              <span className="font-bold text-gray-800">Enable Online Registration</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving…' : 'Save Event Changes'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
