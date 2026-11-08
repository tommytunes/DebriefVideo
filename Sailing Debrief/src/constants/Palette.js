// order picked with the dataviz validator: first 4 boats stay distinct under red-green colour blindness
export const PALETTE = ['#2563eb', '#65a30d', '#0891b2', '#db2777', '#16a34a', '#d97706', '#9333ea', '#dc2626'];

export const hash = id => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);