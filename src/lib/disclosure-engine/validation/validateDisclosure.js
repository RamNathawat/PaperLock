"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDisclosureInput = validateDisclosureInput;
// Page 1 appliance indexes: 0–18 (PDF rows 0–18).
// Page 2 appliance indexes: 19–38 (PAGE2_ROW_Y keys 0–19).
var PAGE_2_APPLIANCE_OFFSET = 19;
function validateDisclosureInput(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    if (data.version !== "01-01-2026") {
        throw new Error("Unsupported disclosure version");
    }
    if (!data.propertyIdentifier || data.propertyIdentifier.trim() === "") {
        throw new Error("propertyIdentifier is required");
    }
    if (data.initials) {
        var _m = data.initials, buyerInitial1 = _m.buyerInitial1, buyerInitial2 = _m.buyerInitial2, sellerInitial1 = _m.sellerInitial1, sellerInitial2 = _m.sellerInitial2;
        if (buyerInitial1 && buyerInitial1.length > 5)
            throw new Error("initials.buyerInitial1 must be 5 characters or less");
        if (buyerInitial2 && buyerInitial2.length > 5)
            throw new Error("initials.buyerInitial2 must be 5 characters or less");
        if (sellerInitial1 && sellerInitial1.length > 5)
            throw new Error("initials.sellerInitial1 must be 5 characters or less");
        if (sellerInitial2 && sellerInitial2.length > 5)
            throw new Error("initials.sellerInitial2 must be 5 characters or less");
    }
    if (data.appliances) {
        var entries = Object.entries(data.appliances);
        var hasNotWorkingPage1 = entries.some(function (_a) {
            var key = _a[0], status = _a[1];
            return Number(key) < PAGE_2_APPLIANCE_OFFSET && status === "NOT_WORKING";
        });
        var hasNotWorkingPage2 = entries.some(function (_a) {
            var key = _a[0], status = _a[1];
            return Number(key) >= PAGE_2_APPLIANCE_OFFSET && status === "NOT_WORKING";
        });
        if (hasNotWorkingPage1 && !((_a = data.page1NotWorkingExplanation) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new Error("page1NotWorkingExplanation is required when any page 1 appliance is marked NOT_WORKING");
        }
        if (hasNotWorkingPage2 && !((_b = data.page2NotWorkingExplanation) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new Error("page2NotWorkingExplanation is required when any page 2 appliance is marked NOT_WORKING");
        }
    }
    // ── Character limits removed ──────────────────────────────────
    // Text overflow is handled automatically by renderExplanations.ts
    // which appends continuation pages to the PDF when needed.
    // There is no upper bound on explanation length.
    if (((_c = data.sewerSystem) === null || _c === void 0 ? void 0 : _c.type) === 1 && data.sewerSystem.privateType === undefined) {
        throw new Error("sewerSystem.privateType is required when sewer type is Private");
    }
    if (((_d = data.questions) === null || _d === void 0 ? void 0 : _d[41]) === "YES" && !((_f = (_e = data.q41Inline) === null || _e === void 0 ? void 0 : _e.hoaAmount) === null || _f === void 0 ? void 0 : _f.trim())) {
        throw new Error("q41Inline.hoaAmount is required when Q41 is YES");
    }
    if (((_g = data.q41Inline) === null || _g === void 0 ? void 0 : _g.unpaid) === "YES" && !((_h = data.q41Inline.ifYesAmount) === null || _h === void 0 ? void 0 : _h.trim())) {
        throw new Error("q41Inline.ifYesAmount is required when unpaid is YES");
    }
    if (((_j = data.questions) === null || _j === void 0 ? void 0 : _j[46]) === "YES" && !((_l = (_k = data.q46Inline) === null || _k === void 0 ? void 0 : _k.amount) === null || _l === void 0 ? void 0 : _l.trim())) {
        throw new Error("q46Inline.amount is required when Q46 is YES");
    }
}
