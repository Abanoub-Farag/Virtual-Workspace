package app.virtual_workspace.rooms.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.exceptions.custom.ResourceNotFound;
import app.virtual_workspace.rooms.dtos.favoriteroom.FavoriteRoomResponseDto;
import app.virtual_workspace.rooms.mappers.FavoriteRoomMapper;
import app.virtual_workspace.rooms.mappers.RoomMapper;
import app.virtual_workspace.rooms.models.FavoriteRoom;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.repositories.FavoriteRoomRepository;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteRoomService {

    private final FavoriteRoomRepository favoriteRoomRepository;
    private final RoomRepository roomRepository;
    private final FavoriteRoomMapper favoriteRoomMapper;
    private final UserAuthService userAuthService;

    public Slice<FavoriteRoomResponseDto> getFavoriteRooms(Pageable pageable){
        User user = userAuthService.getAuthenticatedUser();

        Slice<FavoriteRoom> favoriteRooms = favoriteRoomRepository.findFavoriteRoomsByUserId(user.getId(), pageable);

        return favoriteRooms.map(favoriteRoomMapper::modelToFavoriteRoomResponseDto);
    }

    public void addRoomToFavorite(Long roomId){
        User user = userAuthService.getAuthenticatedUser();

        boolean favoriteRoomExist = favoriteRoomRepository.existsByUserIdAndRoomId(user.getId(), roomId);

        if (favoriteRoomExist) return;

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFound("No room found with id: " + roomId));

        FavoriteRoom favoriteRoom = new FavoriteRoom();
        favoriteRoom.setRoom(room);
        favoriteRoom.setUser(user);

        favoriteRoomRepository.save(favoriteRoom);
    }

    public void removeRoomFromFavorite(Long roomId){
        User user = userAuthService.getAuthenticatedUser();
        FavoriteRoom favoriteRoom = favoriteRoomRepository.findFavoriteRoomByUserIdAndRoomId(user.getId(), roomId)
                .orElseThrow(() -> new ResourceNotFound("This room is not in your favorite list"));

        favoriteRoomRepository.delete(favoriteRoom);
    }

}
