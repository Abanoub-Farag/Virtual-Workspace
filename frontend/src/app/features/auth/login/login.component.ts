import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService, AuthError } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly themeService = inject(ThemeService);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly serverError = signal<string | null>(null);

  loginForm!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  get email(): AbstractControl {
    return this.loginForm.get('email')!;
  }

  get password(): AbstractControl {
    return this.loginForm.get('password')!;
  }

  showError(ctrl: AbstractControl): boolean {
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.authService
      .login({ email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err: AuthError) => this.handleError(err),
      });
  }

  private handleSuccess(): void {
    this.isLoading.set(false);
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    const target = redirect && redirect !== '/login' ? redirect : '/rooms';
    this.router.navigateByUrl(target, { replaceUrl: true });
  }

  private handleError(err: AuthError): void {
    this.isLoading.set(false);
    this.serverError.set(err.message);

    if (!err.fieldErrors) return;

    Object.entries(err.fieldErrors).forEach(([field, msg]) => {
      this.loginForm.get(field)?.setErrors({ serverError: msg });
    });
  }
}
