package app.virtual_workspace.rooms.services.impl;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.repositories.UserRepository;
import app.virtual_workspace.rooms.dtos.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.RoomDataResponseDto;
import app.virtual_workspace.rooms.mappers.RoomMapper;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import app.virtual_workspace.rooms.services.interfaces.RoomService;
import app.virtual_workspace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomMapper roomMapper;
    private final JwtService jwtService;

    @Override
    public List<AllRoomResponseDto> getAllRooms(){
        return roomMapper.toAllRoomResponseDto(roomRepository.findAll());
    }

    @Override
    public CreateRoomResponseDto createRoom(
            CreateRoomRequestDto createRoomRequestDto,
            String token
    ){
        User user = jwtService.extractUserFromToken(token);

        Room room = roomMapper.createRoomRequestDtoToModel(createRoomRequestDto);

        room.setUser(user);
        user.setRoom(room);
        roomRepository.save(room);
        userRepository.save(user);

        return roomMapper.createRoomRequestToResponse(room);
    }

    @Override
    public RoomDataResponseDto getRoomData(Long id){
        Room room = roomRepository.findById(id).orElseThrow(() -> new RuntimeException("No room available with this id " + id));
        RoomDataResponseDto response = roomMapper.roomModelToDto(room);
        return response;
    }



}
