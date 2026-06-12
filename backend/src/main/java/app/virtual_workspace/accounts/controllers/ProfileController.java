package app.virtual_workspace.accounts.controllers;

import app.virtual_workspace.accounts.dtos.profile.UpdateUserProfileDto;
import app.virtual_workspace.accounts.dtos.profile.UserProfileDto;
import app.virtual_workspace.accounts.services.ProfileService;
import app.virtual_workspace.accounts.services.UserAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable Long userId){
        UserProfileDto profile = profileService.getProfile(userId);

        return ResponseEntity.status(HttpStatus.OK).body(profile);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("@userAuthService.isOwner(#userId)")
    public ResponseEntity<UserProfileDto> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserProfileDto updateDto
    ){
        UserProfileDto profile = profileService.updateProfile(userId, updateDto);

        return ResponseEntity.ok(profile);
    }

}
