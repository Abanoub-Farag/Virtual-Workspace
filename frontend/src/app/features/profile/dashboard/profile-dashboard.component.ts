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
import { ProfileService, UserProfileData, UpdateProfileRequest } from '../services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SidebarComponent } from '../../rooms/components/sidebar/sidebar.component';
import { TopNavComponent } from '../../rooms/components/top-nav/top-nav.component';
import { LucideAngularModule, Github, Linkedin, Twitter, Globe, User as UserIcon } from 'lucide-angular';

// ─── Custom Validators ────────────────────────────────────────────────────────

/** Ensures the value matches the YYYY-MM-DD format. */
function dateFormatValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null; // handled by required
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : { dateFormat: true };
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

  readonly GithubIcon = Github;
  readonly LinkedinIcon = Linkedin;
  readonly TwitterIcon = Twitter;
  readonly GlobeIcon = Globe;
  readonly UserIcon = UserIcon;

  profile = signal<UserProfileData | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  isSavingUser = signal<boolean>(false);
  isSavingSocial = signal<boolean>(false);

  userInfoForm!: FormGroup;
  socialLinksForm!: FormGroup;

  constructor() {
    this.userInfoForm = this.fb.group({
      firstName:   ['', Validators.required],
      lastName:    ['', Validators.required],
      displayName: [''],
      professionalHeadline: [''],
      email:       [{ value: '', disabled: true }],
      bio:         [''],
      gender:      ['', Validators.required],
      dateOfBirth: ['', [Validators.required, dateFormatValidator]],
    });

    this.socialLinksForm = this.fb.group({
      githubUrl:        [''],
      linkedinProfile:  [''],
      twitterUsername:  [''],
      websitePortfolio: [''],
    });
  }

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    const user = this.authService.getUser();
    const identifier = user?.id;

    if (!identifier) {
      this.error.set('Could not determine user identity from session.');
      this.isLoading.set(false);
      return;
    }

    this.profileService.getProfile(identifier).subscribe({
      next: (response) => {
        if (response.data) {
          this.profile.set(response.data);
          this.patchForms(response.data);
        } else {
          this.error.set('No profile data received.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error.set('Failed to load profile. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  private patchForms(data: UserProfileData): void {
    this.userInfoForm.patchValue({
      firstName:   data.firstName ?? '',
      lastName:    data.lastName ?? '',
      displayName: data.displayName ?? `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      professionalHeadline: data.professionalHeadline ?? '',
      email:       data.email ?? '',
      bio:         data.bio ?? '',
      gender:      data.gender ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
    });

    this.socialLinksForm.patchValue({
      githubUrl:        data.githubUrl ?? '',
      linkedinProfile:  data.linkedinProfile ?? '',
      twitterUsername:  data.twitterUsername ?? '',
      websitePortfolio: data.websitePortfolio ?? '',
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

        // Show success notification
        this.toastService.success(response.message ?? 'Profile updated successfully.');
      },
      error: (err) => {
        this.isSavingUser.set(false);

        // Map backend field-level errors onto form controls
        const backendErrors: Record<string, string> | null = err?.errors ?? err?.error?.errors ?? null;
        if (backendErrors && typeof backendErrors === 'object') {
          Object.entries(backendErrors).forEach(([field, message]) => {
            const control = this.userInfoForm.get(field);
            if (control) {
              control.setErrors({ serverError: message });
              control.markAsTouched();
            }
          });
        }

        const message: string = err?.message ?? err?.error?.message ?? 'Failed to update profile. Please try again.';
        this.toastService.error(message);
      },
    });
  }

  onSaveSocialLinks(): void {
    if (this.socialLinksForm.invalid) {
      this.socialLinksForm.markAllAsTouched();
      return;
    }

    this.isSavingSocial.set(true);
    const updatedData = this.socialLinksForm.value;

    setTimeout(() => {
      this.isSavingSocial.set(false);
      const current = this.profile();
      if (current) {
        this.profile.set({ ...current, ...updatedData });
      }
    }, 500);
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
