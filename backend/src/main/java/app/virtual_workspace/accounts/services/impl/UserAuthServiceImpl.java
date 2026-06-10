package app.virtual_workspace.accounts.services.impl;

import app.virtual_workspace.accounts.dtos.auth.AuthResponseDto;
import app.virtual_workspace.accounts.dtos.auth.LoginDto;
import app.virtual_workspace.accounts.dtos.auth.RegisterDto;
import app.virtual_workspace.accounts.events.UserRegisteredEvent;
import app.virtual_workspace.accounts.mappers.AuthMapper;
import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.repositories.UserRepository;
import app.virtual_workspace.accounts.services.interfaces.UserAuthService;
import app.virtual_workspace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserAuthServiceImpl implements UserAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public AuthResponseDto register(RegisterDto request){
        User user = authMapper.registerDtoToModel(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);

        UserRegisteredEvent event = new UserRegisteredEvent(savedUser.getId());
        applicationEventPublisher.publishEvent(event);

        String token = jwtService.generateToken(user.getUsername());

        return AuthResponseDto.builder().token(token).build();
    }

    @Override
    public AuthResponseDto login(LoginDto request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = jwtService.generateToken(request.getEmail());
        return AuthResponseDto.builder().token(token).build();
    }

//    @Override
//    public Long getCurrentUserId(String userName){
//        Optional<User> user = userRepository.findUserByEmail(userName);
//        return user.get().getId();
//    }


    @Override
    public boolean isOwner(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()){
            return false;
        }

        User user = (User) authentication.getPrincipal();

        return userId.equals(user.getId());
    }
}