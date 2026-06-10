package app.virtual_workspace.accounts.dtos.profile;

import app.virtual_workspace.accounts.models.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UpdateUserProfileDto {
    private String bio;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String firstName;
    private String lastName;
}
