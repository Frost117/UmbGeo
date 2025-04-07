using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors;

public class GeoLocationValueValidator : IValueValidator
{
    
    public IEnumerable<ValidationResult> Validate(object? value, string? valueType, object? dataTypeConfiguration,
        PropertyValidationContext validationContext)
    {
        if (value is not JsonElement jsonElement || !jsonElement.TryGetProperty("latitude", out var latitudeProp) ||
            !jsonElement.TryGetProperty("longitude", out var longitudeProp) ||
            !jsonElement.TryGetProperty("elevation", out var elevationProp))
        {
            return new List<ValidationResult> { new ValidationResult("Invalid JSON structure for coordinates.") };
        }

        var latitude = latitudeProp.GetDouble();
        var longitude = longitudeProp.GetDouble();
        var elevation = elevationProp.GetDouble();

        if (latitude < -90 || latitude > 90)
        {
            return new List<ValidationResult> { new ValidationResult("Latitude must be between -90 and 90.") };
        }

        if (longitude < -180 || longitude > 180)
        {
            return new List<ValidationResult> { new ValidationResult("Longitude must be between -180 and 180.") };
        }

        if (elevation < -420 || elevation > 8850)
        {
            return new List<ValidationResult> { new ValidationResult("Elevation must be between -420 and 8850.") };
        }

        return Enumerable.Empty<ValidationResult>();
    }
}
