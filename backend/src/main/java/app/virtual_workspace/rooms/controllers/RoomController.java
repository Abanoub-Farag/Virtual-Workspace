package app.virtual_workspace.rooms.controllers;


import app.virtual_workspace.rooms.dtos.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.RoomDataResponseDto;
import app.virtual_workspace.rooms.services.interfaces.RoomService;
import app.virtual_workspace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomService roomService;
    private final JwtService jwtService;

    @GetMapping("")
    public ResponseEntity<List<AllRoomResponseDto>> getAllRooms(){
        List<AllRoomResponseDto> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("")
    public ResponseEntity<CreateRoomResponseDto> createRoom(
            @RequestBody CreateRoomRequestDto createRoomRequestDto,
            @RequestHeader Map<String, String> header
            ){

        String token = jwtService.extractTokenFromHeader(header);
        CreateRoomResponseDto response = roomService.createRoom(createRoomRequestDto, token);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDataResponseDto> room(@PathVariable Long id){
         return ResponseEntity.ok(roomService.getRoomData(id));
    }
}
