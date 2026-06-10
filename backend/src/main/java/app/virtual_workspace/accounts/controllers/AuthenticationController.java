package app.virtual_workspace.accounts.controllers;

import app.virtual_workspace.accounts.dtos.auth.AuthResponseDto;
import app.virtual_workspace.accounts.dtos.auth.LoginDto;
import app.virtual_workspace.accounts.dtos.auth.RegisterDto;
import app.virtual_workspace.accounts.services.interfaces.UserAuthService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<AuthResponseDto> register(@RequestBody RegisterDto user){
       return ResponseEntity.ok(userAuthService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto user){
        return ResponseEntity.ok(userAuthService.login(user));
    }
}
