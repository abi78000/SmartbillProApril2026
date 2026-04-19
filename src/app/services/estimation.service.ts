import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';
// ─── Exact C# model mirrors ───────────────────────────────

export interface EstimationInvoiceTotal {
  invoiceID: number | null;       
  invoiceNumber: string;
  invoiceDate: string | null;
  companyID: number;
  companyName: string;
  branchID: number;
  branchName: string;
  customerID: number | null;
  customerName: string;
  customerContact: string;
  customerGSTIN: string;
  customerState: string;
  companyState: string;
  accountingYear: string;
  billingType: string;
  isGSTApplicable: boolean | null;
  gSTType: string;
  totalQuantity: number | null;
  totalSaleRate: number | null;
  totalDiscountAmount: number | null;
  totalCGSTAmount: number | null;
  totalSGSTAmount: number | null;
  totalIGSTAmount: number | null;
  totalCESSAmount: number | null;
  totalGrossAmount: number | null;
  totalTaxableAmount: number | null;
  grandTotal: number | null;
  billingMode: string;
  cashAmount: number | null;
  cardAmount: number | null;
  uPIAmount: number | null;
  advanceAmount: number | null;
  paidAmount: number | null;
  balanceAmount: number | null;
  status: string;
  isActive: boolean | null;
  isService: boolean | null;
  remarks: string;
  createdBy: string;
  createdDate: string | null;
  updatedBy: string;
  updatedDate: string | null;
  stockMode: string;
}

export interface EstimationEntryMaster {
  invoiceID: number | null;        // ✅ null — set by DB after header insert
  invoiceNumber: string;
  invoiceDate: string | null;
  companyID: number;
  companyName: string;
  branchID: number;
  branchName: string;
  customerID: number | null;
  customerName: string;
  customerContact: string;
  customerGSTIN: string;
  customerState: string;
  companyState: string;
  accountingYear: string;
  billingType: string;
  isGSTApplicable: boolean | null;
  gSTType: string;
  productID: number | null;
  barcode: string;
  productCode: string;
  productName: string;
  brandID: number | null;
  categoryID: number | null;
  subCategoryID: number | null;
  hSNID: number | null;
  unitID: number | null;
  secondaryUnitID: number | null;
  color: string;
  size: string;
  weight: number | null;
  volume: number | null;
  material: string;
  finishType: string;
  shadeCode: string;
  capacity: string;
  modelNumber: string;
  expiryDate: string | null;
  manufacturingDate: string | null;
  quantity: number | null;
  productRate: number | null;
  saleRate: number | null;
  retailPrice: number | null;
  wholesalePrice: number | null;
  mRP: number | null;
  discountPercentage: number | null;
  discountAmount: number | null;
  inclusiveAmount: number | null;
  exclusiveAmount: number | null;
  gstPercentage: number | null;
  gstAmount: number | null;
  cGSTRate: number | null;
  cGSTAmount: number | null;
  sGSTRate: number | null;
  sGSTAmount: number | null;
  iGSTRate: number | null;
  iGSTAmount: number | null;
  cESSRate: number | null;
  cESSAmount: number | null;
  grossAmount: number | null;
  customerDiscount: number | null;
  netAmount: number | null;
  taxableAmount: number | null;
  grandTotal: number | null;
  billingMode: string;
  cashAmount: number | null;
  cardAmount: number | null;
  uPIAmount: number | null;
  advanceAmount: number | null;
  paidAmount: number | null;
  balanceAmount: number | null;
  status: string;
  isActive: boolean | null;
  isService: boolean | null;
  remarks: string;
  createdBy: string;
  createdDate: string | null;
  updatedBy: string;
  updatedDate: string | null;
}

export interface EstimationRequest {
  header: EstimationInvoiceTotal;
  items: EstimationEntryMaster[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SaveEstimationResponse {
  invoiceID: number;
}

export interface ConvertToSalesResponse {
  salesInvoiceID: number;
}

// ─── Service ──────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class EstimationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/Estimation`;

  constructor(private http: HttpClient) {}

  // POST /api/Estimation/save
  saveEstimation(
    payload: EstimationRequest
  ): Observable<ApiResponse<SaveEstimationResponse>> {
    return this.http.post<ApiResponse<SaveEstimationResponse>>(
      `${this.baseUrl}/save`,
      payload
    );
  }

  // PUT /api/Estimation/update
  updateEstimation(
    payload: EstimationRequest
  ): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.baseUrl}/update`,
      payload
    );
  }

  // GET /api/Estimation/{id}
  getEstimation(
    id: number
  ): Observable<ApiResponse<EstimationRequest>> {
    return this.http.get<ApiResponse<EstimationRequest>>(
      `${this.baseUrl}/${id}`
    );
  }

  // GET /api/Estimation/list
  getEstimations(
    companyId?:     number | null,
    branchId?:      number | null,
    invoiceNumber?: string | null
  ): Observable<ApiResponse<EstimationInvoiceTotal[]>> {
    let params = new HttpParams();
    if (companyId     != null) params = params.set('companyId',     companyId);
    if (branchId      != null) params = params.set('branchId',      branchId);
    if (invoiceNumber != null) params = params.set('invoiceNumber', invoiceNumber);

    return this.http.get<ApiResponse<EstimationInvoiceTotal[]>>(
      `${this.baseUrl}/list`,
      { params }
    );
  }

  // POST /api/Estimation/convert/{id}
  convertToSales(
    id: number
  ): Observable<ApiResponse<ConvertToSalesResponse>> {
    return this.http.post<ApiResponse<ConvertToSalesResponse>>(
      `${this.baseUrl}/convert/${id}`,
      {}
    );
  }

  // GET /api/Estimation/next-number
  // ✅ branchId is int? — matches controller change from string? to int?
  getNextEstimationNumber(
    companyId: number,
    branchId?: number | null
  ): Observable<ApiResponse<string>> {
    let params = new HttpParams().set('companyId', companyId);
    if (branchId != null) params = params.set('branchId', branchId);

    return this.http.get<ApiResponse<string>>(
      `${this.baseUrl}/next-number`,
      { params }
    );
  }
}