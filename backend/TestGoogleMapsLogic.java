
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TestGoogleMapsLogic {

    public static void main(String[] args) {
        System.out.println("Running Google Maps Logic Tests...");

        test("https://www.google.com/maps/place/Some+Place/@12.3456,78.9101,15z/data=...", 12.3456, 78.9101);
        test("https://maps.google.com/?q=12.3456,78.9101", 12.3456, 78.9101);
        test("https://maps.google.com/?ll=12.3456,78.9101&z=15", 12.3456, 78.9101);
        test("https://www.google.com/maps/@-33.8688,-151.2093,15z", -33.8688, -151.2093);

        // Test 4: URL with data param (Pin moves away from viewport)
        // Viewport is @10.0,20.0 but Pin is at 13.055, 80.278
        String dataUrl = "https://www.google.com/maps/place/SomePlace/@10.0000000,20.0000000,17z/data=!3m1!4b1!4m6!3m5!1s0x...!8m2!3d13.0552404!4d80.2785923";
        double[] coords4 = extractCoordinates(dataUrl);
        if (coords4 != null) {
            System.out.println("Test 4 (Data Param): " + coords4[0] + ", " + coords4[1]);
            if (Math.abs(coords4[0] - 13.0552404) < 0.0001 && Math.abs(coords4[1] - 80.2785923) < 0.0001) {
                System.out.println("✅ Test 4 Passed: Correctly prioritized Pin over Viewport");
            } else {
                System.out.println("❌ Test 4 Failed: Got " + coords4[0] + ", " + coords4[1]);
            }
        } else {
            System.out.println("❌ Test 4 Failed: Could not extract");
        }

        // Test 5: Standard URL with @lat,lng
        String url5 = "https://www.google.com/maps/place/12.9716,77.5946/@12.9716,77.5946,15z";
        double[] coords5 = extractCoordinates(url5);
        if (coords5 != null && Math.abs(coords5[0] - 12.9716) < 0.0001 && Math.abs(coords5[1] - 77.5946) < 0.0001) {
            System.out.println("✅ Test 5 Passed: " + coords5[0] + ", " + coords5[1]);
        } else {
            System.out.println("❌ Test 5 Failed");
        }
    }

    private static void test(String url, double expectedLat, double expectedLng) {
        double[] coords = getCoordinates(url);
        if (coords != null && Math.abs(coords[0] - expectedLat) < 0.0001
                && Math.abs(coords[1] - expectedLng) < 0.0001) {
            System.out.println("[PASS] " + url);
        } else {
            System.out.println("[FAIL] " + url + " -> Got: " + (coords == null ? "null" : coords[0] + "," + coords[1]));
        }
    }

    // --- Logic from GoogleMapsUtil ---

    public static double[] getCoordinates(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        String fullUrl = url;
        if (url.contains("goo.gl") || url.contains("maps.app.goo.gl") || url.contains("bit.ly")) {
            fullUrl = expandUrl(url);
        }

        return extractCoordinates(fullUrl);
    }

    private static String expandUrl(String shortUrl) {
        try {
            URL url = new URL(shortUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // Allow automatic redirects
            connection.setInstanceFollowRedirects(true);
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setRequestProperty("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

            // Connect to follow redirects
            connection.connect();

            // Get the final URL after redirects
            String expandedUrl = connection.getURL().toString();
            return expandedUrl;
        } catch (IOException e) {
            return shortUrl;
        }
    }

    private static double[] extractCoordinates(String url) {
        // Pattern 0: !3d and !4d (Pin coordinates in data param) - Highest Priority
        Pattern p0 = Pattern.compile("!3d(-?\\d+\\.\\d+)!4d(-?\\d+\\.\\d+)");
        Matcher m0 = p0.matcher(url);
        if (m0.find()) {
            return new double[] { Double.parseDouble(m0.group(1)), Double.parseDouble(m0.group(2)) };
        }

        Pattern p1 = Pattern.compile("@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
        Matcher m1 = p1.matcher(url);
        if (m1.find()) {
            try {
                return new double[] { Double.parseDouble(m1.group(1)), Double.parseDouble(m1.group(2)) };
            } catch (NumberFormatException e) {
            }
        }

        Pattern p2 = Pattern.compile("[?&](?:q|ll)=(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
        Matcher m2 = p2.matcher(url);
        if (m2.find()) {
            try {
                return new double[] { Double.parseDouble(m2.group(1)), Double.parseDouble(m2.group(2)) };
            } catch (NumberFormatException e) {
            }
        }

        Pattern p3 = Pattern.compile("/(?:place|search)/(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
        Matcher m3 = p3.matcher(url);
        if (m3.find()) {
            try {
                return new double[] { Double.parseDouble(m3.group(1)), Double.parseDouble(m3.group(2)) };
            } catch (NumberFormatException e) {
            }
        }

        return null;
    }
}
