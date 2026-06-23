package app.virtual_workspace.tasks.repositories;

import app.virtual_workspace.tasks.models.Task;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId")
    Slice<Task> findTasksByUserId(@Param("userId") Long userId, Pageable pageable);

    Task findTasksById(Long id);
}
