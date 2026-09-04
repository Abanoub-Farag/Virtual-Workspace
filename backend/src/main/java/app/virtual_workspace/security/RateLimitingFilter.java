package app.virtual_workspace.security;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import app.virtual_workspace.shared.dtos.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 5;

    Cache<String, Bucket> cache = Caffeine.newBuilder()
            .expireAfterAccess(1, TimeUnit.MINUTES)
            .maximumSize(50_000)
            .build();

    private final ObjectMapper objectMapper;

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(MAX_REQUESTS_PER_MINUTE)
                .refillGreedy(MAX_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse,
            FilterChain filterChain) throws IOException, ServletException {

        if (httpRequest.getRequestURI().startsWith("/api/v1/auth")) {
            String ip = httpRequest.getRemoteAddr();
            Bucket bucket = cache.get(ip, k -> createNewBucket());

            if (!bucket.tryConsume(1)) {

                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType("application/json");
                httpResponse.setCharacterEncoding("UTF-8");

                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .status(HttpStatus.TOO_MANY_REQUESTS.value())
                        .message("Too many requests please try again later")
                        .build();
                httpResponse.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                return;
            }
        }
        filterChain.doFilter(httpRequest, httpResponse);
    }

}
