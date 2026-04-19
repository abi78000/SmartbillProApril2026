import { Injectable } from '@angular/core';
import { environment } from '../../config';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductComponent } from '../master/product/product.component';
import {
  ProductStockPrice,
  BusinessType,
  GstTransactionType,
  SalesInvoice,
  SaveSalesEntryResponse,
} from './models/sales-model';
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private baseUrl = `${environment.apiBaseUrl}/Sales`;
  constructor(private http: HttpClient) {}

  getSalesProducts(
    companyId?: number,
    branchId?: number,
    businessTypeId?: number,
  ): Observable<ApiResponse<ProductStockPrice[]>> {
    let params = new HttpParams();

    if (companyId) params = params.append('companyId', companyId);
    if (branchId) params = params.append('branchId', branchId);
    if (businessTypeId)
      params = params.append('businessTypeId', businessTypeId);

    return this.http.get<ApiResponse<ProductStockPrice[]>>(
      `${this.baseUrl}/SalesProducts`,
      { params },
    );
  }

  getAllBusinessTypes() {
    return this.http.get<ApiResponse<BusinessType[]>>(
      `${this.baseUrl}/GetAllBusinessTypes`,
    );
  }

  getAllGstTypes() {
    return this.http.get<ApiResponse<GstTransactionType[]>>(
      `${this.baseUrl}/GetAllGstType`,
    );
  }

  saveSalesEntry(
    entries: any[],
  ): Observable<ApiResponse<SaveSalesEntryResponse>> {
    return this.http.post<ApiResponse<SaveSalesEntryResponse>>(
      `${this.baseUrl}/salesentry`,
      entries,
    );
  }

  getNextInvoiceNumber(
    companyId: number,
    branchId?: string,
  ): Observable<string> {
    let params = new HttpParams().set('companyId', companyId);

    if (branchId && branchId.trim() !== '') {
      params = params.set('branchId', branchId);
    }

    return this.http.get(`${this.baseUrl}/GetNextInvoiceNumber`, {
      responseType: 'text',
      params: params,
    });
  }

  getSalesEntries(
    companyId?: number | null,
    branchId?: number | null,
    invoiceNumber?: string | null,
  ): Observable<any[]> {
    let params = new HttpParams();

    if (companyId) params = params.set('companyId', companyId);
    if (branchId) params = params.set('branchId', branchId);
    if (invoiceNumber) params = params.set('invoiceNumber', invoiceNumber);

    return this.http.get<any[]>(`${this.baseUrl}/GetSalesEntries`, { params });
  }
}
