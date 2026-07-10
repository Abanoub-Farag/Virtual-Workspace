package app.virtual_workspace.accounts.controllers;

import app.virtual_workspace.accounts.dtos.profile.UpdateUserProfileDto;
import app.virtual_workspace.accounts.dtos.profile.UserProfileDto;
import app.virtual_workspace.accounts.services.ProfileService;
import app.virtual_workspace.shared.dtos.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@PathVariable Long userId){
        UserProfileDto profile = profileService.getProfile(userId);

        ApiResponse<UserProfileDto> response = ApiResponse.<UserProfileDto>builder()
                                        .status(HttpStatus.OK.value())
                                        .message("Returned user profile successfully")
                                        .data(profile)
                                        .build();

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PutMapping("")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @Valid @RequestBody UpdateUserProfileDto updateDto
    ){
        UserProfileDto profile = profileService.updateProfile(updateDto);

        ApiResponse<UserProfileDto> response = ApiResponse.<UserProfileDto>builder()
                                        .status(HttpStatus.OK.value())
                                        .message("Update user profile successfully")
                                        .data(profile)
                                        .build();

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
