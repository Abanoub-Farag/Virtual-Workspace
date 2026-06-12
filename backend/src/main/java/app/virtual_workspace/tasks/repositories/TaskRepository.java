package app.virtual_workspace.tasks.repositories;

import app.virtual_workspace.tasks.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findTasksByUserId(Long userId);

    Task findTasksById(Long id);
}
