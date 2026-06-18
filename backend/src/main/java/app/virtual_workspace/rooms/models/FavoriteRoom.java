package app.virtual_workspace.rooms.models;

import app.virtual_workspace.accounts.models.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(
        name = "favorite_rooms",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "room_id"}
        ),
        indexes = {
                @Index(name = "idx_fav_room_id", columnList = "room_id")
        }
)
public class FavoriteRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @CreationTimestamp
    @Column(name = "added_at")
    private LocalDateTime addedAt;

}
