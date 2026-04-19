import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { CommonserviceService as CommonService } from '../../../services/commonservice.service';
import { CompanyDashboardResponseDto } from '../../models/common-models/companyMaster';
import { AuthService } from '../../../authentication/auth-service.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-default-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule,SharedModule],
  templateUrl: './default-dashboard.component.html',
  styleUrl: './default-dashboard.component.css',
})
export class DefaultDashboardComponent implements OnInit {

  // =======================
  // DASHBOARD DATA
  // =======================
  dashboardData!: CompanyDashboardResponseDto;
  loading = false;
  errorMessage = '';

  // =======================
  // AUTH / CONTEXT
  // =======================
  companyId!: number;
  userName: string = 'User'; // fallback

  // =======================
  // DATE FILTER
  // =======================
  fromDate!: string;
  toDate!: string;
  today!: string;

  constructor(
    private commonService: CommonService,
    private authService: AuthService
  ) {}

  // =======================
  // INIT
  // =======================
  ngOnInit(): void {
    const cid = this.authService.companyId;
    if (!cid) {
      this.errorMessage = 'Company not found. Please login again.';
      return;
    }

    this.companyId = cid;

    this.userName = this.authService.userName ?? 'User';

    this.today = new Date().toISOString().split('T')[0];

    this.fromDate = this.today;
    this.toDate = this.today;

    this.loadDashboard();
  }

  // =======================
  // DATE CHANGE HANDLER
  // =======================
  onDateChange(): void {
    if (!this.fromDate || !this.toDate) return;

    // Safety: fromDate should not exceed toDate
    if (this.fromDate > this.toDate) {
      this.fromDate = this.toDate;
    }

    this.loadDashboard();
  }

  // =======================
  // API CALL
  // =======================
  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.commonService
      .getCompanyDashboard(this.companyId, this.fromDate, this.toDate)
      .subscribe({
        next: (res) => {
          this.dashboardData = res;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load dashboard data';
          this.loading = false;
        },
      });
  }
}
