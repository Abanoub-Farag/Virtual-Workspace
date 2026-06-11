package app.virtual_workspace.rooms.controllers;

import app.virtual_workspace.rooms.dtos.favoriteroom.FavoriteRoomResponseDto;
import app.virtual_workspace.rooms.services.FavoriteRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms/favorites")
public class FavoriteRoomController {

    private final FavoriteRoomService favoriteRoomService;

    @GetMapping("")
    public ResponseEntity<List<FavoriteRoomResponseDto>> getFavoriteRooms(){
        return ResponseEntity.ok(favoriteRoomService.getFavoriteRooms());
    }

    @PostMapping("/{roomId}")
    public ResponseEntity<Void> addRoomToFavorite(@PathVariable Long roomId){
        favoriteRoomService.addRoomToFavorite(roomId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> removeRoomFromFavorite(@PathVariable Long roomId){
        favoriteRoomService.removeRoomFromFavorite(roomId);
        return ResponseEntity.noContent().build();
    }

}
