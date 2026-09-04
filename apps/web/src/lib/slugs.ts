/**
 * Clean slug and recognizable identifier utilities.
 * Ensures URLs never expose cryptic raw UUIDs like 149bb63b-d4db-4f4d-8a0b-5e241a0ca96f,
 * but instead display clean, human-readable semantic identifiers.
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics (ā, ī, ū, etc.)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Get human-readable slug for a catalogue bibliographic record or manuscript item
 */
export function getRecordSlug(record?: {
  id?: string;
  shelfmark?: string;
  titleLatin?: string;
  slug?: string;
}): string {
  if (!record) return 'record';
  if (record.slug) return slugify(record.slug);
  if (record.shelfmark) {
    const smSlug = slugify(record.shelfmark);
    if (smSlug) return smSlug;
  }
  if (record.titleLatin) {
    return slugify(record.titleLatin);
  }
  return record.id || 'record';
}

/**
 * Get human-readable identifier for a member
 */
export function getMemberIdentifier(user?: {
  id?: string;
  membershipNumber?: string;
  fullName?: string;
}): string {
  if (!user) return 'member';
  if (user.membershipNumber) {
    return user.membershipNumber;
  }
  if (user.fullName) {
    return slugify(user.fullName);
  }
  return user.id || 'member';
}

/**
 * Get clean human-readable slug for a content item (story, news, opportunity, event)
 */
export function getContentSlug(item?: {
  id?: string;
  slug?: string;
  title?: string;
}): string {
  if (!item) return '';
  if (item.slug) return item.slug;
  if (item.title) return slugify(item.title);
  return item.id || '';
}
