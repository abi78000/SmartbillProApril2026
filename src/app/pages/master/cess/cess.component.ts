import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { InputRestrictDirective } from '../../../directives/input-restrict.directive';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { Cess } from '../../models/common-models/master-models/master';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';
@Component({
  selector: 'app-cess',
  imports: [FormsModule, CommonModule, InputRestrictDirective,
     FocusOnKeyDirective,
     SharedModule,
     MasterTableViewComponent
    ],
  templateUrl: './cess.component.html',
  styleUrl: './cess.component.css'
})
export class CessComponent {
  cesses: Cess[] = [];
  cess!: Cess;
  duplicateError = false;
  isEditMode = false;
  isFormEnabled = false;
 cessColumns = [
    { field: 'cessName', header: 'CESS Name' },
    { field: 'isActive', header: 'Active' },
  ];
  constructor(
    private readonly masterService: MasterService,
    private readonly validationService: ValidationService,
    private readonly swall: SweetAlertService
  ) {}

  ngOnInit() {
    this.resetCess();
    this.loadCesses();
  }

   newCesscreate() {
    this.resetCess();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshCesses() {
    this.resetCess();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  /** Create new Cess object */
  private newCess(): Cess {
    const now = new Date().toISOString();
    const userId = this.masterService.getCurrentUserId();
    return {
      cessID: 0,
      cessName: '',
      cessRate: 0,
      description: '',
      isActive: true,
      createdByUserID: userId,
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: userId,
      updatedSystemName: 'AngularApp',
      updatedAt: now
    };
  }

  /** Focus helper */
  private focusCess(targetId: string = 'cessName') {
    setTimeout(() => {
      const el = document.getElementById(targetId) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  /** Load all Cesses */
  loadCesses() {
    this.masterService.getCesses().subscribe({
      next: res => this.cesses = res ?? [],
      error: () => this.swall.error('Error', 'Failed to load Cesses!', () => this.focusCess())
    });
  }

/** Check for duplicate Cess name, ignoring the current record when editing */
checkDuplicate() {
  const name = this.cess.cessName?.trim().toLowerCase() || '';
  this.duplicateError = this.cesses.some(c =>
    c.cessName?.trim().toLowerCase() === name && c.cessID !== this.cess.cessID
  );
}


  /** Validation */
  private validateCess(): boolean {
    this.cess.cessName = this.cess.cessName?.trim() || '';
    this.checkDuplicate();

    if (!this.cess.cessName) {
      this.swall.warning('Validation', 'Cess Name is required!', () => this.focusCess());
      return false;
    }

    if (this.duplicateError) {
      this.swall.warning('Validation', 'Cess Name already exists!', () => this.focusCess());
      return false;
    }

    return true;
  }

  /** Save or Update Cess */
  saveOrUpdateCess() {
    if (!this.validateCess()) return;

    const now = new Date().toISOString();
    const userId = this.masterService.getCurrentUserId();

    if (this.cess.cessID && this.cess.cessID > 0) {
      this.cess.updatedByUserID = userId;
      this.cess.updatedSystemName = 'AngularApp';
      this.cess.updatedAt = now;
    } else {
      this.cess.createdByUserID = userId;
      this.cess.createdSystemName = 'AngularApp';
      this.cess.createdAt = now;
      this.cess.updatedByUserID = userId;
      this.cess.updatedSystemName = 'AngularApp';
      this.cess.updatedAt = now;
    }

    this.masterService.saveCess(this.cess).subscribe({
      next: res => {
        if (res.success) {
          this.loadCesses();
          this.resetCess();
          this.swall.success('Success', res.message || 'Cess saved successfully!', () => this.focusCess());
        } else {
          this.swall.error('Error', res.message || 'Something went wrong!', () => this.focusCess());
        }
      },
      error: () => this.swall.error('Error', 'Failed to save Cess!', () => this.focusCess())
    });
  }

  /** Edit */
  editCess(c: Cess) {
    this.cess = { ...c };
    this.focusCess();
  }

  /** Delete (mark inactive) */
  deleteCess(c: Cess) {
    this.swall.confirm(`Delete ${c.cessName}?`, 'This will mark the Cess as inactive.').then(result => {
      if (!result.isConfirmed) return;

      const deleted: Cess = {
        ...c,
        isActive: false,
        updatedByUserID: this.masterService.getCurrentUserId(),
        updatedAt: new Date().toISOString()
      };

      this.masterService.saveCess(deleted).subscribe({
        next: res => {
          if (res.success) {
            this.loadCesses();
            this.swall.success('Deleted!', res.message || 'Cess deleted!', () => this.focusCess());
          } else {
            this.swall.error('Error', res.message || 'Failed to delete Cess!', () => this.focusCess());
          }
        },
        error: () => this.swall.error('Error', 'Failed to delete Cess!', () => this.focusCess())
      });
    });
  }

  /** Reset form */
  resetCess() {
    this.cess = this.newCess();
    this.duplicateError = false;
    this.focusCess();
  }
}
