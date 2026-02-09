
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

        // Shortened URL test (requires network, might fail if no internet)
        // test("https://goo.gl/maps/...", ...);
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
            connection.setInstanceFollowRedirects(false);
            connection.setRequestMethod("HEAD");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            int responseCode = connection.getResponseCode();

            if (responseCode >= 300 && responseCode < 400) {
                String location = connection.getHeaderField("Location");
                if (location != null) {
                    if (location.contains("goo.gl") || location.contains("maps.app.goo.gl")) {
                        return expandUrl(location);
                    }
                    return location;
                }
            }
            return shortUrl;
        } catch (IOException e) {
            return shortUrl;
        }
    }

    private static double[] extractCoordinates(String url) {
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
