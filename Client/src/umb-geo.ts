// umb-geo.ts

import { LitElement, html, customElement, property, PropertyValueMap, css, nothing } from '@umbraco-cms/backoffice/external/lit';
import { MapOptions, Icon } from "leaflet";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbPropertyEditorConfigCollection, UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/property-editor';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UMB_AUTH_CONTEXT, UmbAuthContext } from "@umbraco-cms/backoffice/auth";
import { MapHelper, Coordinates } from './map-helper';

@customElement('geo-location')
export default class UmbGeoLocationPropertyEditorUIElement extends UmbElementMixin(LitElement) implements UmbPropertyEditorUiElement{

    
    private _valueHasBeenSet: boolean = false;
    public get value() { return this.coordinates }
    public set value(value) {
        if (value) {
            this.coordinates = value;
            this._valueHasBeenSet = true;
        }
    }

    @property() public mapOptions: MapOptions = { zoom: 13 }
    @property({ type: Boolean }) public showMap: boolean = false
    @property({ type: Object }) public coordinates: Coordinates = { latitude: 0, longitude: 0, elevation: 0 }
    @property({ type: Number }) public mapHeight: number = 400;
    @property({ type: Boolean }) private clickToPlaceMode: boolean = false
    @property({ type: Object }) private validationState = {
        isLatitudeValid: true, isLongitudeValid: true, isElevationValid: true, isValid: true
    }

    private readonly _authContextReady: Promise<UmbAuthContext>;
    private _authContextResolver!: (value: UmbAuthContext) => void;
    
    private mapHelper: MapHelper = new MapHelper()

    @property({ attribute: false })
    public set config(config: UmbPropertyEditorConfigCollection | undefined) {
        if (!config) return;

        const defaultCoords: Coordinates | undefined = config.getValueByAlias("defaultGeolocation");
        if (defaultCoords && !this._valueHasBeenSet) {
            this.coordinates = { ...defaultCoords };
        }
        const defaultMapHeight = config.getValueByAlias("defaultMapHeight");
        this.mapHeight = typeof defaultMapHeight === 'number' ? defaultMapHeight : 400;
        
        const defaultMapToggle = config.getValueByAlias("defaultLeafletMap");
        this.showMap = typeof defaultMapToggle === 'boolean' ? defaultMapToggle : false;
    }

    constructor() {
        super();
        this._authContextReady = new Promise((resolve) => {
            this._authContextResolver = resolve;
        });
        this.setupLeafletIcons();
        this.setupAuthContext();
    }
    
    private async onInput(e: InputEvent, field: keyof Coordinates) {
        const value = parseFloat((e.target as HTMLInputElement).value);
        this.coordinates = { ...this.coordinates, [field]: value };
        await this.validateCoordinates();
    }

    private async onChange(e: Event, field: keyof Coordinates) {
        const value = parseFloat((e.target as HTMLInputElement).value);
        this.coordinates = { ...this.coordinates, [field]: value };
        await this.validateCoordinates();
        if (this.validationState.isValid) {
            this.dispatchEvent(new UmbChangeEvent());
        }
    }
    
    private toggleClickToPlace() {
        this.clickToPlaceMode = this.mapHelper.toggleClickToPlace();
    }

    private async useCurrentLocation() {
        try {
            this.coordinates = await this.mapHelper.getCurrentLocation();
            await this.validateCoordinates();
            if (this.validationState.isValid) {
                this.dispatchEvent(new UmbChangeEvent());
            }
        } catch (error) {
            console.error('Error getting current location:', error);
            alert(error instanceof Error ? error.message : 'Unable to retrieve location');
        }
    }
    
    protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): Promise<void> {
        super.firstUpdated(_changedProperties);
        if (this.showMap) {
            await this.initializeMap();
        }
    }

    protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): Promise<void> {
        super.updated(_changedProperties);
        if (this.showMap && !this.mapHelper){
            await this.initializeMap();
        } 
        if (_changedProperties.has('coordinates')) this.mapHelper.updatePosition(this.coordinates);
        if (_changedProperties.has('mapHeight')) {
            setTimeout(() => this.mapHelper.refresh(), 100);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.mapHelper.destroy();
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.validateCoordinates();
    }
    
    private setupLeafletIcons() {
        delete (Icon.Default.prototype as any)._getIconUrl;
        Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
        });
    }

    private setupAuthContext() {
        this.consumeContext(UMB_AUTH_CONTEXT, (context: UmbAuthContext | undefined) => {
            if(context) {
                this._authContextResolver(context);
            }
        });
    }

    private async initializeMap() {
        const mapElement = this.shadowRoot?.querySelector('#map') as HTMLElement;
        if (mapElement) {
            this.mapHelper.initializeMap(
                mapElement,
                this.coordinates,
                this.mapOptions,
                async (coords: Coordinates) => {
                    this.coordinates = coords;
                    await this.validateCoordinates();
                    if (this.validationState.isValid) {
                        this.dispatchEvent(new UmbChangeEvent());
                    }
                }
            );
        }
    }

    private async validateCoordinates() {
        const authContext = await this._authContextReady;

        try {
            const token = await authContext.getLatestToken();
            const response = await fetch(
                `/AreCoordinatesValid?latitude=${this.coordinates.latitude}&longitude=${this.coordinates.longitude}&elevation=${this.coordinates.elevation}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const results = await response.json();

            this.validationState = {
                isLatitudeValid: results.isLatitudeValid,
                isLongitudeValid: results.isLongitudeValid,
                isElevationValid: results.isElevationValid,
                isValid: results.isValid,
            };
        } catch (error) {
            console.error('Error validating coordinates:', error);
        }
    }

    render() {
        return html`
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <!-- Coordinate Input Fields -->
        <div class="coordinates-container">
            ${this.renderCoordinateInput('latitude', 'Latitude', -90, 90, this.validationState.isLatitudeValid, 'Latitude must be between -90 and 90.')}
            ${this.renderCoordinateInput('longitude', 'Longitude', -180, 180, this.validationState.isLongitudeValid, 'Longitude must be between -180 and 180.')}
            ${this.renderCoordinateInput('elevation', 'Elevation', -420, 8850, this.validationState.isElevationValid, 'Elevation must be between -420 and 8850.')}
        </div>

        <!-- Map Section -->
        ${this.showMap ? html`
            <div class="map-controls">
                <uui-button 
                    @click="${this.toggleClickToPlace}"
                    color="${this.clickToPlaceMode ? 'positive' : 'default'}"
                    look="primary" compact
                >
                    ${this.clickToPlaceMode ? '✓ Click on map to place pin' : '📍 Click to place pin'}
                </uui-button>
                <uui-button @click="${this.useCurrentLocation}" look="secondary" compact>
                    🌍 Use current location
                </uui-button>
            </div>
            <div class="leaflet-container" style="height: ${this.mapHeight}px;">
                <div id="map"></div>
            </div>
        ` : nothing}
        `;
    }

    private renderCoordinateInput(
        field: 'latitude' | 'longitude' | 'elevation',
        label: string,
        min: number,
        max: number,
        isValid: boolean,
        errorMessage: string
    ) {
        return html`
            <div class="coordinate">
                <uui-input
                    class="coordinate-input"
                    type="number"
                    step="0.0000001"
                    min="${min}"
                    max="${max}"
                    .value="${this.coordinates[field]}"
                    @input="${(e: InputEvent) => this.onInput(e, field)}"
                    @change="${(e: Event) => this.onChange(e, field)}"
                    ?error="${!isValid}"
                >
                    <div class="extra" slot="prepend">${label}</div>
                </uui-input>
                ${!isValid ? html`<p class="error-message">${errorMessage}</p>` : ''}
            </div>
        `;
    }

    static styles = css`
        .error-message { display: inline; color: red; margin-left: 8px; }
        .extra {
            user-select: none; height: 100%; min-width: 75px; padding: 0 var(--uui-size-3);
            background: #f3f3f3; color: grey; display: flex; justify-content: center; align-items: center;
            border-right: 1px solid var(--uui-input-border-color, var(--uui-color-border));
        }
        .coordinate-input { min-width: 230px; }
        .coordinate { padding-bottom: 2px; }
        .coordinates-container { padding-bottom: 12px; }
        .map-controls { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
        .map-controls uui-button { font-size: 12px; }
        #map { border-radius: 4px; border: 1px solid var(--uui-color-border); height: 100%; width: 100%;}
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'geo-location': UmbGeoLocationPropertyEditorUIElement;
    }
}