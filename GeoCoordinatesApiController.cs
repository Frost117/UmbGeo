using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Attributes;
using GeoCoordinates.Core;

namespace UmbGeo
{
    [ValidateAngularAntiForgeryToken]
    [PluginController("GeoCoordinates")]
    public sealed class GeoCoordinatesApiController : UmbracoAuthorizedJsonController
    {
        public object IsValid(string latitude, string longitude, string elevation)
    {
        bool isLatitudeValid = double.TryParse(latitude, out double lat) && lat >= -90 && lat <= 90;
        bool isLongitudeValid = double.TryParse(longitude, out double lon) && lon >= -180 && lon <= 180;
        bool isElevationValid = double.TryParse(elevation, out double ele);

        bool isValid = isLatitudeValid && isLongitudeValid && isElevationValid && IsCorrectCords(lat, lon, ele);

        return new
        {
            isValid,
            isLatitudeValid,
            isLongitudeValid,
            isElevationValid
        };
    }

        public bool IsCorrectCords(double latitude, double longitude, double elevation)
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
}