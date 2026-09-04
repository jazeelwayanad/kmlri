import { Injectable } from '@nestjs/common';

export interface CoverLookupResult {
  imageUrl: string;
  source: 'GOOGLE_BOOKS' | 'OPEN_LIBRARY' | 'AMAZON';
}

function cleanIsbn(isbn: string): string {
  return isbn.replace(/[^0-9Xx]/g, '');
}

/**
 * Looks up a cover image for an ISBN from, in order: Google Books (official API, generous
 * free quota), Open Library (official, free, unlimited), then Amazon's product-image CDN as
 * a last resort. The Amazon lookup has no official public API for this (their Product
 * Advertising API requires an approved Associates account with a sales history) -- it relies
 * on Amazon's long-standing but unofficial `images-amazon.com/images/P/{isbn}...jpg` URL
 * pattern, which can silently return a small "no image available" placeholder instead of
 * failing, so results are size-checked before being accepted.
 */
@Injectable()
export class CoverFetchService {
  async lookup(isbnRaw: string): Promise<CoverLookupResult | null> {
    const isbn = cleanIsbn(isbnRaw);
    if (!isbn) return null;

    const google = await this.tryGoogleBooks(isbn).catch(() => null);
    if (google) return google;

    const openLibrary = await this.tryOpenLibrary(isbn).catch(() => null);
    if (openLibrary) return openLibrary;

    const amazon = await this.tryAmazon(isbn).catch(() => null);
    if (amazon) return amazon;

    return null;
  }

  private async tryGoogleBooks(isbn: string): Promise<CoverLookupResult | null> {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`);
    if (!res.ok) return null;
    const data: any = await res.json();
    const links = data?.items?.[0]?.volumeInfo?.imageLinks;
    if (!links) return null;
    const best: string | undefined = links.extraLarge || links.large || links.medium || links.thumbnail || links.smallThumbnail;
    if (!best) return null;
    // Google serves http by default and a low zoom level; upgrade both.
    const upgraded = best.replace(/^http:/, 'https:').replace(/&zoom=\d/, '&zoom=1');
    return { imageUrl: upgraded, source: 'GOOGLE_BOOKS' };
  }

  private async tryOpenLibrary(isbn: string): Promise<CoverLookupResult | null> {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`);
    if (!res.ok) return null;
    const data: any = await res.json();
    const entry = data?.[`ISBN:${isbn}`];
    const url: string | undefined = entry?.cover?.large || entry?.cover?.medium;
    if (!url) return null;
    return { imageUrl: url, source: 'OPEN_LIBRARY' };
  }

  private async tryAmazon(isbn: string): Promise<CoverLookupResult | null> {
    // Amazon's ASIN often equals the 10-digit ISBN for books; this pattern only works for
    // that case and is not guaranteed to stay available.
    if (isbn.length !== 10) return null;
    const url = `https://images-na.ssl-images-amazon.com/images/P/${isbn}.01.LZZZZZZZ.jpg`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // Amazon's "no cover available" placeholder is a small, fixed-size image; real covers
    // are consistently much larger than this threshold.
    if (buf.byteLength < 5000) return null;
    return { imageUrl: url, source: 'AMAZON' };
  }
}
