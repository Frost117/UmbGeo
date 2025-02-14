using GeoCoordinates.Core;

namespace GeoCoordinatesIsValid;

public static class GeoCoordinate
{
    public static bool IsValid(double latitude, double longitude, double elevation)
    {
        try
        {
            _ = new Coordinate(latitude, longitude, elevation);
        }
        catch
        {
            return false;
        }

        return true;
    }
}