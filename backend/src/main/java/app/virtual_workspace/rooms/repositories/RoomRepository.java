package app.virtual_workspace.rooms.repositories;

import app.virtual_workspace.rooms.models.Room;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Room getRoomById(Long roomId);

    Slice<Room> findBy(Pageable pageable);

}
