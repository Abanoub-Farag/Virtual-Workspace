import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService, AuthError } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

/** Exact pattern from the Spring Boot RegisterDto */
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,64}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, OnDestroy {
  // ─── DI ────────────────────────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  /** Shared theme service — single source of truth across all pages. */
  readonly themeService = inject(ThemeService);

  // ─── Signals ───────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  // ─── Form ──────────────────────────────────────────────────────────────────
  registerForm!: FormGroup;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Form Builder ──────────────────────────────────────────────────────────
  private buildForm(): void {
    this.registerForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          Validators.pattern(PASSWORD_PATTERN),
        ],
      ],
    });
  }

  // ─── Control accessors ─────────────────────────────────────────────────────
  get firstName(): AbstractControl {
    return this.registerForm.get('firstName')!;
  }
  get lastName(): AbstractControl {
    return this.registerForm.get('lastName')!;
  }
  get email(): AbstractControl {
    return this.registerForm.get('email')!;
  }
  get password(): AbstractControl {
    return this.registerForm.get('password')!;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  showError(ctrl: AbstractControl): boolean {
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);
    this.successMessage.set(null);
    this.fieldErrors.set({});

    const payload = this.registerForm.getRawValue();

    this.authService
      .register(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.registerForm.disable();

          // ── Success feedback ──────────────────────────────────────────────
          const msg = 'Account created successfully! Redirecting to login…';
          this.successMessage.set(msg);
          this.toastService.success(msg, 3500);

          // Redirect to /login after a short delay so the user can read the feedback
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err: AuthError) => {
          this.isLoading.set(false);

          // ── Map 409 Conflict → email field inline error ───────────────────
          if (err.status === 409) {
            const conflictMsg =
              err.message ||
              'An account with this email already exists. Please log in or use a different address.';
            this.email.setErrors({ serverError: conflictMsg });
            this.serverError.set(conflictMsg);
            this.toastService.error(conflictMsg);
            return;
          }

          // ── Generic server/network error ──────────────────────────────────
          this.serverError.set(err.message);
          this.toastService.error(err.message);

          // ── Per-field server validation errors ────────────────────────────
          if (err.fieldErrors && Object.keys(err.fieldErrors).length) {
            this.fieldErrors.set(err.fieldErrors);
            Object.entries(err.fieldErrors).forEach(([field, msg]) => {
              this.registerForm.get(field)?.setErrors({ serverError: msg });
            });
          }
        },
      });
  }
}
