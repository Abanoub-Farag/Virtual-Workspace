package app.virtual_workspace.accounts.services.interfaces;

import app.virtual_workspace.accounts.dtos.auth.AuthResponseDto;
import app.virtual_workspace.accounts.dtos.auth.LoginDto;
import app.virtual_workspace.accounts.dtos.auth.RegisterDto;

public interface UserAuthService {
    AuthResponseDto register(RegisterDto request);
    AuthResponseDto login(LoginDto request);
//    Long getCurrentUserId(String userName);
    boolean isOwner(Long userId);
}
