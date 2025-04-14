using GeoCoordinates.Core;
using Newtonsoft.Json;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;

namespace UmbGeo;

public sealed class GeoCoordinatesConverter : IPropertyValueConverter
{
    public bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorUiAlias == "UmbGeo.Location";
    public object ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview) => inter!;

    public object ConvertIntermediateToXPath(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview) 
    {
        throw new NotImplementedException();
    }
    
    public object ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview)
    { 
        if (source == null) return null;
         Coordinate converted = JsonConvert.DeserializeObject<Coordinate>(source.ToString()!)!;
         return converted ?? throw new NullReferenceException();
    }
    
    public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Element;
    public bool? IsValue(object? value, PropertyValueLevel level) => false;
    
    Type IPropertyValueConverter.GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(Coordinate);
}