package app.virtual_workspace.rooms.services;

import java.time.LocalDateTime;
import java.util.List;

import app.virtual_workspace.accounts.dtos.data.UserDataDto;
import app.virtual_workspace.accounts.models.Profile;
import app.virtual_workspace.rooms.dtos.RoomMembers.RoomMemberDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.exceptions.custom.ResourceNotFoundException;
import app.virtual_workspace.rooms.models.Room;
import app.virtual_workspace.rooms.models.RoomMembers;
import app.virtual_workspace.rooms.models.enums.Status;
import app.virtual_workspace.rooms.repositories.RoomMembersRepository;
import app.virtual_workspace.rooms.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RoomMembersService {
    
    private final RoomMembersRepository roomMembersRepository;
    private final RoomRepository roomRepository;
    private final UserAuthService userAuthService;

    @Transactional
    @CacheEvict(value = "room_members", key = "#roomId")
    public void joinRoom(Long roomId){

        User user = userAuthService.getAuthenticatedUser();
        
        if (roomMembersRepository.existsByUserIdAndRoomId(user.getId(), roomId)){
            return;
        }

        Room room = roomRepository.findById(roomId)
                                    .orElseThrow(() -> new ResourceNotFoundException("Room Not Found"));

        RoomMembers roomMembers = RoomMembers.builder()
                                            .user(user)
                                            .room(room)
                                            .status(Status.ONLINE)
                                            .build();

        roomMembersRepository.save(roomMembers);

    }

    public void heartBeat(Long roomId){

        User user = userAuthService.getAuthenticatedUser();
        roomMembersRepository.updateLastActiveAt(user.getId(), roomId, LocalDateTime.now());

    }

    @Cacheable(value = "room_members", key = "#roomId")
    public RoomMemberDto[] getRoomMembers(Long roomId) {
        List<RoomMembers> roomMembers = roomMembersRepository.findRoomMembersByRoomId(roomId);

        return roomMembers.stream()
                .map(member -> {
                    User user = member.getUser();
                    Profile profile = user.getProfile();
                    return RoomMemberDto.builder()
                            .id(user.getId())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .bio(profile.getBio())
                            .gender(profile.getGender())
                            .dateOfBirth(profile.getDateOfBirth())
                            .build();
                })
                .toArray(RoomMemberDto[]::new);
    }

}
