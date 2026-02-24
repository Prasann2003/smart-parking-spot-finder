package com.smartparking.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ParkingTypeConverter implements AttributeConverter<ParkingType, String> {

    @Override
    public String convertToDatabaseColumn(ParkingType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public ParkingType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }

        try {
            // Check direct mapping (case insensitive)
            for (ParkingType type : ParkingType.values()) {
                if (type.name().equalsIgnoreCase(dbData)) {
                    return type;
                }
            }

            // Fallback for legacy DB values that are physical types
            if (dbData.equalsIgnoreCase("Covered") ||
                    dbData.equalsIgnoreCase("Open") ||
                    dbData.equalsIgnoreCase("Basement")) {
                return ParkingType.Public;
            }

            // Ultimate fallback
            return ParkingType.Public;
        } catch (Exception e) {
            return ParkingType.Public;
        }
    }
}
