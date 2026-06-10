package app.virtual_workspace.accounts.events.listeners;

import app.virtual_workspace.accounts.events.UserRegisteredEvent;
import app.virtual_workspace.accounts.services.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProfileSetupListener {

    private final ProfileService profileService;

    @EventListener
    void onUserRegistered(UserRegisteredEvent event){
        profileService.createProfile(event.userId());
    }

}
