package app.virtual_workspace.rooms.dtos.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UpdateRoomRequestDto {

    @NotBlank(message = "This is a required field")
    @Size(min = 2, max = 50, message = "Title must be between 2 to 50 characters")
    private String title;

    private String description;

}
