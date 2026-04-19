import { Component } from '@angular/core';
import { CommonserviceService } from '../../services/commonservice.service';
import { User } from '../../pages/models/common-models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetAlertService } from '../../services/../services/properties/sweet-alert.service';
import {
  Company,
  Branch,
  Department,
  Role,
} from '../../pages/models/common-models/companyMaster';
import { SharedModule } from '../../shared/shared.module';
import { MasterTableViewComponent } from '../../pages/components/master-table-view/master-table-view.component';
@Component({
  selector: 'app-usermaster',
  imports: [CommonModule, FormsModule, SharedModule, MasterTableViewComponent],
  templateUrl: './usermaster.component.html',
  styleUrl: './usermaster.component.css',
})
export class UsermasterComponent {
  users: User[] = [];
  user: User = this.getEmptyUser();
  companies: Company[] = [];
  branches: Branch[] = [];
  departments: Department[] = [];
  roles: Role[] = [];
  isEditMode = false;
  isFormEnabled = false;

  constructor(
    private commonservice: CommonserviceService,
    private swallservice: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadBranches();
    this.loadDepartments();
    this.loadRoles();
    this.loadUsers();
    this.isFormEnabled = false;
  }
  userColumns = [
    { field: 'userName', header: 'User Name' },
    { field: 'isActive', header: 'Active' },
  ];
  newUser() {
    this.refreshUsers();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshUsers() {
    this.resetForm();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  loadCompanies() {
    this.commonservice.getCompanies().subscribe({
      next: (res) => (this.companies = res),
      error: (err) => console.error(err),
    });
  }
  loadBranches() {
    this.commonservice.getBranches().subscribe({
      next: (data) => (this.branches = data),
      error: (err) => console.error('Error fetching branches:', err),
    });
  }

  /** Load all departments */
  loadDepartments(): void {
    this.commonservice.getDepartments().subscribe({
      next: (data) => (this.departments = data),
      error: (err) => console.error('Error fetching departments:', err),
    });
  }
  loadRoles() {
    this.commonservice.getRoles().subscribe({
      next: (res) => (this.roles = res),
      error: (err) => {
        console.error(' Error loading roles:', err);

        alert('Error loading role list.');
      },
    });
  }

  getEmptyUser(): User {
    return {
      userID: 0,
      companyID: 0,
      branchID: 0,
      departmentID: 0,
      roleID: 0,
      userName: '',
      email: '',
      passwordHash: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: '',
      createdAt: new Date(),
      updatedByUserID: 0,
      updatedSystemName: '',
      updatedAt: new Date(),
    };
  }

  loadUsers() {
    this.commonservice.getUsers().subscribe({
      next: (res) => (this.users = res),
      error: (err) => {
        console.error('Error loading users:', err);
      },
    });
  }

  saveOrUpdateUser() {
    if (!this.user.userName) {
      this.swallservice.error(
        'Validation Error',
        'User Name and Email are required!'
      );
      return;
    }

    this.commonservice.saveUser(this.user).subscribe({
      next: (id) => {
        this.swallservice.success(
          'Success',
          this.user.userID > 0 ? 'User updated!' : 'User created!'
        );
        this.loadUsers();
        this.resetForm();
      },
      error: (err) => {
        console.error(' Error saving user:', err);
        this.swallservice.error('Error', 'Error saving user!');
      },
    });
  }

  editUser(u: User) {
    this.user = { ...u };
  }

  deleteUser(u: User) {
    if (!confirm(`Are you sure you want to delete ${u.userName}?`)) {
      return;
    }

    u.isActive = false; // soft delete
    this.commonservice.saveUser(u).subscribe({
      next: (id) => {
        console.log(' User deleted (soft delete), ID:', id);
        this.swallservice.success('Deleted', 'User deleted successfully!');
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
      },
    });
  }

  resetForm() {
    this.user = this.getEmptyUser();
  }
  getCompanyName(companyID: number): string {
    return (
      this.companies.find((c) => c.companyID === companyID)?.companyName || ''
    );
  }

  getBranchName(branchID: number): string {
    return this.branches.find((b) => b.branchID === branchID)?.branchName || '';
  }

  getDepartmentName(departmentID: number): string {
    return (
      this.departments.find((d) => d.departmentID === departmentID)
        ?.departmentName || ''
    );
  }

  getRoleName(roleID: number): string {
    return this.roles.find((r) => r.roleID === roleID)?.roleName || '';
  }
}
