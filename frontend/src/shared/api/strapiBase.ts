const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

export const STRAPI_URL = isLocalhost ? 'http://localhost:1337' : '/cms';
