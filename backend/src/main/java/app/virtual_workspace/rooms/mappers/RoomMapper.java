package app.virtual_workspace.rooms.mappers;

import app.virtual_workspace.rooms.dtos.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.RoomDataResponseDto;
import app.virtual_workspace.rooms.models.Room;
import org.mapstruct.Mapper;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    AllRoomResponseDto toAllRoomResponseDto(Room room);
    Room createRoomRequestDtoToModel(CreateRoomRequestDto createRoomRequestDto);
    CreateRoomResponseDto createRoomRequestToResponse(Room room);
    RoomDataResponseDto roomModelToDto(Room room);
}
