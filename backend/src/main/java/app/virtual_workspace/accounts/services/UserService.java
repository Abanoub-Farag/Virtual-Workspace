package app.virtual_workspace.accounts.services;

import app.virtual_workspace.accounts.dtos.data.UserDataDto;
import app.virtual_workspace.accounts.models.Profile;
import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.repositories.UserRepository;
import app.virtual_workspace.exceptions.custom.ResourceNotFoundException;
import app.virtual_workspace.rooms.models.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + userId + " not found"));
    }

    public User saveUser(User user){
        return userRepository.save(user);
    }

    public UserDataDto userData(Long userId){
        User user = findUserById(userId);

        Long roomId = Optional.ofNullable(user.getRoom())
                .map(Room::getId)
                .orElse(null);

        Profile profile = user.getProfile();

        return UserDataDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .bio(profile.getBio())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth())
                .roomsId(roomId)
                .build();
    }

}
