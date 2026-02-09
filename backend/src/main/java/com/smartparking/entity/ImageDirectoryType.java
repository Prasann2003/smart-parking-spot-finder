package com.smartparking.entity;

public enum ImageDirectoryType {
    USER("user"),
    PROVIDER("provider"),
    APPLICATION("provider_application"),
    PARKING_SPOT("parking_spot");

    private final String folderName;

    ImageDirectoryType(String folderName) {
        this.folderName = folderName;
    }

    public String getFolderName() {
        return folderName;
    }
}
