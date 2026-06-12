package app.virtual_workspace.tasks.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.tasks.models.Task;
import app.virtual_workspace.tasks.repositories.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskAuthService {

    private final UserAuthService userAuthService;
    private final TaskRepository taskRepository;

    public boolean isOwner(Long taskId){
        User user = userAuthService.getAuthenticatedUser();

        Task task = taskRepository.findTasksById(taskId);

        if (user == null) throw new InsufficientAuthenticationException("User is not authenticated");
        if (task == null) throw new EntityNotFoundException("No task found with id: " + taskId);

        return task.getUser().equals(user);
    }

}
