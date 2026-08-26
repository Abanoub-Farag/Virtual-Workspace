package app.virtual_workspace.accounts.controllers;

import app.virtual_workspace.accounts.dtos.auth.AuthResponseDto;
import app.virtual_workspace.accounts.dtos.auth.LoginDto;
import app.virtual_workspace.accounts.dtos.auth.RegisterDto;
import app.virtual_workspace.accounts.dtos.data.UserDataDto;
import app.virtual_workspace.accounts.repositories.RefreshTokenRepository;
import app.virtual_workspace.accounts.services.RefreshTokenService;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.accounts.services.UserService;
import app.virtual_workspace.security.JwtService;
import app.virtual_workspace.shared.dtos.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final UserAuthService userAuthService;
    private final UserService userService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

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

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken(@RequestBody Map<String, String> payload) {
        String requestToken = payload.get("refreshToken");

        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    if (refreshTokenService.isTokenExpired(token)) {
                        refreshTokenRepository.delete(token);

                        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Refresh token expired. Please login again.")
                                .build();

                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                    }

                    String newJwt = jwtService.generateToken(token.getUser().getEmail(), token.getUser().getId());

                    ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                            .status(HttpStatus.OK.value())
                            .message("Token refreshed successfully")
                            .data(Map.of("token", newJwt))
                            .build();

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message("Invalid refresh token.")
                            .build();

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody Map<String, String> payload) {
        String requestToken = payload.get("refreshToken");

        if (requestToken == null || requestToken.isBlank()) {
            ApiResponse<Void> response = ApiResponse.<Void>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Refresh token is required.")
                    .build();
            return ResponseEntity.badRequest().body(response);
        }

        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    refreshTokenRepository.delete(token);
                    ApiResponse<Void> response = ApiResponse.<Void>builder()
                            .status(HttpStatus.OK.value())
                            .message("Logged out successfully.")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    ApiResponse<Void> response = ApiResponse.<Void>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message("Invalid refresh token.")
                            .build();
                    return ResponseEntity.badRequest().body(response);
                });
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
