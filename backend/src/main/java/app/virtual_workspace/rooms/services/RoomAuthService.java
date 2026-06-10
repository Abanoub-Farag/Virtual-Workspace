package app.virtual_workspace.rooms.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import app.virtual_workspace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomAuthService {

    private final JwtService jwtService;
    private final RoomRepository roomRepository;

    public boolean isOwner(Long roomId, Map<String, String> header) {
        String token = jwtService.extractTokenFromHeader(header);
        User user = jwtService.extractUserFromToken(token);
        Room room = roomRepository.getRoomById(roomId);

        return room.getUser().equals(user);
    }
}
