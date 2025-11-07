import { useEffect } from 'react';

interface UseSEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  lang?: string;
}

interface MetaBackup {
  element: HTMLMetaElement;
  previousContent: string | null;
  created: boolean;
}

interface LinkBackup {
  element: HTMLLinkElement;
  previousHref: string | null;
  created: boolean;
}

const setMetaTag = (
  attribute: 'name' | 'property',
  attributeValue: string,
  content: string,
  backups: MetaBackup[]
) => {
  if (typeof document === 'undefined') {
    return;
  }

  let meta = document.head.querySelector(
    `meta[${attribute}="${attributeValue}"]`
  ) as HTMLMetaElement | null;

  const created = !meta;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, attributeValue);
    document.head.appendChild(meta);
  }

  backups.push({
    element: meta,
    previousContent: meta.getAttribute('content'),
    created
  });

  meta.setAttribute('content', content);
};

const restoreMetaTags = (backups: MetaBackup[]) => {
  backups.forEach(({ element, previousContent, created }) => {
    if (!element) {
      return;
    }

    if (created) {
      element.remove();
      return;
    }

    if (previousContent === null) {
      element.removeAttribute('content');
      // Если в документе больше нет контента у тега и он пустой, удаляем его
      if (!element.hasAttribute('content')) {
        element.remove();
      }
      return;
    }

    element.setAttribute('content', previousContent);
  });
};

const setCanonicalLink = (href: string, backups: LinkBackup[]) => {
  if (typeof document === 'undefined') {
    return;
  }

  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const created = !link;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  backups.push({
    element: link,
    previousHref: link.getAttribute('href'),
    created
  });

  link.setAttribute('href', href);
};

const restoreLinks = (backups: LinkBackup[]) => {
  backups.forEach(({ element, previousHref, created }) => {
    if (!element) {
      return;
    }

    if (created) {
      element.remove();
      return;
    }

    if (previousHref === null) {
      element.removeAttribute('href');
      return;
    }

    element.setAttribute('href', previousHref);
  });
};

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  image,
  noindex,
  lang
}: UseSEOOptions) => {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const metaBackups: MetaBackup[] = [];
    const linkBackups: LinkBackup[] = [];

    const previousTitle = document.title;
    if (title) {
      document.title = title;
    }

    const previousLang = document.documentElement.lang;
    if (lang) {
      document.documentElement.lang = lang;
    }

    if (description) {
      setMetaTag('name', 'description', description, metaBackups);
    }

    if (keywords) {
      setMetaTag('name', 'keywords', keywords, metaBackups);
    }

    const canonicalUrl =
      canonical ||
      (typeof window !== 'undefined' ? window.location.href : undefined);

    if (canonicalUrl) {
      setCanonicalLink(canonicalUrl, linkBackups);
      setMetaTag('property', 'og:url', canonicalUrl, metaBackups);
    }

    const ogTitle = title || document.title;
    if (ogTitle) {
      setMetaTag('property', 'og:title', ogTitle, metaBackups);
      setMetaTag('name', 'twitter:title', ogTitle, metaBackups);
    }

    const ogDescription = description;
    if (ogDescription) {
      setMetaTag('property', 'og:description', ogDescription, metaBackups);
      setMetaTag('name', 'twitter:description', ogDescription, metaBackups);
    }

    if (image) {
      setMetaTag('property', 'og:image', image, metaBackups);
      setMetaTag('name', 'twitter:image', image, metaBackups);
    }

    setMetaTag('property', 'og:type', 'website', metaBackups);
    setMetaTag('name', 'twitter:card', 'summary_large_image', metaBackups);

    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow', metaBackups);
    }

    return () => {
      if (title) {
        document.title = previousTitle;
      }

      if (lang) {
        document.documentElement.lang = previousLang;
      }

      restoreMetaTags(metaBackups);
      restoreLinks(linkBackups);
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    image,
    noindex,
    lang
  ]);
};


