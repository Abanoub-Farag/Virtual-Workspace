package app.virtual_workspace.rooms.mappers;

import app.virtual_workspace.rooms.dtos.room.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.room.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.RoomDataResponseDto;
import app.virtual_workspace.rooms.models.Room;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    @Mapping(source = "user.id", target = "ownerId")
    AllRoomResponseDto toAllRoomResponseDto(Room room);

    Room createRoomRequestDtoToModel(CreateRoomRequestDto createRoomRequestDto);

    @Mapping(source = "user.id", target = "ownerId")
    CreateRoomResponseDto createRoomRequestToResponse(Room room);

    @Mapping(source = "user.id", target = "ownerId")
    RoomDataResponseDto roomModelToDto(Room room);

}
