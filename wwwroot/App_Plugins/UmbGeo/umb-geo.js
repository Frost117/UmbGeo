import { LitElement as m, html as C, property as c, customElement as V } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as y } from "@umbraco-cms/backoffice/event";
import { UMB_AUTH_CONTEXT as g } from "@umbraco-cms/backoffice/auth";
var L = Object.defineProperty, x = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, r = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? x(e, i) : e, h = t.length - 1, v; h >= 0; h--)
    (v = t[h]) && (s = (o ? v(e, i, s) : v(s)) || s);
  return o && s && L(e, i, s), s;
}, $ = (t, e, i) => e.has(t) || _("Cannot " + i), w = (t, e, i) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), n = (t, e, i) => ($(t, e, "access private method"), i), a, d, u, f, p;
let l = class extends E(m) {
  constructor() {
    super(), w(this, a), this._validationState = {
      isLatitudeValid: !0,
      isLongitudeValid: !0,
      isElevationValid: !0,
      isValid: !0
    }, this.coordinates = {
      latitude: 0,
      longitude: 0,
      elevation: 0
    }, this.consumeContext(g, (t) => {
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
    return C`
        <div class="coordinate">
            <uui-input 
                type="number"
                label="Latitude Value:" 
                placeholder="Latitude"
                min="-90"
                max="90"
                .value="${this.coordinates.latitude}"
                @input="${(t) => n(this, a, d).call(this, t, "latitude")}"
                @change="${(t) => n(this, a, u).call(this, t, "latitude")}"
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
                @input="${(t) => n(this, a, d).call(this, t, "longitude")}"
                @change="${(t) => n(this, a, u).call(this, t, "longitude")}"
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
                @input="${(t) => n(this, a, d).call(this, t, "elevation")}"
                @change="${(t) => n(this, a, u).call(this, t, "elevation")}"
                .error="${!this._validationState.isElevationValid}"
            ></uui-input>
        </div>
        `;
  }
  async connectedCallback() {
    super.connectedCallback(), await n(this, a, p).call(this), this.consumeContext(g, (t) => {
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
  }, n(this, a, p).call(this);
};
u = function(t, e) {
  const i = parseFloat(t.target.value);
  this.coordinates = {
    ...this.coordinates,
    [e]: i
  }, this._validationState.isValid ? n(this, a, f).call(this) : console.warn("Cannot save invalid coordinates:", this.coordinates);
};
f = function() {
  this.dispatchEvent(new y());
};
p = async function() {
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
