export const azn = (n: number) => `${n.toFixed(2).replace('.', ',')} ₼`;
export const time = (value: string) => new Intl.DateTimeFormat('az-AZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Baku' }).format(new Date(value));
export const date = (value: string) => new Intl.DateTimeFormat('az-AZ', { day:'numeric', month:'short', timeZone:'Asia/Baku' }).format(new Date(value));
export const windowText = (start: string, end: string) => `${date(start)} · ${time(start)} – ${time(end)}`;
export const statusLabel: Record<string,string> = { PENDING:'Gözləyir', CONFIRMED:'Təsdiqlənib', PICKED_UP:'Götürülüb', CANCELLED:'Ləğv edilib', EXPIRED:'Vaxtı bitib', ACTIVE:'Aktiv', INACTIVE:'Deaktiv', APPROVED:'Təsdiqlənib', REJECTED:'Rədd edilib', OPEN:'Açıq', RESOLVED:'Həll olunub' };
