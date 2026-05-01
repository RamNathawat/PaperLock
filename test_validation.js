"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var buildCleanPayload_1 = require("./src/lib/disclosure-engine/utils/buildCleanPayload");
var validateDisclosure_1 = require("./src/lib/disclosure-engine/validation/validateDisclosure");
var storedData = {
    version: "01-01-2026",
    propertyIdentifier: "123 Main St",
    sellerOccupying: true,
    appliances: [undefined, "WORKING", "WORKING", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "WORKING", undefined],
    systems: { waterHeater: "WORKING" },
    questions: { "41": "YES", "46": "YES", "47": "YES" },
    q41Inline: { hoaAmount: "100", frequency: "Monthly", specialAssessmentAmount: "200" },
    q46Inline: { amount: "50", paidTo: "Fire Dept", frequency: "Annually" },
    q47Details: { services: ["Water"], initialMembershipFee: "10", annualMembershipFee: "20" },
    sewerSystem: { type: "1", privateType: "0" },
    page1NotWorkingExplanation: "a",
    page2NotWorkingExplanation: "b"
};
var completeFlatValues = __assign(__assign({}, storedData), { signatures: { sellerSignatureBase64: "test", seller2SignatureBase64: "test2" }, initials: { sellerInitial1: "AB", sellerInitial2: "CD" } });
try {
    var payload = (0, buildCleanPayload_1.buildCleanPayload)(completeFlatValues, {});
    (0, validateDisclosure_1.validateDisclosureInput)(payload);
    console.log("Validation passed", JSON.stringify(payload, null, 2));
}
catch (e) {
    console.error("Validation failed:", e.message);
}
