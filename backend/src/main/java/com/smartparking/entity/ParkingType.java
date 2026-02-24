package com.smartparking.entity;

public enum ParkingType {
    Public,
    Private,
    Commercial;

    // Optional: Add a case-insensitive creator method if needed for JSON
    // parsing/form data binding
    public static ParkingType fromString(String text) {
        for (ParkingType b : ParkingType.values()) {
            if (b.name().equalsIgnoreCase(text)) {
                return b;
            }
        }
        throw new IllegalArgumentException("No constant with text " + text + " found");
    }
}
