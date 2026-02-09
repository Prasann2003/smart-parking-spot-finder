package com.smartparking.util;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GoogleMapsUtil {

    private static final Logger logger = LoggerFactory.getLogger(GoogleMapsUtil.class);

    public static double[] getCoordinates(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        String fullUrl = url;
        // Naive check for shortened URLs or those needing expansion
        if (url.contains("goo.gl") || url.contains("maps.app.goo.gl") || url.contains("bit.ly")) {
            fullUrl = expandUrl(url);
        }

        return extractCoordinates(fullUrl);
    }

    private static String expandUrl(String shortUrl) {
        try {
            logger.info("Expanding URL: {}", shortUrl);
            URL url = new URL(shortUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setRequestMethod("HEAD");
            // Add User-Agent to behave like a browser, sometimes helps with Google
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            int responseCode = connection.getResponseCode();
            logger.info("Response Code: {}", responseCode);

            if (responseCode >= 300 && responseCode < 400) {
                String location = connection.getHeaderField("Location");
                if (location != null) {
                    logger.info("Redirected to: {}", location);
                    // If it's still a shortened URL (double redirect), recurse.
                    // Otherwise, we might have the full Google Maps link.
                    if (location.contains("goo.gl") || location.contains("maps.app.goo.gl")) {
                        return expandUrl(location);
                    }
                    return location;
                }
            }
            return shortUrl;
        } catch (IOException e) {
            logger.error("Failed to expand URL: {}", shortUrl, e);
            return shortUrl;
        }
    }

    private static double[] extractCoordinates(String url) {
        logger.info("Extracting coordinates from: {}", url);

        // Pattern 1: @lat,lng (most common in desktop/expanded links)
        // Example: .../place/PlaceName/@12.345,67.890,17z/...
        Pattern p1 = Pattern.compile("@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
        Matcher m1 = p1.matcher(url);
        if (m1.find()) {
            try {
                return new double[] { Double.parseDouble(m1.group(1)), Double.parseDouble(m1.group(2)) };
            } catch (NumberFormatException e) {
                logger.error("Error parsing coordinates from pattern 1", e);
            }
        }

        // Pattern 2: ?q=lat,lng or &q=lat,lng or ?ll=lat,lng
        // Example: maps.google.com/?q=12.345,67.890
        Pattern p2 = Pattern.compile("[?&](?:q|ll)=(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
        Matcher m2 = p2.matcher(url);
        if (m2.find()) {
            try {
                return new double[] { Double.parseDouble(m2.group(1)), Double.parseDouble(m2.group(2)) };
            } catch (NumberFormatException e) {
                logger.error("Error parsing coordinates from pattern 2", e);
            }
        }

        // Pattern 3: /place/lat,lng or /search/lat,lng (less common but possible)
        Pattern p3 = Pattern.compile("/(?:place|search)/(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
        Matcher m3 = p3.matcher(url);
        if (m3.find()) {
            try {
                return new double[] { Double.parseDouble(m3.group(1)), Double.parseDouble(m3.group(2)) };
            } catch (NumberFormatException e) {
                logger.error("Error parsing coordinates from pattern 3", e);
            }
        }

        logger.warn("Could not extract coordinates from URL: {}", url);
        return null;
    }
}
