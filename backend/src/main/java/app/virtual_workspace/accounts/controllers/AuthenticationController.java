package app.virtual_workspace.accounts.controllers;

import app.virtual_workspace.accounts.dtos.auth.AuthResponseDto;
import app.virtual_workspace.accounts.dtos.auth.LoginDto;
import app.virtual_workspace.accounts.dtos.auth.RegisterDto;
import app.virtual_workspace.accounts.dtos.data.UserDataDto;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.accounts.services.UserService;
import app.virtual_workspace.shared.dtos.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final UserAuthService userAuthService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(@Valid @RequestBody RegisterDto request){
        AuthResponseDto authResponseDto = userAuthService.register(request);
        ApiResponse<AuthResponseDto> response = ApiResponse.<AuthResponseDto>builder()
                                        .status(HttpStatus.CREATED.value())
                                        .message("User registered successfully")
                                        .data(authResponseDto)
                                        .build();

       return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@Valid @RequestBody LoginDto user){
        AuthResponseDto authResponseDto = userAuthService.login(user);
        ApiResponse<AuthResponseDto> response = ApiResponse.<AuthResponseDto>builder()
                                        .status(HttpStatus.OK.value())
                                        .message("User logged in successfully")
                                        .data(authResponseDto)
                                        .build();

        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/user/{userId}/data")
    public ResponseEntity<ApiResponse<UserDataDto>> userData(@PathVariable Long userId){
        UserDataDto userDataDto = userService.userData(userId);
        ApiResponse<UserDataDto> response = ApiResponse.<UserDataDto>builder()
                .status(HttpStatus.OK.value())
                .message("Retrieved User data successfully")
                .data(userDataDto)
                .build();

        return ResponseEntity.ok().body(response);
    }
}
