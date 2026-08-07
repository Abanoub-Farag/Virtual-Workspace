package app.virtual_workspace.accounts.dtos;

import app.virtual_workspace.accounts.models.User;
import app.virtual_workspace.accounts.models.enums.Role;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

@Getter
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserPrincipal implements UserDetails, Serializable {

    private final Long id;
    private final String email;
    private final String password;
    private final boolean active;
    private final Role role;

    @JsonCreator
    public UserPrincipal(
            @JsonProperty("id") Long id,
            @JsonProperty("email") String email,
            @JsonProperty("password") String password,
            @JsonProperty("active") boolean active,
            @JsonProperty("role") Role role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.active = active;
        this.role = role;
    }

    public static UserPrincipal create(User user) {
        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPassword())
                .active(user.isActive())
                .role(user.getRole())
                .build();
    }

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == null) return List.of();
        return List.of(new SimpleGrantedAuthority(this.role.name()));
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return this.email;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isEnabled() {
        return this.active;
    }
}