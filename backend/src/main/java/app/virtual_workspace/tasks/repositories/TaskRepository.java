package app.virtual_workspace.tasks.repositories;

import app.virtual_workspace.tasks.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT id, title, isCompleted FROM Task WHERE Task.user.id = :userId")
    List<Task> findTasksByUserId(@Param("userId") Long userId);

    Task findTasksById(Long id);
}
