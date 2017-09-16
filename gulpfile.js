require('dotenv').config();

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var envify = require('envify/custom');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var cachebust = require('gulp-cache-bust');
var clean = require('gulp-clean');
var runsequence = require('run-sequence');

var config = {
  routes: {
    scss_source: './public/style/**/*.scss',
    css_dest: './public/build/',
    react_source: './public/app/app.js',
    js_dest: './public/build/',
    index: './public/index.html',
    dist: './dist',
    base: './public'
  },
  name: 'tag replacer'
}

// handle errors
function handle_error(error) {
  gutil.log(gutil.colors.red(error));
  gutil.beep();
}

// js bundler
function run_bundler(watch,callback) {
  function bundle(bundler) {
    bundler.bundle()
    .on('error', handle_error)
    .pipe(source(config.routes.react_source))
    .pipe(buffer())
    .pipe(rename('app.js'))
    .pipe(gulp.dest(config.routes.js_dest))
    .on('end', function() {
      gutil.log(gutil.colors.yellow('[js]'),gutil.colors.green('successfully compiled /app > /build/app.js'));
      if (!watch) {
        callback();
      }
    });
  }

  var bundler = browserify(config.routes.react_source, {debug: true, cache: {}, packageCache: {}})
  .plugin(watchify, {ignoreWatch: ['**/node_modules/**']})
  .transform(babelify, {presets: ['es2015', 'react']})
  .transform(envify({
    NODE_ENV: process.env.NODE_ENV,
    TESTING_BLOG: process.env.TESTING_BLOG
  }));

  // run
  bundle(bundler);

  // watch
  if (watch) {
    bundler.on('update',function(){
      bundle(bundler);
    });
  }
}

// transform scss and autoprefix
gulp.task('css',function(){
  return gulp.src(config.routes.scss_source)
  .pipe(sass({
    errLogToConsole:true
  }).on('error', sass.logError))
  .pipe(autoprefixer())
  .pipe(gulp.dest(config.routes.css_dest))
  .on('end', function() {
    gutil.log(gutil.colors.yellow('[css]'),gutil.colors.green('successfully compiled /style > /build/style.css'));
  });
});

// watch for css changes
gulp.task('css:watch',function(){
  gulp.watch(config.routes.scss_source,['css']);
});

// bundle and watchify js
gulp.task('js:watch',function(){
  return run_bundler(true);
});

// just bundle js
gulp.task('js:build',function(callback){
  return run_bundler(false,callback);
});

// min/uglify js
gulp.task('js:min',function(){
  return gulp.src(config.routes.js_dest + 'app.js')
  .pipe(uglify())
  .pipe(gulp.dest(config.routes.js_dest));
});

// cache bust
gulp.task('dist:cachebust',function(){
  return gulp.src(config.routes.index,{
    base: './public/'
  })
  .pipe(cachebust({
    type:'timestamp'
  }))
  .pipe(gulp.dest(config.routes.dist));
});

// copy for dist
gulp.task('dist:copy',function(){
  return gulp.src([
    './public/build/*',
    './public/assets/*'
  ],{
    base: './public/'
  })
  .pipe(gulp.dest(config.routes.dist));
});

// clean up the public/build folder
gulp.task('clean',function(){
  return gulp.src(config.routes.js_dest,{read: false}).pipe(clean());
});

gulp.task('exit',function(){
  process.exit(0);
});

// run dev server
gulp.task('server',function(callback){
  return nodemon({
    script: 'index.js',
    watch: ['index.js', './src'],
    env: process.env,
    stdout: true
  }).on('start',function(){
    gutil.log(gutil.colors.yellow('[server]'),gutil.colors.green('tag replacer server running on port ' + process.env.PORT));
  });
});

// main tasks
gutil.log(gutil.colors.yellow('[' + config.name + ']'),gutil.colors.green('reticulating splines...'));

gulp.task('watch', function(callback) {
  process.env.NODE_ENV = 'development';
  runsequence('clean',['js:watch','css','css:watch','server'],callback);
});
gulp.task('build', function(callback) {
  process.env.NODE_ENV = 'production';
  runsequence('clean',['js:build','css'],'js:min',['dist:cachebust','dist:copy'],'exit',callback);
});
