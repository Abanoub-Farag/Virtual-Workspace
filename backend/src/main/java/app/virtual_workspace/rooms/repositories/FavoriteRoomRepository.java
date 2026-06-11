package app.virtual_workspace.rooms.repositories;

import app.virtual_workspace.rooms.models.FavoriteRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRoomRepository extends JpaRepository<FavoriteRoom, Long> {
    List<FavoriteRoom> findFavoriteRoomsByUserId(Long userId);

    FavoriteRoom findFavoriteRoomsByUserIdAndRoomId(Long userId, Long roomId);
}
