package app.virtual_workspace.tasks.controllers;

import app.virtual_workspace.tasks.dtos.CreateTaskDto;
import app.virtual_workspace.tasks.dtos.TaskResponseDto;
import app.virtual_workspace.tasks.dtos.UpdateTaskDto;
import app.virtual_workspace.tasks.services.TaskService;
import app.virtual_workspace.shared.dtos.ApiResponse;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Slice<TaskResponseDto>>> getAllTasks(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ){
        Slice<TaskResponseDto> tasks = taskService.getAllTasks(pageable);
        
        ApiResponse<Slice<TaskResponseDto>> response = ApiResponse.<Slice<TaskResponseDto>>builder()
                .status(HttpStatus.OK.value())
                .message("Tasks retrieved successfully")
                .data(tasks)
                .build();
                
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<Void>> createTask(
            @Valid @RequestBody CreateTaskDto taskRequest
    ){
        taskService.createTask(taskRequest);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(HttpStatus.CREATED.value())
                .message("Task created successfully")
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("@taskAuthService.isOwner(#taskId)")
    public ResponseEntity<ApiResponse<Void>> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskDto updateTaskDto
    ){
        taskService.updateTask(taskId, updateTaskDto);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Task updated successfully")
                .build();
                
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("@taskAuthService.isOwner(#taskId)")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long taskId
    ){
        taskService.deleteTask(taskId);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Task deleted successfully")
                .build();
                
        return ResponseEntity.ok(response);
    }
}