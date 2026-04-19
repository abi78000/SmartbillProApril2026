import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Company,
  Branch,
  Department,
  RegisterRequest,
  RegisterResponse,
  Role,
  CompanyDashboardResponseDto,
} from '../pages/models/common-models/companyMaster';
import {
  User,
  UserPermission,
  Module,
} from '../pages/models/common-models/user';
import { environment } from '../config';
import { PaymentMode } from '../pages/models/common-models/master-models/master';
@Injectable({
  providedIn: 'root',
})
export class CommonserviceService {
  private baseUrl = `${environment.apiBaseUrl}/Common`;

  constructor(private http: HttpClient) {}

  saveCompany(company: Company): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/PostCompanyMaster`, company);
  }
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/GetCompanylist`);
  }
  getCompanyDashboard(
    companyId: number,
    fromDate: string,
    toDate: string,
  ): Observable<CompanyDashboardResponseDto> {
    const params = new HttpParams()
      .set('companyId', companyId)
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<CompanyDashboardResponseDto>(
      `${this.baseUrl}/CommonDashboard`,
      { params },
    );
  }
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  getCompanyById(companyID: number) {
    return this.http.get<Company>(
      `${this.baseUrl}/GetCompanylistByID?id=${companyID}`,
    );
  }

  saveBranch(branch: Branch): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/PostBranchMaster`, branch);
  }

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.baseUrl}/GetBranchList`);
  }

  getBranchesByCompany(companyId: number): Observable<Branch[]> {
    return this.http.get<Branch[]>(
      `${this.baseUrl}/GetBranchesByCompany?companyId=${companyId}`,
    );
  }

  // Department
  saveDepartment(department: Department): Observable<number> {
    return this.http.post<number>(
      `${this.baseUrl}/PostDepartmentMaster`,
      department,
    );
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/GetDepartmentList`);
  }




  // Role
  saveRole(role: Role): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/PostRoleMaster`, role);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/GetRoleList`);
  }
  // === User APIs ===
  saveUser(user: User): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/PostUserMaster`, user);
  }
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/GetUserList`);
  }

  // === User Permission APIs ===
  savePermission(permission: UserPermission): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/SavePermission`, permission);
  }

  deletePermission(permissionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeletePermission/${permissionId}`);
  }

  getPermissionsByRole(roleId: number): Observable<UserPermission[]> {
    return this.http.get<UserPermission[]>(
      `${this.baseUrl}/GetPermissionsByRole/${roleId}`,
    );
  }

  getPermissionsByUser(userId: number): Observable<UserPermission[]> {
    return this.http.get<UserPermission[]>(
      `${this.baseUrl}/GetPermissionsByUser/${userId}`,
    );
  }
  getAllModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.baseUrl}/GetAllModules`);
  }

  getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : 0;
  }

  /** Get the current logged-in user role */
  getCurrentUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  /** Optional: check if user is admin */
  isAdmin(): boolean {
    return this.getCurrentUserRole().toLowerCase() === 'admin';
  }



// Save
savePriceList(data: any) {
  return this.http.post<any>(
    `${this.baseUrl}/SavePriceList`,
    data
  );
}

// Get
getPriceLists(companyId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/GetPriceListByCompanyID?companyId=${companyId}`
  );
}
}
