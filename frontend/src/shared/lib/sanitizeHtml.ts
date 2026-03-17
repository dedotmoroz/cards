import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
    if (!html) return '';
    return DOMPurify.sanitize(html);
}
