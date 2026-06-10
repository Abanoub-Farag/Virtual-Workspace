package app.virtual_workspace.accounts.services.impl;

import app.virtual_workspace.accounts.dtos.profile.UpdateUserProfileDto;
import app.virtual_workspace.accounts.dtos.profile.UserProfileDto;
import app.virtual_workspace.accounts.mappers.ProfileMapper;
import app.virtual_workspace.accounts.models.Profile;
import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.repositories.ProfileRepository;
import app.virtual_workspace.accounts.repositories.UserRepository;
import app.virtual_workspace.accounts.services.interfaces.ProfileService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;

    @Override
    public void createProfile(Long userId) {
        User user = userRepository.findUserById(userId)
                        .orElseThrow(() -> new EntityNotFoundException("User with id " + userId + " not found"));

        Profile profile = new Profile();
        profile.setUser(user);
        profileRepository.save(profile);
    }

    @Override
    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.getUserById(userId);

        Profile profile = user.getProfile();

        return profileMapper.toUserProfileDto(user, profile);
    }

    @Override
    public UserProfileDto updateProfile(Long userId, UpdateUserProfileDto updateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

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

        userRepository.save(user);
        profileRepository.save(profile);

        return profileMapper.toUserProfileDto(user, profile);
    }
}
