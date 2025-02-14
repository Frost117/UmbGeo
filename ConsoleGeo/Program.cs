using GeoCoordinates.Core;

double latitude;
double longitude;
double elevation;

bool isValid = true;

do
{
    if (!isValid)
    {
        Console.WriteLine("Invalid input. Please try again.");
    }
    Console.WriteLine("Enter latitude:");
    latitude = double.TryParse(Console.ReadLine(), out latitude) ? latitude : -100;
    Console.WriteLine("Enter longitude:");
    longitude = double.TryParse(Console.ReadLine(), out longitude) ? longitude : -100;
    Console.WriteLine("Enter elevation:");
    elevation = double.TryParse(Console.ReadLine(), out elevation) ? elevation : -100;
    isValid = GeoCoordinatesIsValid.GeoCoordinate.IsValid(latitude, longitude, elevation);
    
} while (!isValid);

var x = new Coordinate(latitude, longitude, elevation);

Console.WriteLine($"Latitude: {x.Latitude}, Longitude: {x.Longitude}, Elevation: {x.Elevation}");

var distance = x.GetDistanceTo(new Coordinate(0, 0, 0));

Console.WriteLine($"Distance to 0,0: {distance} meters");