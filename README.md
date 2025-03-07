# UmbGeo

A package that gives you a property editor for Geo Coordinates.

Since .net core 3.0, the `System.Device.Location` namespace is no longer available. This package provides a property editor for the `GeoCoordinate` class.

This package uses a third party library that gives us these classes. The library is called `GeoCoordinate.Core`.
For more information about the library, visit the GitHub page for it [here](https://github.com/realtobi999/CSharp_GeoCoordinates).

## Installation

To install this package, you can use dotnet add package or find via the NuGet package manager.

`dotnet add package UmbGeo` in your console.

## Usage

### GetDistanceTo()


Displays the distance between the current geolocation and the given coordinate in meters.

```csharp
@Model.PropertyEditor.GetDistanceTo(new Coordinate(4, 20, 10))
```

---------------------------

### IsWithinDistanceTo()

Returns a bool that checks if the current coordinates are within the given distance to the given coordinate.

```csharp
@Model.PropertyEditor.IsWithinDistanceTo(new Coordinate(4, 20, 10), 1000)`
```

---------------------------

### ToPrettyString()

Returns a human-readable string of the coordinate in a degrees, minutes, and seconds (DMS) format with N/S and E/W suffixes.

```csharp
@Model.PropertyEditor.ToPrettyString()
```

---------------------------
### Parse()

Parses a coordinate string in the format "latitude|longitude|elevation" and returns a new <c>Coordinate</c> object.

```csharp
@{
    var coordinateString = "45|90|100";
}

@Coordinate.Parse(coordinateString)
```
---------------------------