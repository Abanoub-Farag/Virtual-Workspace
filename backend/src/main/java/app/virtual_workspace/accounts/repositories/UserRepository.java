package app.virtual_workspace.accounts.repositories;

import app.virtual_workspace.accounts.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserByEmail(String email);

    Optional<User> findUserById(Long id);

    User getUserByEmail(String email);

    User getUserById(Long id);
}
