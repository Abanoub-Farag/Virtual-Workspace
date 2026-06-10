package app.virtual_workspace.rooms.services.impl;

import app.virtual_workspace.rooms.dtos.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.RoomDataResponseDto;
import app.virtual_workspace.rooms.mappers.RoomMapper;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import app.virtual_workspace.rooms.services.interfaces.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    @Override
    public List<AllRoomResponseDto> getAllRooms(){
        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toAllRoomResponseDto)
                .toList();
    }

    @Override
    public CreateRoomResponseDto createRoom(CreateRoomRequestDto createRoomRequestDto){
        Room room = roomMapper.createRoomRequestDtoToModel(createRoomRequestDto);
        roomRepository.save(room);
        return roomMapper.createRoomRequestToResponse(room);
    }

    @Override
    public RoomDataResponseDto getRoomData(Long id){
        Room room = roomRepository.findById(id).orElseThrow(() -> new RuntimeException("No room available with this id " + id));
        RoomDataResponseDto response = roomMapper.roomModelToDto(room);
        return response;
    }



}
