package app.virtual_workspace.rooms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import app.virtual_workspace.rooms.services.RoomMembersService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/rooms")
public class RoomMembersController {
    
    private static RoomMembersService roomMembersService;

    @GetMapping("/{roomId}")
    public ResponseEntity<Void> joinRoom(@PathVariable Long roomId){
        roomMembersService.joinRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{roomId}/HeartBeat")
    public ResponseEntity<Void> heartBeat(@PathVariable Long roomId){
        roomMembersService.heartBeat(roomId);
        return ResponseEntity.noContent().build();
    }

}
