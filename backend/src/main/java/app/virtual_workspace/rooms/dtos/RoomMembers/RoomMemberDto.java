package app.virtual_workspace.rooms.dtos.RoomMembers;

import app.virtual_workspace.accounts.models.enums.Gender;
import app.virtual_workspace.rooms.models.enums.Status;
import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RoomMemberDto {

    private Long id;
    private Status status;
    private String firstName;
    private String lastName;
    private String bio;
    private Gender gender;
    private LocalDate dateOfBirth;

}
