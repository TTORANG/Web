// utils/convertGsUrl.ts
export function convertGsUrlToHttps(url: string): string {
  if (url.startsWith('gs://')) {
    const withoutProtocol = url.replace('gs://', '');
    return `https://storage.googleapis.com/${withoutProtocol}`;
  }

  return url;
}
