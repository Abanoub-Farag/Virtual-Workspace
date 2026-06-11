package app.virtual_workspace.rooms.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.rooms.dtos.favoriteroom.FavoriteRoomResponseDto;
import app.virtual_workspace.rooms.mappers.FavoriteRoomMapper;
import app.virtual_workspace.rooms.models.FavoriteRoom;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.repositories.FavoriteRoomRepository;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteRoomService {

    private final FavoriteRoomRepository favoriteRoomRepository;
    private final RoomRepository roomRepository;
    private final FavoriteRoomMapper favoriteRoomMapper;
    private final UserAuthService userAuthService;

    public List<FavoriteRoomResponseDto> getFavoriteRooms(){
        User user = userAuthService.getAuthenticatedUser();

        List<FavoriteRoom> favoriteRooms = favoriteRoomRepository.findFavoriteRoomsByUserId(user.getId());

        return favoriteRoomMapper.modelToFavoriteRoomResponseDto(favoriteRooms);
    }

    public void addRoomToFavorite(Long roomId){
        User user = userAuthService.getAuthenticatedUser();

        FavoriteRoom existingFavoriteRoom = favoriteRoomRepository.findFavoriteRoomsByUserIdAndRoomId(user.getId(), roomId);
        if (existingFavoriteRoom != null) {
            return;
        }

        Room room = roomRepository.getRoomById(roomId);

        FavoriteRoom favoriteRoom = new FavoriteRoom();
        favoriteRoom.setRoom(room);
        favoriteRoom.setUser(user);
        favoriteRoomRepository.save(favoriteRoom);
    }

    public void removeRoomFromFavorite(Long roomId){
        User user = userAuthService.getAuthenticatedUser();
        FavoriteRoom favoriteRoom = favoriteRoomRepository.findFavoriteRoomsByUserIdAndRoomId(user.getId(), roomId);

        if (favoriteRoom != null){
            favoriteRoomRepository.delete(favoriteRoom);
        }

    }

}
