package app.virtual_workspace.rooms.services.interfaces;

import app.virtual_workspace.rooms.dtos.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.RoomDataResponseDto;

import java.util.List;

public interface RoomService {

    List<AllRoomResponseDto> getAllRooms();
    CreateRoomResponseDto createRoom(CreateRoomRequestDto createRoomRequestDto);
    RoomDataResponseDto getRoomData(Long id);

}
