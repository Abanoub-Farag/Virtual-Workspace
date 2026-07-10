package app.virtual_workspace.rooms.controllers;

import app.virtual_workspace.rooms.dtos.room.CreateRoomRequestDto;
import app.virtual_workspace.rooms.dtos.room.AllRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.CreateRoomResponseDto;
import app.virtual_workspace.rooms.dtos.room.RoomDataResponseDto;
import app.virtual_workspace.rooms.dtos.room.UpdateRoomRequestDto;
import app.virtual_workspace.rooms.services.RoomService;
import app.virtual_workspace.shared.dtos.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomService roomService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Slice<AllRoomResponseDto>>> getAllRooms(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ){
        Slice<AllRoomResponseDto> rooms = roomService.getAllRooms(pageable);
        
        ApiResponse<Slice<AllRoomResponseDto>> response = ApiResponse.<Slice<AllRoomResponseDto>>builder()
                .status(HttpStatus.OK.value())
                .message("Rooms retrieved successfully")
                .data(rooms)
                .build();
                
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<CreateRoomResponseDto>> createRoom(
            @Valid @RequestBody CreateRoomRequestDto createRoomRequestDto
    ){
        CreateRoomResponseDto createdRoom = roomService.createRoom(createRoomRequestDto);

        ApiResponse<CreateRoomResponseDto> response = ApiResponse.<CreateRoomResponseDto>builder()
                .status(HttpStatus.CREATED.value())
                .message("Room created successfully")
                .data(createdRoom)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDataResponseDto>> room(@PathVariable Long id){
        RoomDataResponseDto roomData = roomService.getRoomData(id);
        
        ApiResponse<RoomDataResponseDto> response = ApiResponse.<RoomDataResponseDto>builder()
                .status(HttpStatus.OK.value())
                .message("Room data retrieved successfully")
                .data(roomData)
                .build();
                
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{roomId}")
    @PreAuthorize("@roomAuthService.isOwner(#roomId)")
    public ResponseEntity<ApiResponse<RoomDataResponseDto>> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateRoomRequestDto updateRoomRequestDto
    ){
        RoomDataResponseDto updatedRoom = roomService.updateRoom(roomId, updateRoomRequestDto);
        
        ApiResponse<RoomDataResponseDto> response = ApiResponse.<RoomDataResponseDto>builder()
                .status(HttpStatus.OK.value())
                .message("Room updated successfully")
                .data(updatedRoom)
                .build();
                
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{roomId}")
    @PreAuthorize("@roomAuthService.isOwner(#roomId)")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable Long roomId
    ){
        roomService.deleteRoom(roomId);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Room deleted successfully")
                .build();
                
        return ResponseEntity.ok(response);
    }
}