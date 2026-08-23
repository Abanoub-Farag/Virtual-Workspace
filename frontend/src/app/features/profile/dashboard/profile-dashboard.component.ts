import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, UserProfileData } from '../services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../rooms/components/sidebar/sidebar.component';
import { TopNavComponent } from '../../rooms/components/top-nav/top-nav.component';
import { LucideAngularModule, Github, Linkedin, Twitter, Globe, User as UserIcon } from 'lucide-angular';

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    TopNavComponent,
    LucideAngularModule
  ],
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.scss']
})
export class ProfileDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);

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

  userInfoForm: FormGroup;
  socialLinksForm: FormGroup;

  constructor() {
    this.userInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      displayName: [''],
      professionalHeadline: [''],
      email: [{ value: '', disabled: true }],
      bio: ['']
    });

    this.socialLinksForm = this.fb.group({
      githubUrl: [''],
      linkedinProfile: [''],
      twitterUsername: [''],
      websitePortfolio: ['']
    });
  }

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
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
      }
    });
  }

  private patchForms(data: UserProfileData) {
    this.userInfoForm.patchValue({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      professionalHeadline: data.professionalHeadline || '',
      email: data.email || '',
      bio: data.bio || ''
    });

    this.socialLinksForm.patchValue({
      githubUrl: data.githubUrl || '',
      linkedinProfile: data.linkedinProfile || '',
      twitterUsername: data.twitterUsername || '',
      websitePortfolio: data.websitePortfolio || ''
    });
  }

  onSaveUserInfo() {
    if (this.userInfoForm.invalid) {
      this.userInfoForm.markAllAsTouched();
      return;
    }

    this.isSavingUser.set(true);
    const updatedData = this.userInfoForm.getRawValue();
    
    // Fallback: Just simulate a success if no real PUT endpoint is ready
    setTimeout(() => {
      this.isSavingUser.set(false);
      // If we had a real endpoint we'd call profileService.updateProfile(...)
      // and update the this.profile signal upon success
      const current = this.profile();
      if (current) {
        this.profile.set({ ...current, ...updatedData });
      }
    }, 500);
  }

  onSaveSocialLinks() {
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

  get formattedCreatedAt(): string {
    const data = this.profile();
    if (!data?.createdAt) return 'Unknown';
    const date = new Date(data.createdAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
