package app.virtual_workspace.accounts.services;

import app.virtual_workspace.accounts.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Cacheable(value = "userCache", key = "#email")
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No user found with email: " + email));
    }

}
