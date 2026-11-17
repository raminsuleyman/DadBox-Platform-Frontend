export type Role = 'customer' | 'business' | 'admin';
export type BusinessStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'CANCELLED' | 'EXPIRED';
export type BoxStatus = 'ACTIVE' | 'INACTIVE';
export type Category = 'Çörək və şirniyyat' | 'Hazır yeməklər' | 'Meyvə və tərəvəz' | 'Digər';
export interface User { id: string; name: string; email: string; phone: string; role: Role; suspended?: boolean }
export interface Business { id: string; ownerId: string; name: string; category: string; description: string; address: string; phone: string; lat: number; lng: number; status: BusinessStatus; image: string; rating: number; reviewCount: number; createdAt: string; rejectionReason?: string; verificationInfo?: string }
export interface Box { id: string; businessId: string; title: string; description: string; category: Category; originalPrice: number; price: number; quantity: number; pickupStart: string; pickupEnd: string; image: string; allergens: string[]; status: BoxStatus; createdAt: string; distance: number }
export interface Reservation { id: string; boxId: string; businessId: string; customerId: string; quantity: number; totalPrice: number; status: OrderStatus; code: string; createdAt: string }
export interface Review { id: string; reservationId: string; businessId: string; customerId: string; rating: number; comment: string; createdAt: string }
export interface Complaint { id: string; userId: string; targetType: 'business' | 'box' | 'review'; targetId: string; description: string; status: 'OPEN' | 'RESOLVED'; createdAt: string }
export interface AppData { users: User[]; businesses: Business[]; boxes: Box[]; reservations: Reservation[]; reviews: Review[]; complaints: Complaint[] }
export interface ActionResult { ok: boolean; message: string; id?: string }
export const categories: Category[] = ['Çörək və şirniyyat', 'Hazır yeməklər', 'Meyvə və tərəvəz', 'Digər'];

export interface Store {
  data: AppData;
  user: User | null;
  login(email: string, password: string): ActionResult;
  register(name: string, email: string, password: string, role: 'customer' | 'business', phone?: string): ActionResult;
  logout(): void;
  switchDemo(role: Role): void;
  updateProfile(patch: Pick<User, 'name' | 'phone'>): ActionResult;
  createBusiness(input: Omit<Business, 'id' | 'ownerId' | 'status' | 'rating' | 'reviewCount' | 'createdAt'>): ActionResult;
  updateBusiness(id: string, patch: Partial<Business>): ActionResult;
  applyBusiness(id: string): ActionResult;
  saveBox(input: Omit<Box, 'id' | 'businessId' | 'createdAt' | 'distance'> & { id?: string }, businessId: string): ActionResult;
  deactivateBox(id: string): ActionResult;
  reserve(boxId: string, quantity: number): ActionResult;
  cancelReservation(id: string): ActionResult;
  updateReservation(id: string, action: 'confirm' | 'pickup', code?: string): ActionResult;
  addReview(reservationId: string, rating: number, comment: string): ActionResult;
  addComplaint(targetType: Complaint['targetType'], targetId: string, description: string): ActionResult;
  adminBusiness(id: string, status: 'APPROVED' | 'REJECTED', reason?: string): ActionResult;
  adminUser(id: string, suspended: boolean): ActionResult;
  adminBox(id: string): ActionResult;
  resolveComplaint(id: string): ActionResult;
  resetDemo(): void;
}
