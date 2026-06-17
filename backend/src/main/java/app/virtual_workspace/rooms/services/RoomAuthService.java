package app.virtual_workspace.rooms.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class RoomAuthService {

    private final UserAuthService userAuthService;
    private final RoomRepository roomRepository;

    public boolean isOwner(Long roomId) {
        User user = userAuthService.getAuthenticatedUser();
        Room room = roomRepository.getRoomById(roomId);

        return room.getUser().getId().equals(user.getId());
    }
}
