package app.virtual_workspace.rooms.repositories;

import app.virtual_workspace.rooms.models.FavoriteRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRoomRepository extends JpaRepository<FavoriteRoom, Long> {
    List<FavoriteRoom> findFavoriteRoomsByUserId(Long userId);

    Optional<FavoriteRoom> findFavoriteRoomByUserIdAndRoomId(Long userId, Long roomId);

    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
}
