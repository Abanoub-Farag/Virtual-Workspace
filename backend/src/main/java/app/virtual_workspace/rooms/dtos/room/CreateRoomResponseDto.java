package app.virtual_workspace.rooms.dtos.room;

import app.virtual_workspace.rooms.models.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class CreateRoomResponseDto {

    private Long id;

    private String title;

    private String description;

    private Long ownerId;

    private Visibility vuVisibility;

}
