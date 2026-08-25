import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ProfileService,
  UserProfileData,
  UpdateProfileRequest,
  parseApiError,
} from '../services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SidebarComponent } from '../../rooms/components/sidebar/sidebar.component';
import { TopNavComponent } from '../../rooms/components/top-nav/top-nav.component';
import { LucideAngularModule, User as UserIcon } from 'lucide-angular';

interface PageError {
  title: string;
  hint: string;
}

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SidebarComponent,
    TopNavComponent,
    LucideAngularModule,
  ],
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.scss'],
})
export class ProfileDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly UserIcon = UserIcon;

  profile = signal<UserProfileData | null>(null);
  isLoading = signal<boolean>(true);
  pageError = signal<PageError | null>(null);
  isSavingUser = signal<boolean>(false);
  initialFormValues = signal<any>(null);

  userInfoForm: FormGroup = this.fb.group({
    firstName:   ['', Validators.required],
    lastName:    ['', Validators.required],
    email:       [{ value: '', disabled: true }],
    bio:         [''],
    gender:      [''],
    dateOfBirth: [''],
  });

  get isFormDirty(): boolean {
    const current = this.userInfoForm.getRawValue();
    const initial = this.initialFormValues();
    if (!initial) return false;
    
    return Object.keys(current).some(key => current[key] !== initial[key]);
  }

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    const user = this.authService.getUser();
    const identifier = user?.id;

    if (!identifier) {
      this.pageError.set({
        title: 'Session error',
        hint: 'We could not determine your identity. Please log out and sign in again.',
      });
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.pageError.set(null);

    this.profileService.getProfile(identifier)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.data) {
            this.pageError.set({
              title: 'No profile data',
              hint: 'The server returned an empty response. Please try again.',
            });
            this.isLoading.set(false);
            return;
          }

          this.profile.set(response.data);
          this.patchForms(response.data);
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          const parsed = parseApiError(err);
          this.pageError.set({
            title: this.loadErrorTitle(err.status),
            hint: parsed.message,
          });
          this.isLoading.set(false);
        },
      });
  }

  private loadErrorTitle(status: number): string {
    if (!navigator.onLine || status === 0) return 'No connection';
    if (status === 401 || status === 403) return 'Access denied';
    if (status === 404) return 'Profile not found';
    return 'Failed to load profile';
  }

  private patchForms(data: UserProfileData): void {
    this.userInfoForm.patchValue({
      firstName:   data.firstName ?? '',
      lastName:    data.lastName ?? '',
      email:       data.email ?? '',
      bio:         data.bio ?? '',
      gender:      data.gender ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
    });
    
    this.initialFormValues.set(this.userInfoForm.getRawValue());
  }

  onSaveUserInfo(): void {
    if (this.userInfoForm.invalid) {
      this.userInfoForm.markAllAsTouched();
      return;
    }

    this.isSavingUser.set(true);

    const raw = this.userInfoForm.getRawValue();
    const payload: UpdateProfileRequest = {
      firstName:   raw.firstName,
      lastName:    raw.lastName,
      bio:         raw.bio ?? '',
      gender:      raw.gender || undefined,
      dateOfBirth: raw.dateOfBirth || undefined,
    };

    this.profileService.updateProfile(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isSavingUser.set(false);

          if (response.data) {
            this.profile.set(response.data);
            this.patchForms(response.data);
          }

          this.toastService.success(response.message ?? 'Profile updated successfully.');
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingUser.set(false);
          const parsed = parseApiError(err);

          if (err.status === 400 && Object.keys(parsed.fieldErrors).length > 0) {
            this.applyFieldErrors(parsed.fieldErrors);
          }

          this.toastService.error(parsed.message);
        },
      });
  }

  private applyFieldErrors(fieldErrors: Record<string, string>): void {
    for (const [field, message] of Object.entries(fieldErrors)) {
      const control = this.userInfoForm.get(field);
      if (control) {
        control.setErrors({ serverError: message });
        control.markAsTouched();
      }
    }
  }

  get formattedCreatedAt(): string {
    const data = this.profile();
    if (!data?.createdAt) return 'Unknown';
    return new Date(data.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  getServerError(field: string): string | null {
    return this.userInfoForm.get(field)?.errors?.['serverError'] ?? null;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.userInfoForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
