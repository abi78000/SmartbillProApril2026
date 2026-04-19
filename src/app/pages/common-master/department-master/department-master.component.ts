import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonserviceService } from '../../../services/commonservice.service';
import { Department, Branch } from '../../models/common-models/companyMaster';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';
@Component({
  selector: 'app-department-master',

  imports: [CommonModule, FormsModule, MasterTableViewComponent,SharedModule],

  templateUrl: './department-master.component.html',
  styleUrls: ['./department-master.component.css'],
})
export class DepartmentMasterComponent {
  branches: Branch[] = [];

  departments: Department[] = [];
  department: Department = this.resetDepartment();
  departmentColumns = [
    { field: 'departmentName', header: 'Department Name' },
    { field: 'isActive', header: 'Active' },
  ];
    isEditMode = false;
  isFormEnabled = false;
  constructor(
    private commonservice: CommonserviceService,
    private swallservice: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadDepartments();
  }
   newDepartment() {
    this.resetDepartment();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }

  refreshDepartments() {
    this.resetDepartment();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }

  /** Load all branches for dropdown */
  loadBranches(): void {
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

  saveDepartment(): void {
    const now = new Date().toISOString();

    if (this.department.departmentID === 0) {
      this.department.createdAt = now;
      this.department.createdSystemName = 'AngularApp';
      this.department.createdByUserID = 0;
    }

    this.department.updatedAt = now;
    this.department.updatedSystemName = 'AngularApp';
    this.department.updatedByUserID = 0;

    const action = this.department.departmentID === 0 ? 'added' : 'updated';

    this.commonservice.saveDepartment(this.department).subscribe({
      next: (res) => {
        this.swallservice.success(
          'Success',
          `Department ${action} successfully!`
        );
        this.department = this.resetDepartment();
        this.loadDepartments();
      },
      error: (err) => {
        console.error(err);
        this.swallservice.error('Error', `Could not save department.`);
      },
    });
  }

  /** Edit department */
  editDepartment(dept: Department): void {
    this.department = { ...dept };
  }
  deleteDepartment(deptID: number): void {
    if (!confirm('Are you sure to delete this department?')) return;

    this.commonservice
      .saveDepartment({ ...this.resetDepartment(), departmentID: deptID })
      .subscribe({
        next: (res) => {
          alert('Department deleted successfully!');
          this.loadDepartments();
        },
        error: (err) => {
          console.error(err);
          alert('Error: Could not delete department.');
        },
      });
  }

  /** Cancel edit */
  cancelEdit(): void {
    this.department = this.resetDepartment();
  }

  /** Reset form */
  resetDepartment(): Department {
    return {
      departmentID: 0,
      branchID: 0,
      departmentCode: '',
      departmentName: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: '',
      createdAt: '',
      updatedByUserID: 0,
      updatedSystemName: '',
      updatedAt: '',
    };
  }

  /** Get branch name for table display */
  getBranchName(branchID: number): string {
    const branch = this.branches.find((b) => b.branchID === branchID);
    return branch ? branch.branchName : 'N/A';
  }
}
