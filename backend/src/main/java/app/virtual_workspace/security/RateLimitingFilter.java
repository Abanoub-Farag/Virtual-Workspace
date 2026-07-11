package app.virtual_workspace.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import app.virtual_workspace.shared.dtos.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final HandlerExceptionResolver resolver;

    public RateLimitingFilter(@Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.resolver = resolver;
    }

    private Bucket createNewBucket(){
        return Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(5).refillIntervally(5, Duration.ofMinutes(1)).build())
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpRequest, HttpServletResponse httpResponse, FilterChain filterChain) throws IOException, ServletException{

        if (httpRequest.getRequestURI().startsWith("/api/v1/auth")){
            String ip = httpRequest.getRemoteAddr();
            Bucket bucket = cache.computeIfAbsent(ip, k -> createNewBucket());

            if (!bucket.tryConsume(1)){

                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType("application/json");

                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .status(HttpStatus.TOO_MANY_REQUESTS.value())
                        .message("Too many requests please try again later")
                        .build();

                String json = new ObjectMapper().writeValueAsString(apiResponse);
                httpResponse.getWriter().write(json);

                return;
            }
        }
        filterChain.doFilter(httpRequest, httpResponse);
    }

}
