package app.virtual_workspace.rooms.controllers;


import app.virtual_workspace.rooms.dtos.room.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.room.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.RoomDataResponseDto;
import app.virtual_workspace.rooms.dtos.room.UpdateRoomRequestDto;
import app.virtual_workspace.rooms.services.RoomService;
import app.virtual_workspace.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomService roomService;

    @GetMapping("")
    public ResponseEntity<List<AllRoomResponseDto>> getAllRooms(){
        List<AllRoomResponseDto> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("")
    public ResponseEntity<CreateRoomResponseDto> createRoom(
            @Valid @RequestBody CreateRoomRequestDto createRoomRequestDto
            ){

        CreateRoomResponseDto response = roomService.createRoom(createRoomRequestDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDataResponseDto> room(@PathVariable Long id){
         return ResponseEntity.ok(roomService.getRoomData(id));
    }

    @PutMapping("/{roomId}")
    @PreAuthorize("@roomAuthService.isOwner(#roomId)")
    public ResponseEntity<RoomDataResponseDto> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateRoomRequestDto updateRoomRequestDto
    ){
        RoomDataResponseDto roomDataResponseDto = roomService.updateRoom(roomId, updateRoomRequestDto);
        return ResponseEntity.ok(roomDataResponseDto);
    }

    @DeleteMapping("/{roomId}")
    @PreAuthorize("@roomAuthService.isOwner(#roomId)")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long roomId
    ){
        roomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

}
