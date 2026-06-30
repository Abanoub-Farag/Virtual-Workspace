package app.virtual_workspace.tasks.services;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.services.UserAuthService;
import app.virtual_workspace.exceptions.custom.ResourceNotFoundException;
import app.virtual_workspace.tasks.dtos.CreateTaskDto;
import app.virtual_workspace.tasks.dtos.TaskResponseDto;
import app.virtual_workspace.tasks.dtos.UpdateTaskDto;
import app.virtual_workspace.tasks.mappers.TaskMapper;
import app.virtual_workspace.tasks.models.Task;
import app.virtual_workspace.tasks.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final UserAuthService userAuthService;

    public Slice<TaskResponseDto> getAllTasks(Pageable pageable){
        User user = userAuthService.getAuthenticatedUser();

        Slice<Task> tasks = taskRepository.findTasksByUserId(user.getId(), pageable);

        return tasks.map(taskMapper::toAllTasksResponseDto);
    }

    @Transactional
    public void createTask(CreateTaskDto taskRequest){
        User user = userAuthService.getAuthenticatedUser();

        Task task = taskMapper.toModel(taskRequest);
        task.setUser(user);
        taskRepository.save(task);
    }

    @Transactional
    public void updateTask(Long taskId, UpdateTaskDto taskRequest){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task Not Found"));

        task.setTitle(taskRequest.getTitle());
        task.setCompleted(taskRequest.isCompleted());

        taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long taskId){

        if (taskRepository.existsById(taskId)){
            taskRepository.deleteById(taskId);
        }

    }

}
