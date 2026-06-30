package app.virtual_workspace.tasks.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.exceptions.custom.ResourceNotFoundException;
import app.virtual_workspace.tasks.models.Task;
import app.virtual_workspace.tasks.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskAuthService {

    private final UserAuthService userAuthService;
    private final TaskRepository taskRepository;

    public boolean isOwner(Long taskId){
        User user = userAuthService.getAuthenticatedUser();

        Task task = taskRepository.findTasksById(taskId);

        if (task == null) throw new ResourceNotFoundException("No task found with id: " + taskId);

        return task.getUser().getId().equals(user.getId());
    }

}
