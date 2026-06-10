package app.virtual_workspace.accounts.mappers;

import app.virtual_workspace.accounts.dtos.auth.RegisterDto;
import app.virtual_workspace.accounts.models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    User registerDtoToModel(RegisterDto request);
}