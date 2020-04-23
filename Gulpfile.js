'use strict';

const { src, dest, watch, series, parallel } = require('gulp');
const data = require('gulp-data');
const rimraf = require('gulp-rimraf');
const nunjucksRender = require('gulp-nunjucks-render');
const autoprefixer = require('gulp-autoprefixer');
const sassdoc = require('sassdoc');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;
const replace = require('gulp-replace');
const fs = require('fs');

const json = JSON.parse(fs.readFileSync('./package.json'));

sass.compiler = require('node-sass');

const path = {
  input: 'app/',
  output: 'docs/',
  scripts: {
    input: 'app/scripts/*.js',
    output: 'docs/js'
  },
  styles: {
    main: 'app/scss/main.scss',
    input: 'app/scss/*.scss',
    output: 'docs/css',
    docs: 'docs/sassdoc'
  },
  nunjucks: {
    pages: 'app/pages/**/*.+(html|njk|nunjucks)',
    templates: 'app/templates/**/*.+(html|njk|nunjucks)',
    data: './app/data.json'
  },
  images: {
    input: 'app/images/**/*',
    output: 'docs/img'
  },
  static: {
    css: 'app/css/*.css',
    other: 'app/static/*'
  }
};

let build = 'local';
// Function that is ran when buildAll is called to determine buildEnv
// This matches the buildDirs in package.json
switch (process.env.npm_config_build) {
  case 'staging':
    build = 'staging';
    break;
  case 'live':
    build = 'live';
    break;
  case 'githubpages':
    build = 'githubpages';
    break;
  default:
    build = 'local';
    break;
}

const sassOptions = {
  outputStyle: 'expanded'
};
const sassdocOptions = {
  dest: path.styles.docs
};

function sassTask() {
  return src(path.styles.main)
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ compatibility: '*' }))
    .pipe(sourcemaps.write())
    .pipe(dest(path.styles.output))
    .pipe(browserSync.stream());
}

function sassDocTask() {
  return src(path.styles.input).pipe(sassdoc(sassdocOptions)).resume();
}

function scriptTask() {
  return src([
    'app/scripts/plugins.js',
    'app/scripts/main.js'
  ])
    .pipe(concat({
      path: 'main.js'
    }))
    .pipe(uglify())
    .pipe(dest(path.scripts.output))
    .pipe(browserSync.stream());
}

function nunjucksTask() {
  return src(path.nunjucks.pages)
    .pipe(data(function () {
      return require(path.nunjucks.data)
    }))
    .pipe(nunjucksRender({
      path: ['app/templates']
    }))
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(replace('$*cdn', json.buildDirs[build].cdn))
    .pipe(dest(path.output))
    .pipe(browserSync.stream());
}

function imagesMinTask() {
  return src(path.images.input)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    }))
    .pipe(dest(path.images.output));
}

function cleanTask() {
  return src(path.output, {
    read: false,
    allowEmpty: true
  }).pipe(rimraf());
}

function copyStaticTask() {
  return src(path.static.other).pipe(dest(path.output));
}

function copyCssTask() {
  return src(path.static.css)
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ compatibility: '*' }))
    .pipe(sourcemaps.write())
    .pipe(dest(path.styles.output));
}

function watchTask() {
  watch(path.styles.input, sassTask);
  watch([path.scripts.input], scriptTask);
  watch([path.nunjucks.pages, path.nunjucks.templates], nunjucksTask);
  watch(path.images.input, imagesMinTask).on('change', browserSync.reload);
}

function browserSyncTask() {
  browserSync.init({
    server: {
      baseDir: path.output
    }
  });
}

// Used to build everything out for use on staging/live
const buildAll = series(
  nunjucksTask,
  sassTask,
  copyStaticTask,
  copyCssTask,
  scriptTask,
  imagesMinTask
);

exports.clean = cleanTask;
exports.sass = sassTask;
exports.sassdoc = sassDocTask;
exports.nunjucks = nunjucksTask;
exports.scripts = scriptTask;
exports.imagesmin = imagesMinTask;
exports.copystatic = series(copyStaticTask, copyCssTask);
exports.build = series(nunjucksTask, sassTask, copyStaticTask, copyCssTask, scriptTask, imagesMinTask);
exports.default = series(cleanTask, nunjucksTask, sassTask, sassDocTask, copyStaticTask, copyCssTask, scriptTask, imagesMinTask);
exports.serve = parallel(browserSyncTask, watchTask);
exports.buildAll = buildAll;
