package app.virtual_workspace.tasks.controllers;

import app.virtual_workspace.tasks.dtos.CreateTaskDto;
import app.virtual_workspace.tasks.dtos.TaskResponseDto;
import app.virtual_workspace.tasks.dtos.UpdateTaskDto;
import app.virtual_workspace.tasks.services.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("")
    public ResponseEntity<Slice<TaskResponseDto>> getAllTasks(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
            ){
        return ResponseEntity.ok(taskService.getAllTasks(pageable));
    }

    @PostMapping("")
    public ResponseEntity<Void> createTask(
            @Valid @RequestBody CreateTaskDto taskRequest
    ){
        taskService.createTask(taskRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("@taskAuthService.isOwner(#taskId)")
    public ResponseEntity<Void> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskDto updateTaskDto
    ){
        taskService.updateTask(taskId, updateTaskDto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("@taskAuthService.isOwner(#taskId)")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long taskId
    ){
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

}
