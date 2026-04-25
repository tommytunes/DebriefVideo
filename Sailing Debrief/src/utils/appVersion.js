import pkg from '../../package.json';
export const APP_VERSION = pkg.version;

export function isOutdated(current, latest) {
   const c = current.split('.').map(Number);
   const l = latest.split('.').map(Number);
   for (let i = 0; i < Math.max(c.length, l.length); i++) {
     const a = c[i] || 0, b = l[i] || 0;
     if (a < b) return true;
     if (a > b) return false;
   }
   return false;
 }