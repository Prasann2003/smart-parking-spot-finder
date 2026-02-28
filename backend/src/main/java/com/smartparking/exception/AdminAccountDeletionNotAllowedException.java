package com.smartparking.exception;

public class AdminAccountDeletionNotAllowedException extends RuntimeException {
    private String message;
    public AdminAccountDeletionNotAllowedException(String message) {
        super(message);
    }
    @Override
    public String getMessage() {
        return message;
    }
}
