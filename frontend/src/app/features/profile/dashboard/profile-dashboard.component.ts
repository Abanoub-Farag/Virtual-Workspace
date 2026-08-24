import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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

// ─── Custom Validators ────────────────────────────────────────────────────────

/** Ensures the value matches the YYYY-MM-DD format. */
function dateFormatValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null; // handled by required
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : { dateFormat: true };
}

// ─── Page-level error state ───────────────────────────────────────────────────

interface PageError {
  title: string;
  hint: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

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

  readonly UserIcon = UserIcon;

  profile = signal<UserProfileData | null>(null);
  isLoading = signal<boolean>(true);

  /** Structured page-level error for the initial load failure state. */
  pageError = signal<PageError | null>(null);

  isSavingUser = signal<boolean>(false);

  userInfoForm!: FormGroup;

  constructor() {
    this.userInfoForm = this.fb.group({
      firstName:   ['', Validators.required],
      lastName:    ['', Validators.required],
      email:       [{ value: '', disabled: true }],
      bio:         [''],
      gender:      ['', Validators.required],
      dateOfBirth: ['', [Validators.required, dateFormatValidator]],
    });
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

    this.profileService.getProfile(identifier).subscribe({
      next: (response) => {
        if (response.data) {
          this.profile.set(response.data);
          this.patchForms(response.data);
        } else {
          this.pageError.set({
            title: 'No profile data',
            hint: 'The server returned an empty response. Please try again.',
          });
        }
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
      gender:      raw.gender as 'MALE' | 'FEMALE',
      dateOfBirth: raw.dateOfBirth,
    };

    this.profileService.updateProfile(payload).subscribe({
      next: (response) => {
        this.isSavingUser.set(false);

        // Update local profile signal with fresh data from the server
        if (response.data) {
          this.profile.set(response.data);
          this.patchForms(response.data);
        }

        this.toastService.success(response.message ?? 'Profile updated successfully.');
      },
      error: (err: HttpErrorResponse) => {
        this.isSavingUser.set(false);
        const parsed = parseApiError(err);

        // ── 400: Apply field-level errors directly onto form controls ─────────
        if (err.status === 400 && Object.keys(parsed.fieldErrors).length > 0) {
          for (const [field, message] of Object.entries(parsed.fieldErrors)) {
            const control = this.userInfoForm.get(field);
            if (control) {
              control.setErrors({ serverError: message });
              control.markAsTouched();
            }
          }
        }

        this.toastService.error(parsed.message);
      },
    });
  }

  // ─── Template helpers ───────────────────────────────────────────────────────

  get formattedCreatedAt(): string {
    const data = this.profile();
    if (!data?.createdAt) return 'Unknown';
    return new Date(data.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  /** Returns the server-error message for a given field control, if present. */
  getServerError(field: string): string | null {
    return this.userInfoForm.get(field)?.errors?.['serverError'] ?? null;
  }

  /** Convenience accessor: true when a control is invalid and has been touched. */
  isInvalid(field: string): boolean {
    const ctrl = this.userInfoForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
