import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';
import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { MasterService } from '../../../services/master.service';

@Component({
  selector: 'app-payment-mode-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],
  templateUrl: './payment-mode-master.component.html',
  styleUrls: ['./payment-mode-master.component.css'],
})
export class PaymentModeMasterComponent implements OnInit {
  showForm = false;
  isEditMode = false;
  formTitle = 'New Payment Mode';

  paymentModes: any[] = [];
  paymentModel: any = {};

  paymentTabs = ['Details', 'Settings'];

  paymentModeColumns = [
    {
      field: 'paymentModeName',
      header: 'Payment Mode',
    },

    {
      field: 'paymentType',
      header: 'Type',
    },


    {field:'isActive',header:'Status'}
  ];

  paymentFields: any[] = [
    {
      label: 'Payment Mode Name',
      model: 'paymentModeName',
      type: 'text',
      required: true,
      tab: 'Details',
      autoFocus: true,
    },

    {
      label: 'Payment Type',
      model: 'paymentType',
      type: 'select',
      tab: 'Details',
      options: [
        {
          label: 'Cash',
          value: 'Cash',
        },

        {
          label: 'Online',
          value: 'Online',
        },

        {
          label: 'Card',
          value: 'Card',
        },

        {
          label: 'Bank Transfer',
          value: 'Bank',
        },
      ],
    },

    {
      label: 'Description',
      model: 'description',
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
    private service: MasterService,
    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetModel();

    this.loadPaymentModes();
  }

  loadPaymentModes() {
    this.service.getPaymentModes().subscribe({
      next: (res: any) => {
        this.paymentModes = res.map((x: any) => ({
          ...x,

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },
    });
  }

  addPaymentMode() {
    this.resetModel();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Payment Mode';
  }

  editPaymentMode(row: any) {
    this.paymentModel = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Payment Mode';
  }

  savePaymentMode(data: any) {
    if (!data.paymentModeName?.trim()) {
      return this.swal.warning(
        'Validation',

        'Payment Mode Required',
      );
    }

    const now = new Date();

    const payload = {
      paymentModeID: data.paymentModeID || 0,

      paymentModeName: data.paymentModeName,

      paymentType: data.paymentType,

      description: data.description,

      isActive: Boolean(data.isActive),

      createdByUserID: data.createdByUserID || 0,

      createdSystemName: 'AngularApp',

      createdAt: data.createdAt || now,

      updatedByUserID: 0,

      updatedSystemName: 'AngularApp',

      updatedAt: now,
    };

    this.service.savePaymentMode(payload).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Payment Mode Updated' : 'Payment Mode Created',
        );

        this.loadPaymentModes();

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

  deletePaymentMode(row: any) {
    row.isActive = false;

    this.service.savePaymentMode(row).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          'Deleted Successfully',
        );

        this.loadPaymentModes();
      },
    });
  }

  refresh() {
    this.cancelForm();

    this.loadPaymentModes();
  }

  cancelForm() {
    this.showForm = false;

    this.resetModel();
  }

  resetModel() {
    this.paymentModel = {
      paymentModeID: 0,
      paymentModeName: '',
      paymentType: '',
      description: '',
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
