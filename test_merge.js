const obj1 = { appliances: ["A", "B", "C"], name: "Test" };
const obj2 = { appliances: [], name: undefined };

const merged = { ...obj1, ...obj2 };

console.log("Merged:", merged);

const obj3 = { questions: { "7": "YES", "8": "NO" } };
const obj4 = { questions: {} };

const merged2 = { ...obj3, ...obj4 };
console.log("Merged2:", merged2);
