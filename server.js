var browserSync = require("browser-sync").create();

browserSync.init({
	ui: false,
	//port: 3000,
	port: 4040,
	server: "./",
	cors: true,
	open: false,
	localOnly: true,
});