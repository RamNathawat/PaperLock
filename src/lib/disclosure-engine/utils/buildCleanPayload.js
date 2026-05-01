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
exports.buildCleanPayload = buildCleanPayload;
var PAGE_2_APPLIANCE_OFFSET = 19;
function buildCleanPayload(flatValues, allSteps) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    var safeMergeAll = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i] = arguments[_i];
        }
        var res = {};
        objs.forEach(function (obj) {
            if (!obj)
                return;
            Object.entries(obj).forEach(function (_a) {
                var k = _a[0], v = _a[1];
                if (v !== undefined && v !== null && v !== "")
                    res[k] = v;
            });
        });
        return res;
    };
    var appliancesA = ((_a = allSteps["Appliances"]) === null || _a === void 0 ? void 0 : _a.appliances) || {};
    var appliancesB = ((_b = allSteps["Appliances Continued"]) === null || _b === void 0 ? void 0 : _b.appliances) || {};
    var appliancesC = ((_c = allSteps["Systems"]) === null || _c === void 0 ? void 0 : _c.appliances) || {};
    var mergedAppliances = safeMergeAll(flatValues.appliances, appliancesA, appliancesB, appliancesC);
    var sys = ((_d = allSteps["Systems"]) === null || _d === void 0 ? void 0 : _d.systems) || flatValues.systems || {};
    var systemToApplianceMap = {
        waterHeater: 3, waterSoftener: 5, sewer: 9, ac: 10,
        heating: 14, gasSupply: 17, propaneTank: 18,
        security: 23, fireSuppression: 25, solar: 36,
        generator: 37, waterSource: 38,
    };
    Object.entries(systemToApplianceMap).forEach(function (_a) {
        var sysKey = _a[0], appIndex = _a[1];
        if (sys[sysKey] && sys[sysKey] !== "")
            mergedAppliances[appIndex.toString()] = sys[sysKey];
    });
    var questionsA = ((_e = allSteps["Questions"]) === null || _e === void 0 ? void 0 : _e.questions) || {};
    var questionsB = ((_f = allSteps["Questions Continued"]) === null || _f === void 0 ? void 0 : _f.questions) || {};
    var questionsC = ((_g = allSteps["Questions Final"]) === null || _g === void 0 ? void 0 : _g.questions) || {};
    var mergedQuestions = safeMergeAll(flatValues.questions, questionsA, questionsB, questionsC);
    var commentsA = ((_h = allSteps["Questions"]) === null || _h === void 0 ? void 0 : _h.questionComments) || {};
    var commentsB = ((_j = allSteps["Questions Continued"]) === null || _j === void 0 ? void 0 : _j.questionComments) || {};
    var commentsC = ((_k = allSteps["Questions Final"]) === null || _k === void 0 ? void 0 : _k.questionComments) || {};
    var mergedComments = safeMergeAll(flatValues.questionComments, commentsA, commentsB, commentsC);
    var q16 = ((_l = allSteps["Questions"]) === null || _l === void 0 ? void 0 : _l.q16Inline) || flatValues.q16Inline || {};
    var q19 = ((_m = allSteps["Questions"]) === null || _m === void 0 ? void 0 : _m.q19Inline) || flatValues.q19Inline || {};
    var q37MaintenanceRaw = ((_p = (_o = allSteps["Questions Continued"]) === null || _o === void 0 ? void 0 : _o.q37Inline) === null || _p === void 0 ? void 0 : _p.maintenance) ||
        ((_q = flatValues === null || flatValues === void 0 ? void 0 : flatValues.q37Inline) === null || _q === void 0 ? void 0 : _q.maintenance);
    var q37Inline = q37MaintenanceRaw === "YES" ? 0 : q37MaintenanceRaw === "NO" ? 1 : undefined;
    var q41 = ((_r = allSteps["Questions Final"]) === null || _r === void 0 ? void 0 : _r.q41Inline) || flatValues.q41Inline || {};
    var q46 = ((_s = allSteps["Questions Final"]) === null || _s === void 0 ? void 0 : _s.q46Inline) || flatValues.q46Inline || {};
    var q47 = ((_t = allSteps["Questions Final"]) === null || _t === void 0 ? void 0 : _t.q47Details) || flatValues.q47Details || {};
    var applianceCommentsPage1 = ((_u = allSteps["Appliances"]) === null || _u === void 0 ? void 0 : _u.applianceComments) || {};
    var applianceCommentsPage2 = ((_v = allSteps["Appliances Continued"]) === null || _v === void 0 ? void 0 : _v.applianceComments) || {};
    var allApplianceComments = safeMergeAll(flatValues.applianceComments, applianceCommentsPage1, applianceCommentsPage2);
    var page1Notes = Object.entries(allApplianceComments)
        .filter(function (_a) {
        var key = _a[0], val = _a[1];
        return Number(key) < PAGE_2_APPLIANCE_OFFSET && val;
    })
        .map(function (_a) {
        var key = _a[0], val = _a[1];
        return "Appliance ".concat(key, ": ").concat(val);
    }).join("\n");
    var page2Notes = Object.entries(allApplianceComments)
        .filter(function (_a) {
        var key = _a[0], val = _a[1];
        return Number(key) >= PAGE_2_APPLIANCE_OFFSET && val;
    })
        .map(function (_a) {
        var key = _a[0], val = _a[1];
        return "Appliance ".concat(key, ": ").concat(val);
    }).join("\n");
    // ChipGroup (radio) stores the selected chip's index as a string ("0","1","2").
    // The label-based frequencyMap is the primary lookup; if it returns undefined
    // (because the value is already a numeric index string) fall back to Number().
    var frequencyMap = { Monthly: 0, Quarterly: 1, Annually: 2 };
    var resolveFrequency = function (raw) {
        if (raw === undefined || raw === null || raw === "")
            return undefined;
        if (typeof raw === "number")
            return raw;
        var byLabel = frequencyMap[raw];
        if (byLabel !== undefined)
            return byLabel;
        var n = Number(raw);
        return Number.isNaN(n) ? undefined : n;
    };
    // ChipGroup (checkbox) stores selected indices as string arrays ("0","1").
    // utilityMap handles label strings; fall back to Number() for index strings.
    var utilityMap = { Water: 0, Garbage: 1, Sewer: 2, Other: 3 };
    var resolveUtilities = function (services) {
        return services
            .map(function (s) { return (utilityMap[s] !== undefined ? utilityMap[s] : Number(s)); })
            .filter(function (v) { return !Number.isNaN(v); });
    };
    return {
        version: "01-01-2026",
        propertyIdentifier: ((_w = allSteps["Property"]) === null || _w === void 0 ? void 0 : _w.propertyIdentifier) || flatValues.propertyIdentifier || "",
        sellerOccupying: (_y = (_x = allSteps["Property"]) === null || _x === void 0 ? void 0 : _x.sellerOccupying) !== null && _y !== void 0 ? _y : flatValues.sellerOccupying,
        appliances: mergedAppliances,
        systems: ((_z = allSteps["Systems"]) === null || _z === void 0 ? void 0 : _z.systems) || flatValues.systems || {},
        inlineOptions: ((_0 = allSteps["Systems"]) === null || _0 === void 0 ? void 0 : _0.inlineOptions) || flatValues.inlineOptions || {},
        sewerSystem: ((_1 = allSteps["Systems"]) === null || _1 === void 0 ? void 0 : _1.sewerSystem) || flatValues.sewerSystem || {},
        page2Zoning: ((_2 = allSteps["Zoning"]) === null || _2 === void 0 ? void 0 : _2.page2Zoning) || flatValues.page2Zoning || {},
        page2Flood: ((_3 = allSteps["Zoning"]) === null || _3 === void 0 ? void 0 : _3.page2Flood) || flatValues.page2Flood || {},
        questions: mergedQuestions,
        questionComments: mergedComments,
        q37Inline: q37Inline,
        q41Inline: {
            hoaAmount: q41.hoaAmount,
            specialAssessmentAmount: q41.specialAssessmentAmount,
            payableType: resolveFrequency((_4 = q41.frequency) !== null && _4 !== void 0 ? _4 : q41.payableType),
            unpaid: q41.unpaid,
            ifYesAmount: q41.ifYesAmount,
            managerName: q41.managerName,
            phone: q41.managerPhone || q41.phone,
        },
        q46Inline: {
            amount: q46.amount,
            paidTo: q46.paidTo,
            payableType: resolveFrequency((_5 = q46.frequency) !== null && _5 !== void 0 ? _5 : q46.payableType),
        },
        q47Details: {
            utilities: Array.isArray(q47.services)
                ? resolveUtilities(q47.services)
                : Array.isArray(q47.utilities)
                    ? resolveUtilities(q47.utilities.map(String))
                    : [],
            otherExplain: q47.other || q47.otherExplain,
            initialMembership: q47.initialMembershipFee || q47.initialMembership,
            annualMembership: q47.annualMembershipFee || q47.annualMembership,
        },
        page3TextFields: {
            roofAge: q16.roofAge,
            roofLayers: q16.layers,
            termiteBaitAnnualCost: q19.annualCost,
        },
        explanation: typeof flatValues.explanation === "string" ? flatValues.explanation : "",
        signatures: __assign(__assign({}, (flatValues.signatures || {})), (((_6 = allSteps["Signatures"]) === null || _6 === void 0 ? void 0 : _6.signatures) || {})),
        page1NotWorkingExplanation: ((_7 = allSteps["Appliances"]) === null || _7 === void 0 ? void 0 : _7.page1NotWorkingExplanation) ||
            flatValues.page1NotWorkingExplanation || page1Notes || "",
        page2NotWorkingExplanation: ((_8 = allSteps["Appliances Continued"]) === null || _8 === void 0 ? void 0 : _8.page2NotWorkingExplanation) ||
            flatValues.page2NotWorkingExplanation || page2Notes || "",
        additionalPages: ((_9 = allSteps["Financial"]) === null || _9 === void 0 ? void 0 : _9.additionalPages) || flatValues.additionalPages,
        initials: ((_10 = allSteps["Property"]) === null || _10 === void 0 ? void 0 : _10.initials) || flatValues.initials,
    };
}
