package app.virtual_workspace.accounts.services;

import app.virtual_workspace.accounts.dtos.profile.UpdateUserProfileDto;
import app.virtual_workspace.accounts.dtos.profile.UserProfileDto;
import app.virtual_workspace.accounts.mappers.ProfileMapper;
import app.virtual_workspace.accounts.models.Profile;
import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.repositories.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserService userService;
    private final ProfileMapper profileMapper;
    private final UserAuthService userAuthService;

    public void createProfile(Long userId) {
        User user = userService.findUserById(userId);

        Profile profile = new Profile();
        profile.setUser(user);
        profileRepository.save(profile);
    }

    public UserProfileDto getProfile(Long userId) {
        User user = userService.findUserById(userId);

        Profile profile = user.getProfile();

        return profileMapper.toUserProfileDto(user, profile);
    }

    public UserProfileDto updateProfile(UpdateUserProfileDto updateDto) {
        User user = userAuthService.getAuthenticatedUser();

        Profile profile = user.getProfile();

        if (updateDto.getFirstName() != null && !updateDto.getFirstName().isBlank()) {
            user.setFirstName(updateDto.getFirstName());
        }
        if (updateDto.getLastName() != null && !updateDto.getLastName().isBlank()) {
            user.setLastName(updateDto.getLastName());
        }

        if (updateDto.getBio() != null) {
            profile.setBio(updateDto.getBio());
        }
        if (updateDto.getGender() != null) {
            profile.setGender(updateDto.getGender());
        }
        if (updateDto.getDateOfBirth() != null) {
            profile.setDateOfBirth(updateDto.getDateOfBirth());
        }

        userService.saveUser(user);
        profileRepository.save(profile);

        return profileMapper.toUserProfileDto(user, profile);
    }
}
