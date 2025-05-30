using Asp.Versioning;
using GeoCoordinates.Core;
using Umbraco.Cms.Api.Management.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace UmbGeo.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "UmbGeo")]
public sealed class UmbGeoApiController : ManagementApiControllerBase
{
    [HttpGet("AreCoordinatesValid")]
    public object IsValid(string latitude, string longitude, string elevation)
    {
        bool isLatitudeValid = double.TryParse(latitude, out double lat) && lat is >= -90 and <= 90;
        bool isLongitudeValid = double.TryParse(longitude, out double lon) && lon is >= -180 and <= 180;
        bool isElevationValid = double.TryParse(elevation, out double ele) && ele is >= -420 and <= 8850;

        bool isValid = isLatitudeValid && isLongitudeValid && isElevationValid && AreCoordsCorrect(lat, lon, ele);

        return new
        {
            isValid,
            isLatitudeValid,
            isLongitudeValid,
            isElevationValid
        };
    }

    private static bool AreCoordsCorrect(double latitude, double longitude, double elevation)
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