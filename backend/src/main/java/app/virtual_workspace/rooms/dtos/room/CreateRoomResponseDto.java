package app.virtual_workspace.rooms.dtos.room;

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

}
