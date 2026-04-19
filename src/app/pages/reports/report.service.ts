import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config';
import { TerminalReport ,SalesReportCommon,GSTFiling,ProfitReport,
  CustomerOutstandingReport,SupplierOutstandingReport,StockReport} from './models/terminal-report';



@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTerminalReport(
    fromDate: string,
    toDate: string,
    companyId: number,
    branchId?: number,
    createdBy?: string
  ): Observable<TerminalReport> {

    let params = new HttpParams()
      .set('fromDate', fromDate)   // yyyy-MM-dd
      .set('toDate', toDate)
      .set('companyId', companyId.toString());

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    if (createdBy) {
      params = params.set('createdBy', createdBy);
    }

    return this.http.get<TerminalReport>(
      `${this.baseUrl}/reports/terminal/terminal-report`,
      { params }
    );
  }

    getGSTFiling(
    companyId: number,
    gstFileType: 'B2B' | 'B2C' | 'HSN',
    branchId?: number,
    fromDate?: string,   // yyyy-MM-dd
    toDate?: string
  ): Observable<GSTFiling[]> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('gstFileType', gstFileType);

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get<GSTFiling[]>(
      `${this.baseUrl}/reports/sales/GstFiling`,
      { params }
    );
  }

  
  /* ================= SALES REPORTS (COMMON) ================= */
  getSalesReport(
    companyId: number,
    reportType: 'SUMMARY' | 'DETAILED' | 'PAYMODE' | 'CUSTOMER' | 'AREA',
    fromDate?: string,
    toDate?: string,
    branchId?: number
  ): Observable<SalesReportCommon[]> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('reportType', reportType);

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    return this.http.get<SalesReportCommon[]>(
      `${this.baseUrl}/reports/sales/SalesReports`,
      { params }
    );
  }


  /* ================= PROFIT REPORT ================= */
  getProfitReport(
    companyId: number,
    reportType: 'ITEM' | 'INVOICE' | 'DAY',
    fromDate: string,     // yyyy-MM-dd
    toDate: string,       // yyyy-MM-dd
    branchId?: number
  ): Observable<ProfitReport[]> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('reportType', reportType)
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    return this.http.get<ProfitReport[]>(
      `${this.baseUrl}/reports/sales/Profit`,
      { params }
    );
  }
  /* ================= CUSTOMER OUTSTANDING ================= */
  getCustomerOutstanding(
    companyId: number,                        // ✅ mandatory
    reportType: 'CUSTOMER' | 'AREA' | 'DATE',
    fromDate?: string,
    toDate?: string,
    branchId?: number
  ): Observable<CustomerOutstandingReport[]> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('reportType', reportType);

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    return this.http.get<CustomerOutstandingReport[]>(
      `${this.baseUrl}/reports/sales/CustomerOutstanding`,
      { params }
    );
  }

  /* ================= SUPPLIER OUTSTANDING ================= */
  getSupplierOutstanding(
    companyId: number,                        // ✅ mandatory
    reportType: 'SUPPLIER' | 'AREA' | 'DATE',
    fromDate?: string,
    toDate?: string,
    branchId?: number
  ): Observable<SupplierOutstandingReport[]> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('reportType', reportType);

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    return this.http.get<SupplierOutstandingReport[]>(
      `${this.baseUrl}/reports/sales/SupplierOutstanding`,
      { params }
    );
  }

getStockReport(
  companyId: number,
  reportType: 'TOTAL' | 'LOW' | 'FAST' | 'SLOW' | 'LEDGER' | 'VALUATION',
  fromDate?: string,
  toDate?: string,
  branchId?: number,
  days: number = 30
): Observable<StockReport[]> {

  let params = new HttpParams()
    .set('companyId', companyId.toString())
    .set('reportType', reportType)
    .set('days', days.toString());

  if (fromDate) params = params.set('fromDate', fromDate);
  if (toDate) params = params.set('toDate', toDate);
  if (branchId !== undefined) params = params.set('branchId', branchId.toString());

  return this.http.get<StockReport[]>(
    `${this.baseUrl}/reports/sales/stock`,   // ✅ FIXED
    { params }
  );
}


}
