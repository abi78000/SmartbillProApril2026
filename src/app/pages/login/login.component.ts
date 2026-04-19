import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CommonserviceService } from '../../services/commonservice.service';
import { User } from '../models/common-models/user';
import { InputRestrictDirective } from '../../directives/input-restrict.directive';
import { IconsModule } from '../../shared/icons.module';

interface RegisterResponse {
  success: boolean;
  companyID: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputRestrictDirective,IconsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  activeTab: 'login' | 'register' = 'login';

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  apiUsers: User[] = [];
  isAdmin = false;

  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonserviceService
  ) {}


  ngOnInit(): void {
    this.initForms();
    this.loadApiUsers();
  }


  showPassword = false;

togglePassword() {
  this.showPassword = !this.showPassword;
}
  private initForms(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      companyName: ['', Validators.required],
      userName: ['', Validators.required],
      passwordHash: ['', Validators.required],
    });
  }


  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }


  login(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    const { userName, password } = this.loginForm.value;

    if (userName === 'ADMIN' && password === '123') {
      localStorage.setItem('userId', '0');
      localStorage.setItem('userName', 'ADMIN');
      localStorage.setItem('role', 'ADMIN');

      this.router.navigate(['/default/master/dashboard']);
      return;
    }
console.log('API Users:', this.apiUsers);
    const apiUser = this.apiUsers.find(
      (u) =>
        u.userName === userName &&
        u.passwordHash === password &&
        u.isActive === true
    );

    if (apiUser) {
      localStorage.setItem('userId', apiUser.userID.toString());
      localStorage.setItem('userName', apiUser.userName);
      localStorage.setItem('companyId', apiUser.companyID.toString());
      localStorage.setItem('role', 'client');

      this.router.navigate(['/default/master/dashboard']);
      return;
    }

    const localUsers: any[] = JSON.parse(
      localStorage.getItem('users') || '[]'
    );

    const localUser = localUsers.find(
      (u: any) => u.userName === userName && u.password === password
    );

    if (localUser) {
      localStorage.setItem('userId', localUser.userId);
      localStorage.setItem('userName', localUser.userName);
      localStorage.setItem('companyId', localUser.companyId);
      localStorage.setItem('role', 'client');

      this.router.navigate(['/default/master/dashboard']);
      return;
    }

    this.errorMessage = 'Invalid username or password';
  }

  private loadApiUsers(): void {
    this.commonService.getUsers().subscribe({
      next: (res: User[]) => {
        this.apiUsers = res;
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
      },
    });
  }


  register(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Company name, username and password are required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      companyName: this.registerForm.value.companyName,
      userName: this.registerForm.value.userName,
      passwordHash: this.registerForm.value.passwordHash,

      // optional
      companyEmail: '',
      userEmail: '',
      phone: '',
    };

    this.commonService.register(payload).subscribe({
      next: (res: RegisterResponse) => {
        this.loading = false;

        if (!res.success) {
          this.errorMessage = 'Registration failed';
          return;
        }

        const localUsers: any[] = JSON.parse(
          localStorage.getItem('users') || '[]'
        );

        const exists = localUsers.some(
          (u: any) => u.userName === payload.userName
        );

        if (exists) {
          this.errorMessage = 'Username already exists';
          return;
        }

        localUsers.push({
          userId: Date.now().toString(),
          companyId: res.companyID,
          userName: payload.userName,
          password: payload.passwordHash,
        });

        localStorage.setItem('users', JSON.stringify(localUsers));

        alert('Company registered successfully');
        this.registerForm.reset();
        this.switchTab('login');
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Registration failed';
      },
    });
  }
}
