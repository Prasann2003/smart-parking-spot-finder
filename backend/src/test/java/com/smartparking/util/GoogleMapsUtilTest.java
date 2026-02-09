package com.smartparking.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class GoogleMapsUtilTest {

    @Test
    void testStandardUrl() {
        String url = "https://www.google.com/maps/place/Some+Place/@12.3456,78.9101,15z/data=...";
        double[] coords = GoogleMapsUtil.getCoordinates(url);
        assertNotNull(coords);
        assertEquals(12.3456, coords[0]);
        assertEquals(78.9101, coords[1]);
    }

    @Test
    void testQueryParamUrl() {
        String url = "https://maps.google.com/?q=12.3456,78.9101";
        double[] coords = GoogleMapsUtil.getCoordinates(url);
        assertNotNull(coords);
        assertEquals(12.3456, coords[0]);
        assertEquals(78.9101, coords[1]);
    }

    @Test
    void testSecondaryQueryParamUrl() {
        String url = "https://maps.google.com/?ll=12.3456,78.9101&z=15";
        double[] coords = GoogleMapsUtil.getCoordinates(url);
        assertNotNull(coords);
        assertEquals(12.3456, coords[0]);
        assertEquals(78.9101, coords[1]);
    }

    @Test
    void testNegativeCoordinates() {
        String url = "https://www.google.com/maps/@-33.8688,-151.2093,15z";
        double[] coords = GoogleMapsUtil.getCoordinates(url);
        assertNotNull(coords);
        assertEquals(-33.8688, coords[0]);
        assertEquals(-151.2093, coords[1]);
    }

    @Test
    void testInvalidUrl() {
        String url = "https://www.google.com/maps/place/Invalid";
        double[] coords = GoogleMapsUtil.getCoordinates(url);
        assertNull(coords);
    }

    // Note: Shortened URL tests usually require network access to resolve
    // redirects.
    // For unit tests, we might skip them or mock the network call if we refactored
    // the util.
    // For this simple verify, we will skip the network dependency test to avoid
    // flakiness
    // unless the environment allows it.
}
