import { Map as LeafletMap, Marker, latLng, LeafletMouseEvent, marker, tileLayer } from "leaflet";

export interface Coordinates {
    latitude: number;
    longitude: number;
    elevation: number;
}

export class MapHelper {
    private mapInstance?: LeafletMap;
    private mapMarker?: Marker;
    private clickToPlaceMode: boolean = false;
    private onCoordinateChange?: (coords: Coordinates) => void;
    
    initializeMap(
        mapElement: HTMLElement,
        initialCoords: Coordinates,
        mapOptions: any = { zoom: 13 },
        onCoordinateChange: (coords: Coordinates) => void
    ): void {
        this.onCoordinateChange = onCoordinateChange;

        const initialLatLng = latLng(initialCoords.latitude, initialCoords.longitude);
        this.mapInstance = new LeafletMap(mapElement, { ...mapOptions, center: initialLatLng });
        
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.mapInstance);
        
        this.mapMarker = marker(initialLatLng, { draggable: true }).addTo(this.mapInstance);
        
        this.setupEventListeners(initialCoords);
    }
    
    updatePosition(coords: Coordinates): void {
        if (this.mapInstance && this.mapMarker) {
            const newLatLng = latLng(coords.latitude, coords.longitude);
            this.mapInstance.setView(newLatLng);
            this.mapMarker.setLatLng(newLatLng);
        }
    }
    
    refresh(): void {
        if (this.mapInstance) {
            this.mapInstance.invalidateSize();
        }
    }
    
    toggleClickToPlace(): boolean {
        this.clickToPlaceMode = !this.clickToPlaceMode;

        if (this.mapInstance) {
            const container = this.mapInstance.getContainer() as HTMLElement;
            container.style.cursor = this.clickToPlaceMode ? 'crosshair' : '';
        }

        return this.clickToPlaceMode;
    }
    
    async getCurrentLocation(): Promise<Coordinates> {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser.');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 100,
                maximumAge: 600
            });
        });

        const coords: Coordinates = {
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
            elevation: 0
        };

        if (this.mapInstance && this.mapMarker) {
            const newLatLng = latLng(coords.latitude, coords.longitude);
            this.mapInstance.setView(newLatLng, 15);
            this.mapMarker.setLatLng(newLatLng);
            this.showPopup(coords, 'Current Location');
        }

        return coords;
    }

    destroy(): void {
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = undefined;
            this.mapMarker = undefined;
        }
    }

    private setupEventListeners(initialCoords: Coordinates): void {
        if (!this.mapInstance || !this.mapMarker) return;

        this.mapInstance.on('click', (e: LeafletMouseEvent) => {
            if (this.clickToPlaceMode) {
                this.handleMapClick(e);
            }
        });

        this.mapMarker.on('dragend', (e) => {
            const position = (e.target as Marker).getLatLng();
            const coords: Coordinates = {
                ...initialCoords,
                latitude: parseFloat(position.lat.toFixed(6)),
                longitude: parseFloat(position.lng.toFixed(6)),
            };

            this.onCoordinateChange?.(coords);
        });
    }

    private handleMapClick(e: LeafletMouseEvent): void {
        const { lat, lng } = e.latlng;

        const coords: Coordinates = {
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6)),
            elevation: 0
        };

        if (this.mapMarker) {
            this.mapMarker.setLatLng([lat, lng]);
            this.showPopup(coords, 'Selected Location');
        }

        this.clickToPlaceMode = false;
        if (this.mapInstance) {
            (this.mapInstance.getContainer() as HTMLElement).style.cursor = '';
        }

        this.onCoordinateChange?.(coords);
    }

    private showPopup(coords: Coordinates, title: string = 'Location'): void {
        if (!this.mapMarker) return;

        this.mapMarker.bindPopup(`
            <b>📍 ${title}</b><br>
            Lat: ${coords.latitude.toFixed(6)}<br>
            Lng: ${coords.longitude.toFixed(6)}
        `).openPopup();
    }
}