import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { CommonserviceService } from '../../../services/commonservice.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-role-master',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './role-master.component.html',

  styleUrls: ['./role-master.component.css'],
})
export class RoleMasterComponent implements OnInit {
  showForm = false;

  isEditMode = false;

  formTitle = 'New Role';

  roles: any[] = [];

  roleModel: any = {};

  /* ===================================
   TABS
=================================== */

  roleTabs = ['Details', 'Settings'];

  /* ===================================
   TABLE
=================================== */

  roleColumns = [
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

  roleFields = [
    {
      label: 'Role Name',
      model: 'roleName',
      type: 'text',
      required: true,
      tab: 'Details',
      restrictType: 'text',
      autoFocus: true,
    },

    {
      label: 'Role Code',
      model: 'roleCode',
      type: 'text',
      tab: 'Details',
      readonly: true,
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

    this.loadRoles();
  }

  /* ===================================
   LOAD
=================================== */

  loadRoles() {
    this.commonservice.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.map((role: any) => ({
          ...role,

          statusText: role.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: (err) => {
        console.log(err);

        this.swal.error('Error', 'Could not load roles');
      },
    });
  }

  /* ===================================
   ADD
=================================== */

  addRole() {
    this.resetModel();

    this.formTitle = 'New Role';

    this.isEditMode = false;

    this.showForm = true;
  }

  /* ===================================
   EDIT
=================================== */

  editRole(row: any) {
    this.roleModel = {
      ...row,
    };

    this.formTitle = 'Edit Role';

    this.isEditMode = true;

    this.showForm = true;
  }

  /* ===================================
   DUPLICATE
=================================== */

  isDuplicate(
    list: any[],

    field: string,

    value: string,

    idField = 'roleID',

    currentId: any = null,
  ): boolean {
    const normalize = (text: any = '') =>
      String(text)
        .trim()

        .replace(/\s+/g, '')

        .toLowerCase();

    return list.some(
      (item) =>
        normalize(item[field]) === normalize(value) &&
        item[idField] !== currentId,
    );
  }

  /* ===================================
   SAVE
=================================== */

  saveRole(data: any) {
    if (!data.roleName?.trim()) {
      return this.swal.warning(
        'Validation',

        'Role Name Required',
      );
    }

    if (
      this.isDuplicate(
        this.roles,

        'roleName',

        data.roleName,

        'roleID',

        data.roleID,
      )
    ) {
      return this.swal.warning(
        'Duplicate',

        'Role already exists',
      );
    }

    const now = new Date().toISOString();

    const payload = {
      roleID: data.roleID || 0,

      roleCode: data.roleCode || '',

      roleName: data.roleName.trim(),

      isActive: Boolean(data.isActive),

      createdByUserID: data.createdByUserID || 0,

      createdSystemName: 'AngularApp',

      createdAt: data.createdAt || now,

      updatedByUserID: 0,

      updatedSystemName: 'AngularApp',

      updatedAt: now,
    };

    this.commonservice.saveRole(payload).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Role Updated' : 'Role Created',
        );

        this.loadRoles();

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

  deleteRole(row: any) {
    row.isActive = false;

    this.commonservice.saveRole(row).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          'Deleted Successfully',
        );

        this.loadRoles();
      },

      error: () => {
        this.swal.error(
          'Error',

          'Delete Failed',
        );
      },
    });
  }

  /* ===================================
   REFRESH
=================================== */

  refresh() {
    this.cancelForm();

    this.loadRoles();
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
    this.roleModel = {
      roleID: 0,
      roleCode: '',
      roleName: '',
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
