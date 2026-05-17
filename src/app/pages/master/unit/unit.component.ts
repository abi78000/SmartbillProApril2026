import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { CommonserviceService } from '../../../services/commonservice.service';

@Component({
  selector: 'app-unit',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './unit.component.html',

  styleUrls: ['./unit.component.css'],
})
export class UnitComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Unit';

  units: any[] = [];

  unit: any = {};

  /*================ TABS =================*/

  unitTabs = ['Details', 'Settings'];

  /*================ TABLE =================*/

  unitColumns = [
    {
      field: 'unitName',
      header: 'Unit Name',
    },

    {
      field: 'unitCode',
      header: 'Unit Code',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  unitFields: any[] = [
    {
      label: 'Unit Name',

      model: 'unitName',

      type: 'text',

      required: true,

      tab: 'Details',
    },

    {
      label: 'Unit Code',

      model: 'unitCode',

      type: 'text',

      tab: 'Details',
    },

    {
      label: 'Is Active',

      model: 'isActive',

      type: 'checkbox',

      tab: 'Settings',
    },
  ];

  constructor(
    private masterService: MasterService,

    private commonService: CommonserviceService,

    private validationService: ValidationService,

    private swall: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetUnit();

    this.loadUnits();
  }

  /*================ LOAD =================*/

  loadUnits() {
    this.masterService.getUnits().subscribe({
      next: (res: any) => {
        this.units = (res || []).map((x: any) => ({
          ...x,

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swall.error('Error', 'Failed to load units');
      },
    });
  }

  /*================ ADD =================*/

  newUnit() {
    this.resetUnit();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Unit';
  }

  /*================ EDIT =================*/

  editUnit(row: any) {
    this.unit = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Unit';
  }

  /*================ FIELD =================*/

  onFieldChange(event: any) {
    this.unit[event.field] = event.value;

    if (event.field === 'unitName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.unit.unitName,

      this.units,

      'unitName',

      this.unit.unitID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateUnit() {
    this.checkDuplicate();

    if (!this.unit.unitName) {
      return this.swall.warning('Validation', 'Unit Name Required');
    }

    if (this.duplicateError) {
      return this.swall.warning('Validation', 'Unit Already Exists');
    }

    const userId = this.commonService.getCurrentUserId();

    const now = new Date().toISOString();

    if (this.unit.unitID === 0) {
      this.unit.createdByUserID = userId;

      this.unit.createdAt = now;
    }

    this.unit.updatedByUserID = userId;

    this.unit.updatedAt = now;

    this.masterService.saveUnit(this.unit).subscribe({
      next: () => {
        this.swall.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadUnits();

        this.cancelForm();
      },
    });
  }

  /*================ DELETE =================*/

  deleteUnit(row: any) {
    row.isActive = false;

    this.masterService.saveUnit(row).subscribe({
      next: () => {
        this.swall.success('Success', 'Deleted');

        this.loadUnits();
      },
    });
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetUnit();
  }

  /*================ REFRESH =================*/

  refreshUnits() {
    this.cancelForm();

    this.loadUnits();
  }

  /*================ RESET =================*/

  resetUnit() {
    this.unit = {
      unitID: 0,

      unitName: '',

      unitCode: '',

      isActive: true,
    };
  }
}
