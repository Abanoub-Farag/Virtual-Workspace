package app.virtual_workspace.accounts.services.interfaces;

import app.virtual_workspace.accounts.dtos.profile.UpdateUserProfileDto;
import app.virtual_workspace.accounts.dtos.profile.UserProfileDto;

public interface ProfileService {
    void createProfile(Long userId);
    UserProfileDto getProfile(Long userId);
    UserProfileDto updateProfile(Long userId, UpdateUserProfileDto userProfileDto);
}
