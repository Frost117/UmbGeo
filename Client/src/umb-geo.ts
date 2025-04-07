import { LitElement, html, customElement, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbPropertyEditorConfigCollection, UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/property-editor';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UMB_AUTH_CONTEXT, UmbAuthContext } from "@umbraco-cms/backoffice/auth";

@customElement('geo-location')
export default class UmbGeoLocationPropertyEditorUIElement extends UmbElementMixin(LitElement) implements UmbPropertyEditorUiElement {
    public get value() {
        return this.coordinates;
    }

    public set value(value) {
        if (value) {
            this.coordinates = value;
        } else {
            console.warn('Attempted to set coordinates to undefined.');
        }
    }

    @property()
    public geoAuthToken: Promise<string> | undefined;

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
            // Check if any of the fields are empty or invalid, and fall back to defaultCoordinatesConfigValue
            this.coordinates = {
                latitude: this.coordinates.latitude || defaultCoordinatesConfigValue.latitude,
                longitude: this.coordinates.longitude || defaultCoordinatesConfigValue.longitude,
                elevation: this.coordinates.elevation || defaultCoordinatesConfigValue.elevation,
            };
        } else {
            console.warn('defaultGeolocation not found. Using existing coordinates:', this.coordinates);
        }
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

    #dispatchChangeEvent() {
        this.dispatchEvent(new UmbChangeEvent());
    }

    constructor() {
        super();
        this.consumeContext(UMB_AUTH_CONTEXT, (context) => {
            this._authContext = context;
            if (this._authContext) {
                this.geoAuthToken = this._authContext.getLatestToken();
            }
        });
    }

    render() {
        return html`
        <div class="coordinate">
            <uui-input 
                type="number"
                label="Latitude Value:" 
                placeholder="Latitude"
                min="-90"
                max="90"
                .value="${this.coordinates.latitude}"
                @input="${(e: InputEvent) => this.#onInput(e, 'latitude')}"
                @change="${(e: Event) => this.#onChange(e, 'latitude')}"
                .error="${!this._validationState.isLatitudeValid}"
            ></uui-input>
        </div>
        <div class="coordinate">
            <uui-input 
                type="number"
                label="Longitude Value:" 
                placeholder="Longitude"
                min="-180"
                max="180"
                .value="${this.coordinates.longitude}"
                @input="${(e: InputEvent) => this.#onInput(e, 'longitude')}"
                @change="${(e: Event) => this.#onChange(e, 'longitude')}"
                .error="${!this._validationState.isLongitudeValid}"
            ></uui-input>
        </div>
        <div class="coordinate">
            <uui-input 
                type="number"
                max="8850"
                min="-420"
                label="Elevation Value:" 
                placeholder="Elevation"
                .value="${this.coordinates.elevation}"
                @input="${(e: InputEvent) => this.#onInput(e, 'elevation')}"
                @change="${(e: Event) => this.#onChange(e, 'elevation')}"
                .error="${!this._validationState.isElevationValid}"
            ></uui-input>
        </div>
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

            if (!response.ok) {
                console.error('Validation error: Unable to validate coordinates.');
                this._validationState = {
                    isLatitudeValid: false,
                    isLongitudeValid: false,
                    isElevationValid: false,
                    isValid: false,
                };
                return;
            }

            const results = await response.json();
            this._validationState = {
                isLatitudeValid: results.isLatitudeValid,
                isLongitudeValid: results.isLongitudeValid,
                isElevationValid: results.isElevationValid,
                isValid: results.isValid,
            };

            console.log('Validation results:', this._validationState);
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

