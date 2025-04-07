using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Models;

[DataEditor( alias: "Umb.GeoLocation", ValueType = ValueTypes.Json, ValueEditorIsReusable = true)]
public class GeoLocationDataEditor : DataEditor
{
    public GeoLocationDataEditor(IDataValueEditorFactory dataValueEditorFactory)
        : base(dataValueEditorFactory)
    {
    }

    protected override IDataValueEditor CreateValueEditor() =>
        DataValueEditorFactory.Create<GeoLocationDataValueEditor>(Attribute!);
}
