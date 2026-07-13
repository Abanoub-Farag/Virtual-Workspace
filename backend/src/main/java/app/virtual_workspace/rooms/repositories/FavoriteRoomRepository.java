package app.virtual_workspace.rooms.repositories;

import app.virtual_workspace.rooms.models.FavoriteRoom;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRoomRepository extends JpaRepository<FavoriteRoom, Long> {

    @EntityGraph(attributePaths = {"room"})
    Slice<FavoriteRoom> findFavoriteRoomsByUserId(Long userId, Pageable pageable);

    Optional<FavoriteRoom> findFavoriteRoomByUserIdAndRoomId(Long userId, Long roomId);

    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
}
