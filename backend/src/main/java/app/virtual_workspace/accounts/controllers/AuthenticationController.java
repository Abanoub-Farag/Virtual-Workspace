package app.virtual_workspace.accounts.controllers;

import app.virtual_workspace.accounts.dtos.auth.AuthResponseDto;
import app.virtual_workspace.accounts.dtos.auth.LoginDto;
import app.virtual_workspace.accounts.dtos.auth.RegisterDto;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.shared.dtos.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final UserAuthService userAuthService;

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
}
