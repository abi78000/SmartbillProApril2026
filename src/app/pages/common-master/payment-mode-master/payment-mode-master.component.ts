import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';
import { PaymentMode } from '../../models/common-models/master-models/master';
import { MasterService } from '../../../services/master.service';

@Component({
  selector: 'app-payment-mode-master',
  standalone: true,
  imports: [CommonModule, FormsModule, MasterTableViewComponent, SharedModule],
  templateUrl: './payment-mode-master.component.html',
  styleUrls: ['./payment-mode-master.component.css']
})
export class PaymentModeMasterComponent implements OnInit {

  paymentModes: PaymentMode[] = [];
  paymentMode: PaymentMode = this.resetPaymentMode();

  paymentModeColumns = [
    { field: 'paymentModeName', header: 'Payment Mode' },
    { field: 'paymentType', header: 'Type' },
    { field: 'isActive', header: 'Active' }
  ];

  isEditMode = false;
  isFormEnabled = false;

  constructor(
    private commonservice: MasterService,
    private swallservice: SweetAlertService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadPaymentModes();
  }

  // ================= NEW =================
  newPaymentMode() {
    this.paymentMode = this.resetPaymentMode();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }

  // ================= REFRESH =================
  refreshPaymentModes() {
    this.paymentMode = this.resetPaymentMode();
    this.isEditMode = false;
    this.isFormEnabled = false;
    this.loadPaymentModes();
  }

  // ================= LOAD =================
  loadPaymentModes(): void {
    this.commonservice.getPaymentModes().subscribe({
      next: (data) => (this.paymentModes = data),
      error: (err) => console.error('Error fetching payment modes:', err)
    });
  }

  // ================= SAVE =================
  savePaymentMode(): void {

    if (!this.paymentMode.paymentModeName || !this.paymentMode.paymentModeName.trim()) {
      this.swallservice.error('Validation', 'Payment Mode Name is required');
      return;
    }

    const now = new Date(); // ✅ FIXED (Date instead of string)

    // INSERT
    if (this.paymentMode.paymentModeID === 0) {
      this.paymentMode.createdAt = now;
      this.paymentMode.createdSystemName = 'AngularApp';
      this.paymentMode.createdByUserID = 0;
    }

    // UPDATE
    this.paymentMode.updatedAt = now;
    this.paymentMode.updatedSystemName = 'AngularApp';
    this.paymentMode.updatedByUserID = 0;

    const action = this.paymentMode.paymentModeID === 0 ? 'added' : 'updated';

    this.commonservice.savePaymentMode(this.paymentMode).subscribe({
      next: () => {
        this.swallservice.success(
          'Success',
          `Payment Mode ${action} successfully!`
        );

        this.paymentMode = this.resetPaymentMode();
        this.loadPaymentModes();
        this.isFormEnabled = false;
      },
      error: (err) => {
        console.error(err);
        this.swallservice.error('Error', 'Could not save payment mode.');
      }
    });
  }

  // ================= EDIT =================
  editPaymentMode(mode: PaymentMode): void {
    this.paymentMode = { ...mode };
    this.isEditMode = true;
    this.isFormEnabled = true;
  }

  // ================= DELETE =================
  deletePaymentMode(modeID: number): void {
    if (!confirm('Are you sure to delete this payment mode?')) return;

    const deleteObj: PaymentMode = {
      ...this.resetPaymentMode(),
      paymentModeID: modeID,
      isActive: false,
      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: new Date() // ✅ FIXED
    };

    this.commonservice.savePaymentMode(deleteObj).subscribe({
      next: () => {
        this.swallservice.success('Deleted', 'Payment Mode deleted successfully!');
        this.loadPaymentModes();
      },
      error: (err) => {
        console.error(err);
        this.swallservice.error('Error', 'Could not delete payment mode.');
      }
    });
  }

  // ================= CANCEL =================
  cancelEdit(): void {
    this.paymentMode = this.resetPaymentMode();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }

  // ================= RESET =================
  resetPaymentMode(): PaymentMode {
    return {
      paymentModeID: 0,
      paymentModeName: '',
      paymentType: null,
      description: null,
      isActive: true,

      createdByUserID: 0,
      createdSystemName: null,
      createdAt: new Date(), // ✅ FIXED

      updatedByUserID: null,
      updatedSystemName: null,
      updatedAt: new Date() // ✅ FIXED
    };
  }
}