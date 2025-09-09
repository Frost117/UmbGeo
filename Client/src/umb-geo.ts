import { LitElement, html, customElement, property, css, PropertyValueMap } from '@umbraco-cms/backoffice/external/lit';
import { map, Map as LeafletMap, MapOptions, tileLayer, marker, Marker, latLng } from "leaflet";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbPropertyEditorConfigCollection, UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/property-editor';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import {UMB_AUTH_CONTEXT, UmbAuthContext} from "@umbraco-cms/backoffice/auth";

@customElement('geo-location')
export default class UmbGeoLocationPropertyEditorUIElement extends UmbElementMixin(LitElement) implements UmbPropertyEditorUiElement{
    public get value(){
        return this.coordinates
    }
    
    public set value(value) {
        if (value) {
            this.coordinates = value;
        } else {
            console.warn('Attempted to set coordinates to undefined.');
        }
    }
    @property({attribute: false})
    public mapInstance?: LeafletMap;

    @property({attribute: false})
    public mapMarker?: Marker;

    @property()
    public mapOptions: MapOptions = {
        zoom: 13,
    }
    
    @property()
    public geoAuthToken: Promise<string> | undefined
    
    @property({ attribute: false })
    public set config(config: UmbPropertyEditorConfigCollection | undefined) {
        if (!config) {
            console.warn('Config is undefined.');
            return;
        }

        // Retrieve the value of defaultGeolocation
        const defaultCoordinatesConfigValue: { latitude: number; longitude: number; elevation: number } | undefined =
            config.getValueByAlias("defaultGeolocation");
        
        if (defaultCoordinatesConfigValue) {
            // Check if any of the fields are empty or invalid and fall back to defaultCoordinatesConfigValue
            this.coordinates = {
                latitude: this.coordinates.latitude || defaultCoordinatesConfigValue.latitude,
                longitude: this.coordinates.longitude || defaultCoordinatesConfigValue.longitude,
                elevation: this.coordinates.elevation || defaultCoordinatesConfigValue.elevation,
            };
            
        } else {
            console.warn('defaultGeolocation not found. Using existing coordinates:', this.coordinates);
        }

        // Retrieve and set the map visibility toggle
        const defaultMapToggleConfigValue: boolean | undefined = config.getValueByAlias("defaultLeafletMap");

        // If the value is a boolean (true or false), use it. Otherwise, fall back to a default (e.g., false).
        this.showMap = typeof defaultMapToggleConfigValue === 'boolean' ? defaultMapToggleConfigValue : false;
        
        console.log('map value is here',this.showMap)
        
    }
    @property({ type: Boolean })
    private _validationState: { isLatitudeValid: boolean; isLongitudeValid: boolean; isElevationValid: boolean, isValid: boolean } = {
        isLatitudeValid: true,
        isLongitudeValid: true,
        isElevationValid: true,
        isValid: true,
    };

    @property({ type: Object }) // Default value
    public coordinates: { latitude: number; longitude: number; elevation: number } = {
        latitude: 0,
        longitude: 0,
        elevation: 0,
    };

    @property({ type: Boolean })
    public showMap: boolean = false;
    
    private _authContext: UmbAuthContext | undefined;

    #onInput(e: InputEvent, field: 'latitude' | 'longitude' | 'elevation') {
        const value = parseFloat((e.target as HTMLInputElement).value);
        this.coordinates = {
            ...this.coordinates,
            [field]: value,
        };
    
        this.#validateCoordinates();
    }
    
    #onChange(e: Event, field: 'latitude' | 'longitude' | 'elevation') {
        const value = parseFloat((e.target as HTMLInputElement).value);
        this.coordinates = {
            ...this.coordinates,
            [field]: value,
        };
        if (this._validationState.isValid) {
            this.#dispatchChangeEvent();
        } else {
            console.warn('Cannot save invalid coordinates:', this.coordinates);
        }
    }
    
    #dispatchChangeEvent(){
        this.dispatchEvent(new UmbChangeEvent());
    }

    constructor() {
        super();
        this.consumeContext(UMB_AUTH_CONTEXT,(context) =>{
            this._authContext = context;
            if (this._authContext) {
                this.geoAuthToken = this._authContext.getLatestToken();
            }
        } )
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        if (this.showMap) {
            this.initializeMap();
        }
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);
        if (this.showMap && !this.mapInstance) {
            this.initializeMap();
        }

        if (_changedProperties.has('coordinates') && this.mapInstance) {
            const newLatLng = latLng(this.coordinates.latitude, this.coordinates.longitude);
            this.mapInstance.setView(newLatLng);
            if (this.mapMarker) {
                this.mapMarker.setLatLng(newLatLng);
            } else {
                this.mapMarker = marker(newLatLng).addTo(this.mapInstance);
            }
        }
    }

    private initializeMap() {
        const mapElement = this.shadowRoot?.querySelector('#map');
        if (mapElement && !this.mapInstance) {
            const initialLatLng = latLng(this.coordinates.latitude, this.coordinates.longitude);
            this.mapInstance = map(mapElement as HTMLElement, { ...this.mapOptions, center: initialLatLng });
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.mapInstance);
            this.mapMarker = marker(initialLatLng).addTo(this.mapInstance);
        }
    }
    
    render() {
        return html`
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            .error-message {
                display: inline; /* Make the <p> tag inline */
                color: red; /* Optional: Add color for better visibility */
                margin-left: 8px; /* Optional: Add spacing between input and error message */
            }
            .extra {
                user-select: none;
                height: 100%;
                min-width: 75px;
                padding: 0 var(--uui-size-3);
                background: #f3f3f3;
                color: grey;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .extra:first-child {
                border-right: 1px solid
                var(--uui-input-border-color, var(--uui-color-border));
            }
            * + .extra {
                border-left: 1px solid
                var(--uui-input-border-color, var(--uui-color-border));
            }
            .coordinate-input {
                min-width: 230px;
            }
            .coordinate{
                padding-bottom: 2px;
            }
            .coordinates-container {
                padding-bottom: 12px;
            }
            .leaflet-container {
                height: 400px;
            }
        </style>
        <div class="coordinates-container">
            <div class="coordinate">
                <uui-input
                    class="coordinate-input"
                    type="number"
                    step="0.000001"
                    max="90"
                    min="-90"
                    .value="${this.coordinates.latitude}"
                    @input="${(e: InputEvent) => this.#onInput(e, 'latitude')}"
                    @change="${(e: Event) => this.#onChange(e, 'latitude')}"
                    .error="${!this._validationState.isLatitudeValid}"
                ><div class="extra" slot="prepend">Latitude</div>
                </uui-input>
                ${!this._validationState.isLatitudeValid ? html`<p class="error-message">Latitude must be between -90 and 90.</p>` : ''}
            </div>
            <div class="coordinate">
                <uui-input
                    class="coordinate-input"
                    type="number"
                    step="0.000001"
                    max="180"
                    min="-180"
                    .value="${this.coordinates.longitude}"
                    @input="${(e: InputEvent) => this.#onInput(e, 'longitude')}"
                    @change="${(e: Event) => this.#onChange(e, 'longitude')}"
                    .error="${!this._validationState.isLongitudeValid}"
                ><div class="extra" slot="prepend">Longitude</div>
                </uui-input>
                ${!this._validationState.isLongitudeValid ? html`<p class="error-message">Latitude must be between -180 and 180.</p>` : ''}
            </div>
            <div class="coordinate">
                <uui-input
                    class="coordinate-input"
                    type="number"
                    step="0.000001"
                    max="8850"
                    min="-420"
                    placeholder="Elevation"
                    .value="${this.coordinates.elevation}"
                    @input="${(e: InputEvent) => this.#onInput(e, 'elevation')}"
                    @change="${(e: Event) => this.#onChange(e, 'elevation')}"
                    .error="${!this._validationState.isElevationValid}"
                ><div class="extra" slot="prepend">Elevation</div>
                </uui-input>
                ${!this._validationState.isElevationValid ? html`<p class="error-message">Elevation must be between -420 and 8850.</p>` : ''}
            </div>
        </div>
        ${this.showMap
                ? html`
                <div class="leaflet-container">
                    <div id="map"></div>
                </div>
              `
                : ''
        }
        `;
    }

    async connectedCallback() {
        super.connectedCallback();

        await this.#validateCoordinates();

        this.consumeContext(UMB_AUTH_CONTEXT, (context) => {
            this._authContext = context;
            if (this._authContext) {
                this.geoAuthToken = this._authContext.getLatestToken();
            }
        });
    }

    async #validateCoordinates() {
        if (!this._authContext) return;
    
        const token = await this._authContext.getLatestToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };
    
        try {
            const response = await fetch(
                `/AreCoordinatesValid?latitude=${this.coordinates.latitude}&longitude=${this.coordinates.longitude}&elevation=${this.coordinates.elevation}`,
                { headers }
            );
            const results = await response.json();
    
            this._validationState = {
                isLatitudeValid: results.isLatitudeValid,
                isLongitudeValid: results.isLongitudeValid,
                isElevationValid: results.isElevationValid,
                isValid: results.isValid,
            };
    
        } catch (error) {
            console.error('Error validating coordinates:', error);
        }
    }

}


declare global {
        interface HTMLElementTagNameMap {
            'geo-location': UmbGeoLocationPropertyEditorUIElement;
    }
}

