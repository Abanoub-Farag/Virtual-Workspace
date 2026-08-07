package app.virtual_workspace.accounts.repositories;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.models.enums.Role;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User savedUser;

    // this is Arrange

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = User.builder()
                .email("abanoub@test.com")
                .firstName("Abanoub")
                .lastName("Test")
                .password("P@ssword123")
                .build();

        savedUser = userRepository.save(user);
    }

    // findUserByEmail

    @Test
    void findUserByEmail_shouldReturnUser_whenEmailExists() {
        // Act
        Optional<User> result = userRepository.findUserByEmail("abanoub@test.com");

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isNotNull();
        assertThat(result.get().getEmail()).isEqualTo("abanoub@test.com");
        assertThat(result.get().getFirstName()).isEqualTo("Abanoub");
    }

    @Test
    void findUserByEmail_shouldReturnEmpty_whenEmailNotFound() {
        Optional<User> result = userRepository.findUserByEmail("notfound@test.com");

        assertThat(result).isEmpty();
    }

    // findUserById

    @Test
    void findUserById_shouldReturnUser_whenIdExists() {
        Optional<User> result = userRepository.findUserById(savedUser.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(savedUser.getId());
    }

    @Test
    void findUserById_shouldReturnEmpty_whenIdNotFound() {
        Optional<User> result = userRepository.findUserById(9999L);

        assertThat(result).isEmpty();
    }

    // getUserByEmail

    @Test
    void getUserByEmail_shouldReturnUser_whenEmailExists() {
        User result = userRepository.getUserByEmail("abanoub@test.com");

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("abanoub@test.com");
    }

    // getUserById

    @Test
    void getUserById_shouldReturnUser_whenIdExists() {
        User result = userRepository.getUserById(savedUser.getId());

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(savedUser.getId());
    }

    // unique email constraint

    @Test
    void save_shouldFail_whenEmailIsDuplicate() {
        User duplicate = User.builder()
                .email("abanoub@test.com")
                .firstName("Someone")
                .lastName("Else")
                .password("password")
                .build();

        org.junit.jupiter.api.Assertions.assertThrows(
                Exception.class,
                () -> {
                    userRepository.save(duplicate);
                    userRepository.flush();
                }
        );
    }


    @Test
    void save_shouldSetDefaultRole_whenRoleNotProvided() {
        assertThat(savedUser.getRole()).isEqualTo(Role.ROLE_USER);
    }

//    @Test
//    void save_shouldSetIsActiveTrue_byDefault() {
//        assertThat(savedUser.isEnabled()).isTrue();
//    }

    // timestamps

    @Test
    void save_shouldPopulateCreatedAtAndUpdatedAt() {
        assertThat(savedUser.getCreatedAt()).isNotNull();
        assertThat(savedUser.getUpdatedAt()).isNotNull();
    }
}