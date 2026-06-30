package app.virtual_workspace.rooms.models;

import app.virtual_workspace.accounts.models.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(
        name = "room_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "room_id"})
        },
        indexes = {
                @Index(name = "idx_room_members_room_id", columnList = "room_id")
        }
)
public class RoomMembers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Builder.Default
    @Column(nullable = false)
    private String status = "OFFLINE";

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "last_active_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime lastActiveAt;

}
