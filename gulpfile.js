var gulp = require("gulp"),
    foreach = require("gulp-foreach"),
    directiveReplace = require("gulp-directive-replace"),
    jshint = require("gulp-jshint"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    sass = require("gulp-ruby-sass"),
    bourbon = require("bourbon").includePaths,
    postcss = require("gulp-postcss"),
    cssNext = require("postcss-cssnext")(),
    maps = require("gulp-sourcemaps"),
    pdfjs = require("pdfjs-dist"),
    project = "base-landing",
    directories = {
      publicFiles: "public",
      assets: "assets",
      js: { 
        root: "scripts",
        directives: "dist",
      },
      sass: "sass",
      min: "dist"
    },
    src = {
      js: [directories.assets + "/" + directories.js.root + "/*.js", 
           directories.assets + "/" + directories.js.root + "/*.app.js", 
           directories.assets + "/" + directories.js.root + "/*.config.js", 
           directories.assets + "/" + directories.js.root + "/*.factory.js", 
           directories.assets + "/" + directories.js.root + "/*.provider.js", 
           directories.assets + "/" + directories.js.root + "/*.service.js", 
           directories.assets + "/" + directories.js.root + "/*.filter.js",
           directories.assets + "/" + directories.js.root + "/" + directories.js.directives + "/*"
           ],
      directives: { 
          js: directories.assets + "/" + directories.js.root + "/*.directive.js",
          html: directories.assets + "/" + directories.js.root + "/*.template.html",
      },
      sass: directories.assets + "/" + directories.sass + "/*.s*ss",
      css: directories.assets + "/" + directories.min  + "/*.css",
    };

gulp.task("default", ["compressSass", "validateCss", "replaceDirectives", "compressJs", "copyAssets", "watch"]);
gulp.task("watch", watchFiles);

gulp.task("replaceDirectives", replaceDirectives);
gulp.task("compressJs", compressJs);
gulp.task("compressSass", compressSass);
gulp.task("validateCss", ["compressSass"], validateCss);
gulp.task("copyAssets", ["compressJs", "compressSass"], copyAssets);


function compressJs(){
  gulp.src(src.js)
  .pipe(jshint())
  .pipe(jshint.reporter("default"))
  .pipe(concat(project + ".min.js"))
  .pipe(uglify())
  .pipe(gulp.dest(directories.assets + "/" + directories.min));
}

function compressSass(){
  return sass(src.sass, {
    //style: "compressed",
    style: "expanded",
    sourcemap: true,
    loadPath: bourbon })
    .pipe(rename({
      basename : project,
      extname : ".min.css"
    }))
    .pipe(maps.write("./"))
    .pipe(gulp.dest(directories.assets + "/" + directories.min));
}

function copyAssets() {
  return gulp.src(directories.assets + "/" + directories.min + "/*")
  .pipe(gulp.dest(directories.publicFiles + "/" + directories.assets + "/"));
}

function replaceDirectives(){
  return gulp.src(src.directives.js)
    .pipe(foreach(function(stream, file){
        return stream
          .pipe(directiveReplace({root: "./" + directories.assets + "/" + directories.js.root}))
          .pipe(rename(function (path) {
              path.basename += ".compressed";
          }))
      }))
    .pipe(maps.write("./" + directories.assets + "/" + directories.js.root + "/" + directories.js.directives))
    .pipe(gulp.dest("./" + directories.assets + "/" + directories.js.root + "/" + directories.js.directives));
}

function validateCss(){
  var processors = [cssNext];
      
  return gulp.src(src.css)
    .pipe(postcss(processors))
    .pipe(gulp.dest(directories.assets + "/" + directories.min));
}

function watchFiles(){
  gulp.watch(src.sass, ["validateCss", "copyAssets"]);
  gulp.watch([src.directives.js, src.directives.html], ["replaceDirectives"]);
  gulp.watch(src.js, ["compressJs", "copyAssets"]);
}