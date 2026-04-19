import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config';
import { PurchaseOrderEntry } from '../models/purchase-models';
import { ApiResponse } from '../../pages/models/common-models/companyMaster';
@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderServiceService {
  private baseUrl = `${environment.apiBaseUrl}/Purchase`;

  constructor(private http: HttpClient) {}
  savePurchaseOrder(payload: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/purchaseorder`,
      payload
    );
  }

  getPurchaseOrders(params: any): Observable<PurchaseOrderEntry[]> {
    return this.http.get<PurchaseOrderEntry[]>(
      `${this.baseUrl}/GetPurchaseOrder`,
      { params }
    );
  }

  saveGRN(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/grn`, payload);
  }
  savePurchaseEntry(payload: any[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/purchaseentry`,
      payload
    );
  }

   
  getNextPONumber(companyId: number , branchId?: string): Observable<string> {
    let params = new HttpParams().set('companyId', companyId);

    if (branchId && branchId.trim() !== '') {
      params = params.set('branchId', branchId);
    }

    return this.http.get(`${this.baseUrl}/GetNextPONumber`, {
      responseType: 'text',
      params: params,
    });
  }

getPurchaseStock(params: any): Observable<any[]> {
  let httpParams = new HttpParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== '') {
      httpParams = httpParams.set(key, params[key]);
    }
  });

  return this.http.get<any[]>(`${this.baseUrl}/GetPurchaseStock`, {
    params: httpParams
  });
}

}
