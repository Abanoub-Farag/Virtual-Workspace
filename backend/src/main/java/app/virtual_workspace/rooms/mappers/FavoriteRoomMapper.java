package app.virtual_workspace.rooms.mappers;

import app.virtual_workspace.rooms.dtos.favoriteroom.FavoriteRoomResponseDto;
import app.virtual_workspace.rooms.models.FavoriteRoom;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FavoriteRoomMapper {

    @Mapping(target = "roomId", source = "room.id")
    @Mapping(target = "title", source = "room.title")
    @Mapping(target = "description", source = "room.description")
    FavoriteRoomResponseDto modelToFavoriteRoomResponseDto(FavoriteRoom favoriteRoom);

    List<FavoriteRoomResponseDto> modelToFavoriteRoomResponseDto(List<FavoriteRoom> favoriteRooms);
}