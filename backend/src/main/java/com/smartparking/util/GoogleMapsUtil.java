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
        String currentUrl = shortUrl;
        try {
            for (int i = 0; i < 5; i++) { // Max 5 redirects
                logger.info("Accessing URL to expand: {}", currentUrl);
                URL url = new URL(currentUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();

                // Disable automatic redirects to inspect headers manually
                connection.setInstanceFollowRedirects(false);
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                // Use a generic wget/curl user agent to encourage raw redirects instead of JS
                // pages
                connection.setRequestProperty("User-Agent", "curl/7.64.1");

                connection.connect();

                int responseCode = connection.getResponseCode();
                logger.info("Response Code: {}", responseCode);

                if (responseCode >= 300 && responseCode < 400) {
                    String newUrl = connection.getHeaderField("Location");
                    if (newUrl == null) {
                        logger.warn("Redirect response missing Location header");
                        break;
                    }
                    logger.info("Redirected to: {}", newUrl);
                    currentUrl = newUrl;
                } else {
                    // Reached final destination (200 OK or error)
                    break;
                }
            }
            return currentUrl;
        } catch (IOException e) {
            logger.error("Failed to expand URL: {}", shortUrl, e);
            return shortUrl;
        }
    }

    private static double[] extractCoordinates(String url) {
        logger.info("Extracting coordinates from: {}", url);

        // Pattern 0: !3d and !4d (Pin coordinates in data param) - Highest Priority
        // Example: data=!3m1!4b1!4m6!3m5!1s0x...!8m2!3d13.0552404!4d80.2785923
        Pattern p0 = Pattern.compile("!3d(-?\\d+\\.\\d+)!4d(-?\\d+\\.\\d+)");
        Matcher m0 = p0.matcher(url);
        if (m0.find()) {
            try {
                logger.info("Found pin coordinates in data param");
                return new double[] { Double.parseDouble(m0.group(1)), Double.parseDouble(m0.group(2)) };
            } catch (NumberFormatException e) {
                logger.error("Error parsing coordinates from pattern 0", e);
            }
        }

        // Pattern 1: @lat,lng (most common in desktop/expanded links)
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
