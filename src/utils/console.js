const ENABLE_LOGGING = !(process.argv.includes("--no-log") || process.env.NO_LOG === "true");

const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
	if (ENABLE_LOGGING) {
		originalLog.apply(console, args);
	};
};

console.error = function(...args) {
	if (ENABLE_LOGGING) {
		originalError.apply(console, args);
	};
};

console.info = function(...args) {
	originalLog.apply(console, args);
};