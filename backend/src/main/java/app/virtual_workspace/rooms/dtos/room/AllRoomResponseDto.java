package app.virtual_workspace.rooms.dtos.room;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class AllRoomResponseDto {
    private Long id;

    private String title;

    private String description;

    private Long ownerId;
}
