package app.virtual_workspace.rooms.dtos.favoriteroom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FavoriteRoomResponseDto {
    private Long roomId;
    private String title;
    private String description;
    private LocalDateTime addedAt;
}
