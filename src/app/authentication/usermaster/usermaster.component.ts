import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../framework/reusable-form/reusable-form.component';

import { CommonserviceService } from '../../services/commonservice.service';

import { SweetAlertService } from '../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-usermaster',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './usermaster.component.html',

  styleUrls: ['./usermaster.component.css'],
})
export class UsermasterComponent implements OnInit {
  showForm = false;

  isEditMode = false;

  formTitle = 'New User';

  users: any[] = [];

  companies: any[] = [];

  branches: any[] = [];

  departments: any[] = [];

  roles: any[] = [];

  userModel: any = {};

  /* ===================================
   TABS
=================================== */

  userTabs = ['Details', 'Organization', 'Settings'];

  /* ===================================
   TABLE
=================================== */

  userColumns = [
    {
      field: 'userName',
      header: 'User',
    },

    {
      field: 'email',
      header: 'Email',
    },

    {
      field: 'roleName',
      header: 'Role',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /* ===================================
   FIELDS
=================================== */

  userFields: any[] = [
    {
      label: 'User Name',
      model: 'userName',
      type: 'text',
      required: true,
      tab: 'Details',
      autoFocus: true,
    },

    {
      label: 'Password',
      model: 'passwordHash',
      type: 'text',
      required: true,
      tab: 'Details',
    },

    {
      label: 'Email',
      model: 'email',
      type: 'email',
      required: true,
      tab: 'Details',
    },

    {
      label: 'Company',
      model: 'companyID',
      type: 'select',
      tab: 'Organization',
      required: true,
      options: [],
    },

    {
      label: 'Branch',
      model: 'branchID',
      type: 'select',
      tab: 'Organization',
      required: true,
      options: [],
    },

    {
      label: 'Department',
      model: 'departmentID',
      type: 'select',
      tab: 'Organization',
      required: true,
      options: [],
    },

    {
      label: 'Role',
      model: 'roleID',
      type: 'select',
      tab: 'Organization',
      required: true,
      options: [],
    },

    {
      label: 'Is Active',
      model: 'isActive',
      type: 'checkbox',
      tab: 'Settings',
    },
  ];

  constructor(
    private commonservice: CommonserviceService,

    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetModel();

    this.loadCompanies();

    this.loadBranches();

    this.loadDepartments();

    this.loadRoles();

    this.loadUsers();
  }

  /* ===================================
   LOAD COMPANIES
=================================== */

  loadCompanies() {
    this.commonservice.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = res;

        const field = this.userFields.find((x) => x.model === 'companyID');

        if (field) {
          field.options = res.map((company: any) => ({
            label: company.companyName,

            value: company.companyID,
          }));
        }
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  /* ===================================
   LOAD BRANCHES
=================================== */

  loadBranches() {
    this.commonservice.getBranches().subscribe({
      next: (res: any) => {
        this.branches = res;

        const field = this.userFields.find((x) => x.model === 'branchID');

        if (field) {
          field.options = res.map((branch: any) => ({
            label: branch.branchName,

            value: branch.branchID,
          }));
        }
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  /* ===================================
   LOAD DEPARTMENTS
=================================== */

  loadDepartments() {
    this.commonservice.getDepartments().subscribe({
      next: (res: any) => {
        this.departments = res;

        const field = this.userFields.find((x) => x.model === 'departmentID');

        if (field) {
          field.options = res.map((department: any) => ({
            label: department.departmentName,

            value: department.departmentID,
          }));
        }
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  /* ===================================
   LOAD ROLES
=================================== */

  loadRoles() {
    this.commonservice.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res;

        const field = this.userFields.find((x) => x.model === 'roleID');

        if (field) {
          field.options = res.map((role: any) => ({
            label: role.roleName,

            value: role.roleID,
          }));
        }
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  /* ===================================
   LOAD USERS
=================================== */

  loadUsers() {
    this.commonservice.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.map((user: any) => ({
          ...user,

          roleName:
            this.roles.find((r) => r.roleID === user.roleID)?.roleName || '',

          statusText: user.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  /* ===================================
   ADD
=================================== */

  addUser() {
    this.resetModel();

    this.formTitle = 'New User';

    this.isEditMode = false;

    this.showForm = true;
  }

  /* ===================================
   EDIT
=================================== */

  editUser(row: any) {
    this.userModel = {
      ...row,
    };

    this.formTitle = 'Edit User';

    this.isEditMode = true;

    this.showForm = true;
  }

  /* ===================================
   SAVE
=================================== */

  saveUser(data: any) {
    if (!data.userName) {
      return this.swal.warning(
        'Validation',

        'User Name Required',
      );
    }

    if (!data.email) {
      return this.swal.warning(
        'Validation',

        'Email Required',
      );
    }

    const payload = {
      userID: data.userID || 0,

      companyID: Number(data.companyID),

      branchID: Number(data.branchID),

      departmentID: Number(data.departmentID),

      roleID: Number(data.roleID),

      userName: data.userName,

      email: data.email,

      passwordHash: data.passwordHash,

      isActive: Boolean(data.isActive),

      createdByUserID: data.createdByUserID || 0,

      createdSystemName: 'AngularApp',

      createdAt: data.createdAt || new Date(),

      updatedByUserID: 0,

      updatedSystemName: 'AngularApp',

      updatedAt: new Date(),
    };

    this.commonservice.saveUser(payload).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'User Updated' : 'User Created',
        );

        this.loadUsers();

        this.cancelForm();
      },

      error: (err) => {
        console.log(err);

        this.swal.error(
          'Error',

          'Save Failed',
        );
      },
    });
  }

  /* ===================================
   DELETE
=================================== */

  deleteUser(row: any) {
    row.isActive = false;

    this.commonservice.saveUser(row).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          'Deleted Successfully',
        );

        this.loadUsers();
      },
    });
  }

  /* ===================================
   REFRESH
=================================== */

  refresh() {
    this.cancelForm();

    this.loadUsers();
  }

  /* ===================================
   CANCEL
=================================== */

  cancelForm() {
    this.showForm = false;

    this.resetModel();
  }

  /* ===================================
   RESET
=================================== */

  resetModel() {
    this.userModel = {
      userID: 0,

      companyID: null,

      branchID: null,

      departmentID: null,

      roleID: null,

      userName: '',

      email: '',

      passwordHash: '',

      isActive: true,

      createdByUserID: 0,

      createdSystemName: '',

      createdAt: '',

      updatedByUserID: 0,

      updatedSystemName: '',

      updatedAt: '',
    };
  }
}
