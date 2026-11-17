import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TestRenderer, { act } from 'react-test-renderer';
import { AppProvider, useApp } from './store';
import type { ActionResult, Store } from './types';

let app: Store;
let root: TestRenderer.ReactTestRenderer;
function Capture() { app = useApp(); return null; }
function mutate(fn: () => ActionResult): ActionResult { let result!: ActionResult; act(() => { result = fn(); }); return result; }
function select(role: 'customer' | 'business' | 'admin') { act(() => { app.switchDemo(role); }); }

beforeEach(() => {
  const values = new Map<string,string>();
  vi.stubGlobal('localStorage', { getItem: (k:string) => values.get(k) ?? null, setItem: (k:string,v:string) => values.set(k,String(v)), removeItem: (k:string) => values.delete(k), clear: () => values.clear() });
  act(() => { root = TestRenderer.create(<AppProvider><Capture /></AppProvider>); });
});
afterEach(() => { act(() => root.unmount()); vi.unstubAllGlobals(); });

describe('PayBox mock əsas axınları', () => {
  it('rol olmadan rezervasiyaya icazə vermir', () => {
    const stock = app.data.boxes.find(b => b.id === 'box1')!.quantity;
    expect(mutate(() => app.reserve('box1',1)).ok).toBe(false);
    expect(app.data.boxes.find(b => b.id === 'box1')!.quantity).toBe(stock);
  });
  it('qalıqdan artıq rezervasiyanı rədd edir, uyğun rezervasiyanı saxlayır', () => {
    select('customer');
    const old = app.data.boxes.find(b => b.id === 'box2')!.quantity;
    expect(mutate(() => app.reserve('box2',old+1)).ok).toBe(false);
    const result = mutate(() => app.reserve('box2',2));
    expect(result.ok).toBe(true);
    expect(app.data.boxes.find(b => b.id === 'box2')!.quantity).toBe(old-2);
    expect(app.data.reservations.find(r => r.id === result.id)?.status).toBe('PENDING');
  });
  it('götürmə başlamazdan əvvəl ləğv ehtiyatı bir dəfə bərpa edir', () => {
    select('customer');
    const old=app.data.boxes.find(b=>b.id==='box2')!.quantity;
    const result=mutate(()=>app.reserve('box2',1));
    expect(mutate(()=>app.cancelReservation(result.id!)).ok).toBe(true);
    expect(app.data.boxes.find(b=>b.id==='box2')!.quantity).toBe(old);
    expect(mutate(()=>app.cancelReservation(result.id!)).ok).toBe(false);
    expect(app.data.boxes.find(b=>b.id==='box2')!.quantity).toBe(old);
  });
  it('biznes yalnız düzgün kodla təsdiqli sifarişi götürülmüş qeyd edir', () => {
    select('customer'); const result=mutate(()=>app.reserve('box1',1));
    const code=app.data.reservations.find(r=>r.id===result.id)!.code;
    select('business');
    expect(mutate(()=>app.updateReservation(result.id!,'pickup',code)).ok).toBe(false);
    expect(mutate(()=>app.updateReservation(result.id!,'confirm')).ok).toBe(true);
    expect(mutate(()=>app.updateReservation(result.id!,'pickup','WRONG')).ok).toBe(false);
    expect(mutate(()=>app.updateReservation(result.id!,'pickup',code)).ok).toBe(true);
    expect(app.data.reservations.find(r=>r.id===result.id)?.status).toBe('PICKED_UP');
    select('customer');
    expect(mutate(()=>app.addReview(result.id!,5,'Əla')).ok).toBe(true);
    expect(mutate(()=>app.addReview(result.id!,4,'Təkrar')).ok).toBe(false);
  });
  it('yalnız admin gözləyən biznesi təsdiqləyə bilər', () => {
    select('customer'); expect(mutate(()=>app.adminBusiness('b5','APPROVED')).ok).toBe(false);
    select('admin'); expect(mutate(()=>app.adminBusiness('b5','APPROVED')).ok).toBe(true);
    expect(app.data.businesses.find(b=>b.id==='b5')?.status).toBe('APPROVED');
  });
  it('sahibi bloklanmış biznesə yeni rezervasiyanı rədd edir', () => {
    select('admin'); expect(mutate(() => app.adminUser('u-business', true)).ok).toBe(true);
    select('customer'); expect(mutate(() => app.reserve('box1', 1)).ok).toBe(false);
  });
  it('götürmə başlanmazdan əvvəl kodla təhvili rədd edir', () => {
    select('customer'); const result=mutate(()=>app.reserve('box6',1));
    const code=app.data.reservations.find(r=>r.id===result.id)!.code;
    select('business'); expect(mutate(()=>app.updateReservation(result.id!,'confirm')).ok).toBe(true);
    expect(mutate(()=>app.updateReservation(result.id!,'pickup',code)).ok).toBe(false);
  });
  it('rezervasiyalı qutunun şərtlərini dəyişməyə icazə vermir', () => {
    select('business');
    const {id,businessId,createdAt,distance,...input}=app.data.boxes.find(b=>b.id==='box1')!;
    void createdAt; void distance;
    expect(mutate(()=>app.saveBox({...input,id,title:'Dəyişdirilmiş ad'},businessId)).ok).toBe(false);
  });
  it('demo login şifrəni saxlamaq iddiasında deyil', () => {
    expect(mutate(()=>app.login('musteri@paybox.az','uydurma')).ok).toBe(true);
    expect(app.user?.role).toBe('customer');
    expect(JSON.stringify(app.data)).not.toContain('uydurma');
  });
  it('sıfırlamada vaxtı bitmiş demo təkliflərin tarixləri yenilənir', () => {
    vi.useFakeTimers();
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
    vi.setSystemTime(tomorrow);
    act(() => app.resetDemo());
    expect(Date.parse(app.data.boxes.find(b => b.id === 'box1')!.pickupEnd)).toBeGreaterThan(tomorrow);
    vi.useRealTimers();
  });
});
