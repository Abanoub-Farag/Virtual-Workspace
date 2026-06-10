package app.virtual_workspace.accounts.redirect_handler;

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
