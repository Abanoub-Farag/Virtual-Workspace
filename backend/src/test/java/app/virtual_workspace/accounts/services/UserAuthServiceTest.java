package app.virtual_workspace.accounts.services;

import app.virtual_workspace.accounts.dtos.auth.AuthResponseDto;
import app.virtual_workspace.accounts.dtos.auth.LoginDto;
import app.virtual_workspace.accounts.dtos.auth.RegisterDto;
import app.virtual_workspace.accounts.mappers.AuthMapper;
import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.repositories.UserRepository;
import app.virtual_workspace.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
public class UserAuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthMapper authMapper;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private ApplicationEventPublisher applicationEventPublisher;

    @InjectMocks private UserAuthService userAuthService;

    private RegisterDto registerDto;

    @BeforeEach
    void setup(){
        registerDto = RegisterDto.builder()
                .email("Abanoub@test.com")
                .firstName("Abanoub")
                .lastName("test")
                .password("P@ssword123")
                .build();
    }

    @Test
    void register_shouldReturnAuthResponseDto_whenUserIsCreated(){
        User user = User.builder()
                .email("Abanoub@test.com")
                .firstName("Abanoub")
                .lastName("test")
                .password("P@ssword123")
                .build();
        when(authMapper.registerDtoToModel(registerDto)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("Hashed_Paswword");
        when(userRepository.save(any())).thenReturn(user);
        when(jwtService.generateToken(any())).thenReturn("fake_jwt_token");

        AuthResponseDto result = userAuthService.register(registerDto);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("fake_jwt_token");

        verify(passwordEncoder, times(1)).encode(any());
        verify(userRepository, times(1)).save(any());
        verify(applicationEventPublisher, times(1)).publishEvent(any(Object.class));
    }

    @Test
    void register_shouldThrowException_whenSaveFails(){
        User user = User.builder()
                .email("Abanoub@test.com")
                .password("P@ssword123")
                .build();

        when(authMapper.registerDtoToModel(registerDto)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(userRepository.save(any())).thenThrow(new RuntimeException("duplicate email"));

        assertThrows(RuntimeException.class, () -> userAuthService.register(registerDto));

        verify(applicationEventPublisher, never()).publishEvent(any(Object.class));
    }

    @Test
    void login_shouldReturnAuthResponseDto_whenCredentialsAreCorrect(){
        LoginDto loginDto = new LoginDto("Abanoub@test.com", "P@ssword123");
        String expectedToken = "fake_jwt_token";

        when(jwtService.generateToken("Abanoub@test.com")).thenReturn(expectedToken);

        AuthResponseDto result = userAuthService.login(loginDto);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo(expectedToken);

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_shouldThrowException_whenCredentialsAreInvalid() {
        LoginDto loginDto = new LoginDto("wrong@test.com", "wrong_password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.core.AuthenticationException("Bad credentials") {});

        assertThrows(org.springframework.security.core.AuthenticationException.class,
                () -> userAuthService.login(loginDto));

        verify(jwtService, never()).generateToken(any());
    }

}