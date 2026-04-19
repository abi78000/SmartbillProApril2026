import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private baseUrl = `${environment.apiBaseUrl}/Expense`;

  constructor(private http: HttpClient) {}

  // ================= CATEGORY =================

  // SAVE CATEGORY
  saveCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Category`, data);
  }

  // GET CATEGORY LIST
  getCategories(companyId: number): Observable<any[]> {
    let params = new HttpParams().set('companyId', companyId);
    return this.http.get<any[]>(`${this.baseUrl}/Categories`, { params });
  }

  // ================= SUBCATEGORY =================

  // SAVE SUBCATEGORY
  saveSubCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/SubCategory`, data);
  }

  // GET SUBCATEGORY BY CATEGORY
  getSubCategories(companyId: number, categoryId: number): Observable<any[]> {
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('categoryId', categoryId);

    return this.http.get<any[]>(`${this.baseUrl}/SubCategories`, { params });
  }

  // ================= EXPENSE ENTRY =================

  saveExpenseEntry(data: any) {
    return this.http.post(`${this.baseUrl}/Entry`, data);
  }

  getExpenseEntries(companyId: number) {
    let params = new HttpParams().set('companyId', companyId);
    return this.http.get(`${this.baseUrl}/Entries`, { params });
  }
}
