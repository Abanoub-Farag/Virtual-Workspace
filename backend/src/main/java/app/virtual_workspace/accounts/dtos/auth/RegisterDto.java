package app.virtual_workspace.accounts.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RegisterDto {
    private String email;
    private String firstName;
    private String lastName;
    private String password;
}
