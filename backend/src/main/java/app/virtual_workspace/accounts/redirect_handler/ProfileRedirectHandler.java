package app.virtual_workspace.accounts.redirect_handler;

import app.virtual_workspace.accounts.services.interfaces.AuthService;
import app.virtual_workspace.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

//@Component
//@RequiredArgsConstructor
//public class ProfileRedirectHandler implements HandlerInterceptor {
//
//    private final AuthService authService;
//    private final JwtService jwtService;
//
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//        String authHeader = request.getHeader("Authorization");
//
//        if (authHeader == null || !authHeader.startsWith("Bearer")) {
//            return false;
//        }
//
//        String token = authHeader.substring(7);
//        String userName = jwtService.extractUsername(token);
//
//        Long userId = authService.getCurrentUserId(userName);
//    }
//}
