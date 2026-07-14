package app.virtual_workspace.exceptions;

import app.virtual_workspace.exceptions.custom.ResourceNotFoundException;
import app.virtual_workspace.shared.dtos.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ){
        List<ErrorResponse.ValidationError> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> ErrorResponse.ValidationError.builder()
                        .field(error.getField())
                        .message(error.getDefaultMessage())
                        .build())
                .toList();

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(ex.getStatusCode().value())
                .message("Validation failed for one or more fields")
                .error("Validation Failed")
                .errors(errors)
                .path(request.getRequestURI())
                .build();

        return buildResponseEntity(HttpStatus.BAD_REQUEST, "Validation Failed for one or more fields", errorResponse);
    }

    // 2. Resource Not Found Exception (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return buildResponseEntity(HttpStatus.NOT_FOUND, ex.getMessage(), errorResponse);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request
    ){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An Unexpected Internal Server Error Occurred")
                .path(request.getRequestURI())
                .build();

        return buildResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error occurred", errorResponse);
    }

    @ExceptionHandler(InsufficientAuthenticationException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleInsufficientAuthenticationException(
            InsufficientAuthenticationException ex,
            HttpServletRequest request
    ){
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Full authentication is required to access this resource")
                .path(request.getRequestURI())
                .build();

        ApiResponse<ErrorResponse> response = ApiResponse.<ErrorResponse>builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Unauthorized access")
                .errors(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    private ResponseEntity<ApiResponse<ErrorResponse>> buildResponseEntity(
            HttpStatus status,
            String message,
            ErrorResponse errorResponse
    ) {
        ApiResponse<ErrorResponse> response = ApiResponse.<ErrorResponse>builder()
                .status(status.value())
                .message(message)
                .errors(errorResponse)
                .build();

        return ResponseEntity.status(status).body(response);
    }

}