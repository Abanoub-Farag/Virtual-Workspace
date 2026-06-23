package app.virtual_workspace.tasks.mappers;

import app.virtual_workspace.tasks.dtos.CreateTaskDto;
import app.virtual_workspace.tasks.dtos.TaskResponseDto;
import app.virtual_workspace.tasks.models.Task;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    TaskResponseDto toAllTasksResponseDto(Task tasks);

    Task toModel(CreateTaskDto taskRequest);
}
