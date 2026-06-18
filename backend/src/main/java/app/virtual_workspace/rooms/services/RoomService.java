package app.virtual_workspace.rooms.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.accounts.services.UserService;
import app.virtual_workspace.exceptions.custom.ResourceNotFound;
import app.virtual_workspace.rooms.dtos.room.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.room.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.RoomDataResponseDto;
import app.virtual_workspace.rooms.dtos.room.UpdateRoomRequestDto;
import app.virtual_workspace.rooms.mappers.RoomMapper;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserService userService;
    private final UserAuthService userAuthService;
    private final RoomMapper roomMapper;

    public List<AllRoomResponseDto> getAllRooms(){
        return roomMapper.toAllRoomResponseDto(roomRepository.findAll());
    }

    @Transactional
    public CreateRoomResponseDto createRoom(
            CreateRoomRequestDto createRoomRequestDto
    ){
        User user = userAuthService.getAuthenticatedUser();

        Room room = roomMapper.createRoomRequestDtoToModel(createRoomRequestDto);

        room.setUser(user);
        user.setRoom(room);
        roomRepository.save(room);
        userService.saveUser(user);

        return roomMapper.createRoomRequestToResponse(room);
    }

    public RoomDataResponseDto getRoomData(Long id){
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Room not found with id: " + id));
        return roomMapper.roomModelToDto(room);
    }

    public RoomDataResponseDto updateRoom(
            Long roomId,
            UpdateRoomRequestDto updateRoomRequestDto
    ) {
        Room room = roomRepository.getRoomById(roomId);

        room.setTitle(updateRoomRequestDto.getTitle());
        room.setDescription(updateRoomRequestDto.getDescription());

        roomRepository.save(room);
        return roomMapper.roomModelToDto(room);
    }

}
