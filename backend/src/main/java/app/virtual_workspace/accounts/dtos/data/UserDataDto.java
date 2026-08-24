package app.virtual_workspace.accounts.dtos.data;

import app.virtual_workspace.accounts.models.enums.Gender;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserDataDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String bio;
    private Gender gender;
    private LocalDate dateOfBirth;
    private List<Long> roomsId;

}
