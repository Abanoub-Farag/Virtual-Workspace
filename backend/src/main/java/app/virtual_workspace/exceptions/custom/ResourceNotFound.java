package app.virtual_workspace.exceptions.custom;

public class ResourceNotFound extends RuntimeException{

    public ResourceNotFound(String message){
        super(message);
    }

}
