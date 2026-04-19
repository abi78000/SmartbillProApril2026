import { Component, OnInit } from '@angular/core';
import { CommonserviceService } from '../../../services/commonservice.service';
import { Branch, Company } from '../../models/common-models/companyMaster';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { ValidationService } from '../../../services/properties/validation.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';
MasterTableViewComponent;

@Component({
  selector: 'app-branch-master',
  imports: [
    CommonModule,
    FormsModule,
    FocusOnKeyDirective,
    MasterTableViewComponent,
    SharedModule,
  ],
  templateUrl: './branch-master.component.html',
  styleUrls: ['./branch-master.component.css'],
})
export class BranchMasterComponent implements OnInit {
  companies: Company[] = [];
  branches: Branch[] = [];
  isEditMode = false;
  isFormEnabled = false;
  branch: Branch = this.getEmptyBranch();

  constructor(
    private commonservice: CommonserviceService,
    private swallservice: SweetAlertService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadBranches();
    this.isFormEnabled = false;
  }

  branchColumns = [
    { field: 'branchName', header: 'Branch Name' },
    { field: 'isActive', header: 'Active' },
  ];
  loadCompanies() {
    this.commonservice.getCompanies().subscribe({
      next: (res) => (this.companies = res),
      error: (err) => console.error('Error fetching companies:', err),
    });
  }

  loadBranches() {
    this.commonservice.getBranches().subscribe({
      next: (data) => (this.branches = data),
      error: (err) => console.error('Error fetching branches:', err),
    });
  }
  get totalBranches(): number {
    return this.branches.length;
  }
  getCompanyName(companyID: number): string {
    const company = this.companies.find((c) => c.companyID === companyID);
    return company ? company.companyName : '';
  }
  
  newBranch() {
    this.resetBranch();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  Refresh() {
    this.resetBranch();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }

  getEmptyBranch(): Branch {
    return {
      branchID: 0,
      companyID: 0,
      branchCode: '',
      branchName: '',
      address: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: 'AngularApp',
      createdAt: new Date().toISOString(),
      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: new Date().toISOString(),
    };
  }

  resetBranch() {
    this.branch = this.getEmptyBranch();
  }


  saveOrDeleteBranch() {
    if (!this.branch.branchName || !this.branch.companyID) {
      this.swallservice.error(
        'Validation Error',
        'Company and Branch Name are required!'
      );
      return;
    }

    this.commonservice.saveBranch(this.branch).subscribe({
      next: (id) => {
        this.swallservice.success(
          'Success',
          this.branch.branchID > 0 ? 'Branch updated!' : 'Branch created!'
        );
        this.loadBranches();
        this.resetBranch();
      },
      error: (err) => {
        console.error(' Error saving branch:', err);
        this.swallservice.error('Error', 'Error saving branch!');
      },
    });
  }

  editBranch(b: Branch) {
    this.branch = { ...b };
  }

  deleteBranch(b: Branch) {
    if (!confirm(`Are you sure you want to delete ${b.branchName}?`)) return;

    b.isActive = false;
    this.commonservice.saveBranch(b).subscribe({
      next: () => {
        this.swallservice.success('Success', 'Branch deleted successfully!');
        this.loadBranches();
      },
      error: (err) => {
        console.error('Error deleting branch:', err);
        this.swallservice.error('Error', 'Error deleting branch!');
      },
    });
  }
}
