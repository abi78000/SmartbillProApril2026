import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { Unit } from '../../models/common-models/master-models/master';
import { CommonserviceService } from '../../../services/commonservice.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';

interface ApiResponse {
  success: boolean;
  message?: string;
}
@Component({
  selector: 'app-unit',
  imports: [
    CommonModule,
    FormsModule,
    FocusOnKeyDirective,
    MasterTableViewComponent,
    SharedModule,
  ],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.css',
})
export class UnitComponent {
  units: Unit[] = [];
  unit: Unit = this.newUnit();
  duplicateError = false;
  isEditMode = false;
  isFormEnabled = false;
  unitColumns = [
    { field: 'unitName', header: 'Unit Name' },
    { field: 'unitCode', header: 'Unit Code' },
    { field: 'isActive', header: 'Active' },
  ];
  constructor(
    private readonly masterService: MasterService,
    private readonly commonService: CommonserviceService,
    private readonly validationService: ValidationService,
    private readonly swall: SweetAlertService
  ) {}

  ngOnInit() {
    this.loadUnits();
  }
  newUnitCreate() {
    this.refreshUnits();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshUnits() {
    this.loadUnits();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  /** New empty unit */
  private newUnit(): Unit {
    const now = new Date().toISOString();
    return {
      unitID: 0,
      unitName: '',
      unitCode: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: now,
    };
  }

  /** Focus on unit name input */
  private focusUnit() {
    setTimeout(() => {
      const el = document.getElementById('unitName') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  /** Load all units */
  loadUnits() {
    this.masterService.getUnits().subscribe({
      next: (res) => (this.units = res ?? []),
      error: () =>
        this.swall.error('Error', 'Failed to load units!', () =>
          this.focusUnit()
        ),
    });
  }

  checkDuplicate() {
    this.duplicateError = this.units
      .filter((u) => u.unitID !== this.unit.unitID) // ignore current record
      .some(
        (u) =>
          u.unitName.trim().toLowerCase() ===
          this.unit.unitName.trim().toLowerCase()
      );
  }

  /** Validate unit before save/update */
  private validateUnit(): boolean {
    this.unit.unitName = this.unit.unitName?.trim() || '';
    this.unit.unitCode = this.unit.unitCode?.trim() || '';
    this.checkDuplicate();
    if (!this.unit.unitName) {
      this.swall.warning('Validation', 'Unit Name is required!', () =>
        this.focusUnit()
      );
      return false;
    }
    if (this.duplicateError) {
      this.swall.warning('Validation', 'Unit already exists!', () =>
        this.focusUnit()
      );
      return false;
    }
    return true;
  }

  /** Save or update unit */
  saveOrUpdateUnit() {
    if (!this.validateUnit()) return;

    const userId = this.commonService.getCurrentUserId();
    const now = new Date().toISOString();

    if (this.unit.unitID === 0) {
      // New unit
      this.unit.createdByUserID = userId;
      this.unit.createdAt = now;
      this.unit.createdSystemName = 'AngularApp';
    }

    // Update info for both new and existing
    this.unit.updatedByUserID = userId;
    this.unit.updatedAt = now;
    this.unit.updatedSystemName = 'AngularApp';

    this.masterService.saveUnit(this.unit).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.loadUnits();
          this.resetUnit();
          this.swall.success(
            'Success',
            res.message || 'Unit saved successfully!',
            () => this.focusUnit()
          );
        } else {
          this.swall.error(
            'Error',
            res.message || 'Something went wrong!',
            () => this.focusUnit()
          );
        }
      },
      error: () =>
        this.swall.error('Error', 'Failed to save unit!', () =>
          this.focusUnit()
        ),
    });
  }

  /** Edit a unit */
  editUnit(u: Unit) {
    this.unit = { ...u };
    this.focusUnit();
  }

  /** Delete (mark inactive) a unit */
  deleteUnit(u: Unit) {
    this.swall
      .confirm(`Delete ${u.unitName}?`, 'This will mark the unit as inactive.')
      .then((result) => {
        if (!result.isConfirmed) return;

        const userId = this.commonService.getCurrentUserId();
        const now = new Date().toISOString();

        const deleted: Unit = {
          ...u,
          isActive: false,
          updatedByUserID: userId,
          updatedAt: now,
          updatedSystemName: 'AngularApp',
        };

        this.masterService.saveUnit(deleted).subscribe({
          next: (res: ApiResponse) =>
            res.success
              ? (this.loadUnits(),
                this.swall.success(
                  'Deleted!',
                  res.message || 'Unit deleted!',
                  () => this.focusUnit()
                ))
              : this.swall.error(
                  'Error',
                  res.message || 'Failed to delete unit!',
                  () => this.focusUnit()
                ),
          error: () =>
            this.swall.error('Error', 'Failed to delete unit!', () =>
              this.focusUnit()
            ),
        });
      });
  }

  /** Reset form */
  resetUnit() {
    this.unit = this.newUnit();
    this.duplicateError = false;
    this.focusUnit();
  }
}
