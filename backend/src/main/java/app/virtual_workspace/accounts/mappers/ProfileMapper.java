package app.virtual_workspace.accounts.mappers;

import app.virtual_workspace.accounts.dtos.profile.UserProfileDto;
import app.virtual_workspace.accounts.models.Profile;
import app.virtual_workspace.accounts.models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    UserProfileDto toUserProfileDto(User user, Profile profile);
}
