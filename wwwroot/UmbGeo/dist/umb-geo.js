import { LitElement as C, html as v, property as c, customElement as V } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as E } from "@umbraco-cms/backoffice/event";
import { UMB_AUTH_CONTEXT as _ } from "@umbraco-cms/backoffice/auth";
var L = Object.defineProperty, x = Object.getOwnPropertyDescriptor, f = (t) => {
  throw TypeError(t);
}, r = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? x(e, i) : e, h = t.length - 1, p; h >= 0; h--)
    (p = t[h]) && (s = (o ? p(e, i, s) : p(s)) || s);
  return o && s && L(e, i, s), s;
}, $ = (t, e, i) => e.has(t) || f("Cannot " + i), b = (t, e, i) => e.has(t) ? f("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), n = (t, e, i) => ($(t, e, "access private method"), i), a, d, u, m, g;
let l = class extends y(C) {
  constructor() {
    super(), b(this, a), this._validationState = {
      isLatitudeValid: !0,
      isLongitudeValid: !0,
      isElevationValid: !0,
      isValid: !0
    }, this.coordinates = {
      latitude: 0,
      longitude: 0,
      elevation: 0
    }, this.consumeContext(_, (t) => {
      this._authContext = t, this._authContext && (this.geoAuthToken = this._authContext.getLatestToken());
    });
  }
  get value() {
    return this.coordinates;
  }
  set value(t) {
    t ? this.coordinates = t : console.warn("Attempted to set coordinates to undefined.");
  }
  set config(t) {
    if (!t) {
      console.warn("Config is undefined.");
      return;
    }
    const e = t.getValueByAlias("defaultGeolocation");
    e ? this.coordinates = {
      latitude: this.coordinates.latitude || e.latitude,
      longitude: this.coordinates.longitude || e.longitude,
      elevation: this.coordinates.elevation || e.elevation
    } : console.warn("defaultGeolocation not found. Using existing coordinates:", this.coordinates);
  }
  render() {
    return v`
        <style>
            .error-message {
                display: inline; /* Make the <p> tag inline */
                color: red; /* Optional: Add color for better visibility */
                margin-left: 8px; /* Optional: Add spacing between input and error message */
            }
        </style>
        <div class="coordinate">
            <uui-input 
                type="number"
                step="0.0001"
                placeholder="Latitude"
                min="-90"
                max="90"
                .value="${this.coordinates.latitude}"
                @input="${(t) => n(this, a, d).call(this, t, "latitude")}"
                @change="${(t) => n(this, a, u).call(this, t, "latitude")}"
                .error="${!this._validationState.isLatitudeValid}"
            ></uui-input>
            ${this._validationState.isLatitudeValid ? "" : v`<p class="error-message">Latitude must be between -90 and 90.</p>`}
        </div>
        <div class="coordinate">
            <uui-input 
                type="number"
                step="0.0001"
                label="Longitude Value" 
                placeholder="Longitude"
                min="-180"
                max="180"
                .value="${this.coordinates.longitude}"
                @input="${(t) => n(this, a, d).call(this, t, "longitude")}"
                @change="${(t) => n(this, a, u).call(this, t, "longitude")}"
                .error="${!this._validationState.isLongitudeValid}"
            ></uui-input> 
        </div>
        <div class="coordinate">
            <uui-input 
                type="number"
                step="0.0001"
                max="8850"
                min="-420"
                placeholder="Elevation"
                .value="${this.coordinates.elevation}"
                @input="${(t) => n(this, a, d).call(this, t, "elevation")}"
                @change="${(t) => n(this, a, u).call(this, t, "elevation")}"
                .error="${!this._validationState.isElevationValid}"
            ></uui-input>
            ${this._validationState.isElevationValid ? "" : v`<p class="error-message">Elevation must be between -420 and 8850.</p>`}
        </div>
        `;
  }
  async connectedCallback() {
    super.connectedCallback(), await n(this, a, g).call(this), this.consumeContext(_, (t) => {
      this._authContext = t, this._authContext && (this.geoAuthToken = this._authContext.getLatestToken());
    });
  }
};
a = /* @__PURE__ */ new WeakSet();
d = function(t, e) {
  const i = parseFloat(t.target.value);
  this.coordinates = {
    ...this.coordinates,
    [e]: i
  }, n(this, a, g).call(this);
};
u = function(t, e) {
  const i = parseFloat(t.target.value);
  this.coordinates = {
    ...this.coordinates,
    [e]: i
  }, this._validationState.isValid ? n(this, a, m).call(this) : console.warn("Cannot save invalid coordinates:", this.coordinates);
};
m = function() {
  this.dispatchEvent(new E());
};
g = async function() {
  if (!this._authContext) return;
  const e = {
    Authorization: `Bearer ${await this._authContext.getLatestToken()}`
  };
  try {
    const o = await (await fetch(
      `/AreCoordinatesValid?latitude=${this.coordinates.latitude}&longitude=${this.coordinates.longitude}&elevation=${this.coordinates.elevation}`,
      { headers: e }
    )).json();
    this._validationState = {
      isLatitudeValid: o.isLatitudeValid,
      isLongitudeValid: o.isLongitudeValid,
      isElevationValid: o.isElevationValid,
      isValid: o.isValid
    }, console.log("Validation results:", this._validationState);
  } catch (i) {
    console.error("Error validating coordinates:", i);
  }
};
r([
  c()
], l.prototype, "geoAuthToken", 2);
r([
  c({ attribute: !1 })
], l.prototype, "config", 1);
r([
  c({ type: Boolean })
], l.prototype, "_validationState", 2);
r([
  c({ type: Object })
], l.prototype, "coordinates", 2);
l = r([
  V("geo-location")
], l);
export {
  l as default
};
//# sourceMappingURL=umb-geo.js.map
