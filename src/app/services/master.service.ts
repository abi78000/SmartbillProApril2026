import { Injectable } from '@angular/core';
import { environment } from '../config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Brand,
  Category,
  Customer,
  Cess,
  Product,
  Supplier,
  Tax,
  Unit,
  HSN,
  Service,
  SubCategory,
  Status,
  PaymentMode,
  PriceListMaster,
} from './../pages/models/common-models/master-models/master';
import forkJoin from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class MasterService {
  getCompanyById(companyId: any) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = `${environment.apiBaseUrl}/Master`;

  constructor(private http: HttpClient) {}

  // ================= Brand =================
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/Brands`);
  }

  saveBrand(brand: Brand): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Brand`, brand);
  }
  // ================= Payment Mode =================
  getPaymentModes(): Observable<PaymentMode[]> {
    return this.http.get<PaymentMode[]>(`${this.baseUrl}/PaymentMode`);
  }

  // ================= Payment Mode =================
  // Save (Insert / Update / Delete)
  savePaymentMode(paymentMode: PaymentMode): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/PaymentMode`, paymentMode);
  }

  // ================= PRICE LIST =================

  savePriceList(data: PriceListMaster) {
    return this.http.post<any>(`${this.baseUrl}/SavePriceList`, data);
  }

  addPriceListItems(priceListId: number, items: any[]) {
    return this.http.post<any>(
      `${this.baseUrl}/AddPriceListItems?priceListId=${priceListId}`,
      items,
    );
  }

  // ================= Category =================
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/Categories`);
  }

  saveCategory(category: Category): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Category`, category);
  }
  // ================= Status =================
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${this.baseUrl}/Status`);
  }

  // GET all active Cess
  getCesses(): Observable<Cess[]> {
    return this.http.get<Cess[]>(`${this.baseUrl}/Cesses`);
  }

  // POST add/update Cess
  saveCess(cess: Cess): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Cess`, cess);
  }
  // ================= Customer =================
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/Customers`);
  }

  saveCustomer(customer: Customer): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Customer`, customer);
  }

  // ================= Product =================
  getProducts(companyId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/Products/${companyId}`);
  }
  getallProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/GetProducts`);
  }

  /** Save a single product */
  saveProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Product`, product);
  }

  // ================= Supplier =================
  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/Suppliers`);
    console.log('Suppliers fetched');
  }

  saveSupplier(supplier: Supplier): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Supplier`, supplier);
  }

  // ================= Tax =================
  getTaxes(): Observable<Tax[]> {
    return this.http.get<Tax[]>(`${this.baseUrl}/Taxes`);
  }

  saveTax(tax: Tax): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Tax`, tax);
  }

  // ================= Unit =================
  getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.baseUrl}/Units`);
  }

  saveUnit(unit: Unit): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Unit`, unit);
  }

  // ================= HSN =================
  getHSNCodes(): Observable<HSN[]> {
    return this.http.get<HSN[]>(`${this.baseUrl}/HSNCodes`);
  }

  saveHSNCode(hsn: HSN): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/HSNCode`, hsn);
  }

  // ================= Service =================A
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/Services`);
  }

  saveService(service: Service): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Service`, service);
  }

  // ================= SubCategory =================
  getSubCategories(categoryId?: number): Observable<SubCategory[]> {
    let url = `${this.baseUrl}/SubCategories`;
    if (categoryId) url += `?categoryId=${categoryId}`;
    return this.http.get<SubCategory[]>(url);
  }

  saveSubCategory(subCategory: SubCategory): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/SubCategory`, subCategory);
  }

  /** Get current user info */
  getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : 0;
  }

  getCurrentUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole().toLowerCase() === 'admin';
  }

  // ================= CURRENT USER =================

  // Get Company ID from localStorage
  getCurrentCompanyId(): number {
    const companyId = localStorage.getItem('companyId');
    return companyId ? Number(companyId) : 0;
  }

  // ================= PRICE LIST MASTER =================
  getPriceLists(companyId: number, branchId?: number | null) {

    let params = new HttpParams().set('companyId', companyId);

    if (branchId !== null && branchId !== undefined) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<any>(
      `${this.baseUrl}/GetPriceLists`,
      { params }
    );
  }


  // ================= PRICE LIST ITEMS =================
  getPriceListItems(
    companyId: number,
    priceListId: number,
    branchId?: number | null
  ) {

    let params = new HttpParams()
      .set('companyId', companyId)
      .set('priceListId', priceListId);

    if (branchId !== null && branchId !== undefined) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<any>(
      `${this.baseUrl}/GetPriceListItems`,
      { params }
    );
  }


  // ================= SINGLE ITEM PRICE =================
  getPrice(
    companyId: number,
    priceListId: number,
    productId: number,
    branchId?: number | null
  ) {

    let params = new HttpParams()
      .set('companyId', companyId)
      .set('priceListId', priceListId)
      .set('productId', productId);

    if (branchId !== null && branchId !== undefined) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<any>(
      `${this.baseUrl}/GetPriceListByItem`,
      { params }
    );

    
  }
// ================= BRANCH COUNTER =================

// SAVE (Add / Update / Delete)
saveBranchCounter(data: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/BranchCounter`, data);
}

// GET ALL COUNTERS
getBranchCounters(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/BranchCounters`);
}

// GET COUNTERS BY BRANCH
getCountersByBranch(branchId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/BranchCountersByBranch?branchId=${branchId}`
  );
}

// GET SINGLE COUNTER
getCounterById(counterId: number): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/BranchCounterById?counterId=${counterId}`
  );
}
}
