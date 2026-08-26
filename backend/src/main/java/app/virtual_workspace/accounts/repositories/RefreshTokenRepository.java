package app.virtual_workspace.accounts.repositories;

import app.virtual_workspace.accounts.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String refreshToken);
    Optional<RefreshToken> findByUserId(Long userId);
}
