package app.virtual_workspace.rooms.mappers;

import app.virtual_workspace.rooms.dtos.room.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.room.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.RoomDataResponseDto;
import app.virtual_workspace.rooms.models.Room;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    AllRoomResponseDto toAllRoomResponseDto(Room room);

    Room createRoomRequestDtoToModel(CreateRoomRequestDto createRoomRequestDto);

    CreateRoomResponseDto createRoomRequestToResponse(Room room);

    RoomDataResponseDto roomModelToDto(Room room);

}
