package app.virtual_workspace.rooms.services.interfaces;

import app.virtual_workspace.rooms.dtos.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.RoomDataResponseDto;

import java.util.List;
import java.util.Map;

public interface RoomService {

    List<AllRoomResponseDto> getAllRooms();
    CreateRoomResponseDto createRoom(CreateRoomRequestDto createRoomRequestDto, String token);
    RoomDataResponseDto getRoomData(Long id);

}
