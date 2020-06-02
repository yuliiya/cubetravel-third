const {
  src, dest, series, watch, parallel,
} = require('gulp');

const plumber = require('gulp-plumber');
const del = require('del');
const fileInclude = require('gulp-file-include');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const mediaQueriesGroup = require('gulp-group-css-media-queries');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const svgSprite = require('gulp-svgstore');
const imagemin = require('gulp-imagemin');
const fs = require('fs');
const gulpIf = require('gulp-if');
const pngSprite = require('gulp.spritesmith');
const pngSprite3x = require('gulp.spritesmith.3x');
const stylelint = require('gulp-stylelint');
const eslint = require('gulp-eslint');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2eot = require('gulp-ttf2eot');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync').create();
const psi = require('psi');
const ngrok = require('ngrok');
const path = require('path');
const tap = require('gulp-tap');
const autoprefixer = require('autoprefixer');
const htmlreplace = require('gulp-html-replace');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const flexbugs = require('postcss-flexbugs-fixes');

let buildUrl = '';
const urls = [];

const srcRoot = './src';
const devRoot = './dev';
const buildRoot = './build';
const libraryRoot = './library';

const srcPath = {
  assets: {
    root: `${srcRoot}/assets`,
    img: {
      root: `${srcRoot}/assets/img`,
      sprite: {
        root: `${srcRoot}/assets/img/sprite`,
        svg: `${srcRoot}/assets/img/sprite/svg`,
        png: `${srcRoot}/assets/img/sprite/png`,
      },
    },
  },
  components: {
    root: `${srcRoot}/components`,
    features: `${srcRoot}/components/features`,
    shared: `${srcRoot}/components/shared`,
  },
  fonts: `${srcRoot}/fonts`,
  js: {
    root: `${srcRoot}/js`,
    vendors: `${srcRoot}/js/vendors`,
    uiKit: `${srcRoot}/js/ui-kit`,
  },
  pages: {
    root: `${srcRoot}/pages`,
    include: `${srcRoot}/pages/include`,
    library: `${srcRoot}/pages/library`,
  },
  styles: {
    root: `${srcRoot}/styles`,
    common: `${srcRoot}/styles/common`,
    dependencies: {
      root: `${srcRoot}/styles/dependencies`,
      mixins: `${srcRoot}/styles/dependencies/mixins`,
    },
    vendors: `${srcRoot}/styles/vendors`,
    uiKit: `${srcRoot}/styles/ui-kit`,
  },
};

const devPath = {
  assets: {
    root: `${devRoot}/assets`,
    img: `${devRoot}/assets/img`,
  },
  fonts: `${devRoot}/fonts`,
  js: `${devRoot}/js`,
  pages: `${devRoot}`,
  styles: `${devRoot}/styles`,
};

const buildPath = {
  assets: {
    root: `${buildRoot}/assets`,
    img: `${buildRoot}/assets/img`,
  },
  fonts: `${buildRoot}/fonts`,
  js: `${buildRoot}/js`,
  pages: `${buildRoot}`,
  styles: `${buildRoot}/styles`,
};

const libraryPath = {
  pages: `${libraryRoot}`,
  js: `${libraryRoot}/js`,
  styles: `${libraryRoot}/styles`,
};

/**
 * Servers
 * --------------------------------------------------------------------------
 */

/**
 * Browser Sync:
 * 1. Инициализация dev-сервера
 * 2. Инициализация build-сервера
 * 3. Инициализация ngrok
 * 4. Live reload
 */

function initDevServer(done) {
  browserSync.init({
    server: devRoot,
    port: 8080,
    browser: 'chrome',
  }, (err, bs) => ngrok.connect(bs.options.get('port')).then((url) => {
    console.log('Tunnel Dev:', url);
    done();
  }));
}

function initLibServer(done) {
  browserSync.init({
    server: libraryRoot,
    port: 8080,
    browser: 'chrome',
  });
  done();
}

function initBuildServer(done) {
  browserSync.init({
    server: buildRoot,
    port: 5000,
    browser: 'chrome',
  }, (err, bs) => ngrok.connect(bs.options.get('port')).then((url) => {
    console.log('Tunnel Build:', url);
    buildUrl = url;
    done();
  }));
}

function liveReload(done) {
  browserSync.reload();
  done();
}

/**
 * Cleaning
 * --------------------------------------------------------------------------
 */

/**
 * Очистка директорий:
 * 1. Очистка ./dev
 * 2. Очистка ./build
 * 3. Очистка ./library
 */

function cleanDev() {
  return del(`${devRoot}`);
}

function cleanBuild() {
  return del(`${buildRoot}`);
}

function cleanLib() {
  return del(`${libraryRoot}`);
}

/**
 * Html
 * --------------------------------------------------------------------------
 */

/**
 * Сборка html:
 * 1. Сборка всех инклудов из ./src/components/, ./src/pages/ в файлы .html
 * 2. Очистка от лишних коментариев и переводов строк
 * 3. Сохранение собраных файлов .html в ./dev/
 */

function compileHtml() {
  const buildRegEx = /(\/<\/!\/-\/-)(?!\s*build\/:|\*|\s*endbuild\s)[^>]*(\S*\/-\/-\/>)/gi;
  const emptySpacesRegEx = /$(\n)(\s|\n|\t)+^/gm;
  let svgSpriteExists;

  if (fs.existsSync(`${srcPath.assets.img.sprite.root}/sprite.svg`)) {
    svgSpriteExists = true;
  } else {
    svgSpriteExists = false;
  }

  return src(`${srcPath.pages.root}/*.html`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      context: {
        svgSpriteExists,
      },
      indent: true,
    }))
    .pipe(replace(buildRegEx, ''))
    .pipe(replace(emptySpacesRegEx, '$1'))
    .pipe(dest(`${devPath.pages}`));
}

/**
 * Сборка html для components-library:
 * 1. Сборка всех инклудов в файлы .html
 * 2. Сохранение собраных файлов .html в ./library/
 */

function compileHtmlLib() {
  return src(`${srcPath.pages.library}/*.html`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      indent: true,
    }))
    .pipe(dest(`${libraryPath.pages}`));
}

/**
 * Очистка директории ./dev/ от всех файлов .html
 */

function cleanHtml() {
  return del(`${devPath.pages}/*.html`);
}

/**
 * Отслеживание изменений html:
 * 1. Отслеживание директории ./src/pages/ на все события (add, del, change)
 * 2. Отслеживание файлов .html в ./src/components/ и ./src/pages/include/ на изменения (change)
 */

function watchHtml() {
  const tasks = series(cleanHtml, compileHtml, liveReload);

  watch(`${srcPath.pages.root}/*.html`, tasks);
  watch([
    `${srcPath.pages.include}/*.html`,
    `${srcPath.components.root}/**/*.html`,
  ], { events: 'change' }, tasks);
  watch(`${srcPath.assets.img.sprite.root}/sprite.svg`, tasks);
}

/**
 * Отслеживание изменений html для components-library:
 * 1. Отслеживание всех файлов .html на изменения (change)
 */

function watchHtmlLib() {
  watch([
    `${srcPath.pages.library}/*.html`,
    `${srcPath.components.root}/**/*.html`,
  ], { events: 'change' }, series(compileHtmlLib, liveReload));
}

/**
 * Финальная сборка html:
 * 1. Замена подключаемых файлов .css и .js на минифицированные
 * 2. Перенос файлов .html в ./build/
 */
function buildHtml() {
  return src(`${devPath.pages}/*.html`)
    .pipe(htmlreplace({
      css: 'styles/style.min.css',
      js: {
        src: null,
        tpl: '<script src="js/script.min.js" async></script>',
      },
    }))
    .pipe(dest(`${buildPath.pages}`));
}

/**
 * Style
 * --------------------------------------------------------------------------
 */

/**
 * Сборка и компиляция scss:
 * 1. Сборка файлов .scss (.css) из ./src/styles/ в style.scss
 * 2. Сборка файлов .scss (.css) из ./src/styles/vendors/ в vendors.scss
 * 3. Сборка файлов .scss (.css) из ./src/styles/ui-kit/ в ui-kit.scss
 * 4. Сборка файлов .scss из ./src/styles/components/ в components.scss
 * 5. Коплиляция .scss в .css
 * 6. Post CSS трансформация: автопрефиксер, медиа-выражения
 * 7. Сохранение файла в ./dev/styles/
 */

const stylelintOptions = {
  fix: true,
  reporters: [
    {
      formatter: 'string',
      console: true,
    },
  ],
};

function compileCssGeneral() {
  return src(`${srcPath.styles.root}/style.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(stylelint(stylelintOptions))
    .pipe(dest(`${devPath.styles}`));
}

function compileCssVendors() {
  return src(`${srcPath.styles.root}/vendors.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(dest(`${devPath.styles}`));
}

function compileCssComponents() {
  return src(`${srcPath.styles.root}/components.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(stylelint(stylelintOptions))
    .pipe(dest(`${devPath.styles}`));
}

function compileCssUiKit() {
  return src(`${srcPath.styles.root}/ui-kit.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(stylelint(stylelintOptions))
    .pipe(dest(`${devPath.styles}`));
}
/**
 * Сборка и компиляция scss для components-library:
 * 1. Сборка файлов .scss (.css) из ./src/styles/ в style.scss
 * 2. Сборка файлов .scss (.css) из ./src/styles/vendors/ в vendors.scss
 * 3. Сборка файлов .scss из ./src/styles/components/ в components.scss
 * 4. Коплиляция .scss в .css
 * 5. Post CSS трансформация: автопрефиксер, медиа-выражения
 * 6. Сохранение файла в ./library/styles/
 */

function compileCssGeneralLib() {
  return src(`${srcPath.styles.root}/style.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(dest(`${libraryPath.styles}`));
}

function compileCssVendorsLib() {
  return src(`${srcPath.styles.root}/vendors.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(dest(`${libraryPath.styles}`));
}

function compileCssComponentsLib() {
  return src(`${srcPath.styles.root}/components.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(dest(`${libraryPath.styles}`));
}

function compileCssUiKitLib() {
  return src(`${srcPath.styles.root}/ui-kit.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(mediaQueriesGroup())
    .pipe(
      postcss([
        autoprefixer(),
        flexbugs(),
      ]),
    )
    .pipe(dest(`${libraryPath.styles}`));
}

/**
 * Отслеживание изменений style
 * 1. Отслеживание всех .scss (.css) файлов в ./src/styles/** (кроме ./src/styles/vendors,
 * vendors.scss и components.scss) на изменения (change)
 * 2. Отслеживание .scss файлов в ./src/styles/vendors/ и vendors.scss на изменения (change)
 * 3. Отслеживание .scss файлов в ./src/styles/ui-kit/ и ui-kit.scss на изменения (change)
 * 4. Отслеживание .scss файлов в ./src/components/** и components.scss на изменения (change)
 */

function watchCss() {
  watch([
    `${srcPath.styles.root}/**/*.scss`,
    `!${srcPath.styles.dependencies.root}/**/*`,
    `!${srcPath.styles.vendors}/*`,
    `!${srcPath.styles.uiKit}/*`,
    `!${srcPath.styles.root}/vendors.scss`,
    `!${srcPath.styles.root}/components.scss`,
    `!${srcPath.styles.root}/ui-kit.scss`,
  ], { events: 'change' }, series(compileCssGeneral, liveReload));
  watch([
    `${srcPath.styles.vendors}/*`,
    `${srcPath.styles.root}/vendors.scss`,
  ], { events: 'change' }, series(compileCssVendors, liveReload));
  watch([
    `${srcPath.styles.root}/components.scss`,
    `${srcPath.components.root}/**/*.scss`,
  ], { events: 'change' }, series(compileCssComponents, liveReload));
  watch([
    `${srcPath.styles.uiKit}/*`,
    `${srcPath.styles.root}/ui-kit.scss`,
  ], { events: 'change' }, series(compileCssUiKit, liveReload));
  watch(`${srcPath.styles.dependencies.root}/**/*.scss`, { events: 'change' }, series(compileCssGeneral, compileCssUiKit, compileCssComponents, liveReload));
}

/**
 * Отслеживание изменений style для components-library
 * 1. Отслеживание всех .scss (.css) файлов на изменения (change)
 */

function watchCssLib() {
  watch([
    `${srcPath.styles.root}/**/*.scss`,
    `${srcPath.components.root}/**/*.scss`,
  ], { events: 'change' }, series(parallel(compileCssGeneralLib, compileCssVendorsLib, compileCssUiKitLib, compileCssComponentsLib), liveReload));
}

/**
 * Финальная сборка css:
 * 1. Сборка всех .css файлов в style.js
 * 2. Сохранение файла style.js в ./build/styles/
 * 3. Минификация и сохранение файла style.min.js в ./build/styles/
 */

function buildCss() {
  return src([
    `${devPath.styles}/style.css`,
    `${devPath.styles}/vendors.css`,
    `${devPath.styles}/ui-kit.css`,
    `${devPath.styles}/components.css`,
  ])
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(dest(`${buildPath.styles}`))
    .pipe(csso())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(`${buildPath.styles}`));
}

/**
 * JavaScript
 * --------------------------------------------------------------------------
 */

/**
 * Сборка js:
 * 1. Сборка всех файлов .js из ./src/js/vendors/ в vendors.js
 * 2. Сборка всех файлов .js из ./src/components/ в components.js
 * 3. Сборка всех файлов .js из ./src/js/ui-kit/ в ui-kit.js
 * 4. Сохранение собраных файлов .js в ./dev/js/
 * 5. Перенос common.js в ./dev/js/
 */

function compileJsVendors() {
  return src(`${srcPath.js.root}/vendors.js`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      indent: true,
    }))
    .pipe(dest(`${devPath.js}`));
}

function compileJsComponents() {
  return src(`${srcPath.js.root}/components.js`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      indent: true,
    }))
    .pipe(eslint())
    .pipe(dest(`${devPath.js}`));
}

function compileJsUiKit() {
  return src(`${srcPath.js.root}/ui-kit.js`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      indent: true,
    }))
    .pipe(eslint())
    .pipe(dest(`${devPath.js}`));
}

function compileJsCommon() {
  return src(`${srcPath.js.root}/common.js`)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(dest(`${devPath.js}`));
}

/**
 * Сборка js для components-library::
 * 1. Сборка всех файлов .js из ./src/js/vendors/ в vendors.js
 * 2. Сборка всех файлов .js из ./src/components/ в components.js
 * 3. Сборка всех файлов .js из ./src/js/ui-kit/ в ui-kit.js
 * 4. Сохранение собраных файлов .js в ./library/js/
 * 5. Перенос common.js в ./library/js/
 */

function compileJsVendorsLib() {
  return src(`${srcPath.js.root}/vendors.js`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      indent: true,
    }))
    .pipe(dest(`${libraryPath.js}`));
}

function compileJsComponentsLib() {
  return src(`${srcPath.js.root}/components.js`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      indent: true,
    }))
    .pipe(eslint())
    .pipe(dest(`${libraryPath.js}`));
}

function compileJsUiKitLib() {
  return src(`${srcPath.js.root}/ui-kit.js`)
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@',
      basepath: `${srcRoot}`,
      indent: true,
    }))
    .pipe(eslint())
    .pipe(dest(`${libraryPath.js}`));
}

function compileJsCommonLib() {
  return src(`${srcPath.js.root}/common.js`)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(dest(`${libraryPath.js}`));
}

/**
 * Отслеживание изменений js:
 * 1. Отслеживание файлов .js в ./src/js/vendors/ на изменение (change)
 * 2. Отслеживание файлов .js в ./src/components/ на изменение (change)
 * 3. Отслеживание файла common.js на изменение (change)
 */

function watchJs() {
  watch([
    `${srcPath.js.root}/vendors.js`,
    `${srcPath.js.vendors}/*.js`,
  ], { events: 'change' }, series(compileJsVendors, liveReload));
  watch([
    `${srcPath.js.root}/components.js`,
    `${srcPath.components.root}/**/*.js`,
  ], { events: 'change' }, series(compileJsComponents, liveReload));
  watch([
    `${srcPath.js.root}/ui-kit.js`,
    `${srcPath.js.uiKit}/**/*.js`,
  ], { events: 'change' }, series(compileJsUiKit, liveReload));
  watch(`${srcPath.js.root}/common.js`, { events: 'change' }, series(compileJsCommon, liveReload));
}

/**
 * Отслеживание изменений js для components-library
 * 1. Отслеживание всех .js файлов на изменения (change)
 */

function watchJsLib() {
  watch([
    `${srcPath.js.root}/**/*.js`,
    `${srcPath.components.root}/**/*.js`,
  ], { events: 'change' }, series(parallel(compileJsVendorsLib, compileJsComponentsLib, compileJsUiKitLib, compileJsCommonLib), liveReload));
}

/**
 * Финальная сборка js:
 * 1. Сборка всех .js файлов в script.js
 * 2. Сохранение файла script.js в ./build/js/
 * 3. Минификация и сохранение файла script.min.js в ./build/js/
 */

function buildJs() {
  return src([
    `${devPath.js}/vendors.js`,
    `${devPath.js}/common.js`,
    `${devPath.js}/ui-kit.js`,
    `${devPath.js}/components.js`,
  ])
    .pipe(plumber())
    .pipe(babel({
      presets: ['@babel/env'],
      plugins: [
        ["@babel/plugin-proposal-object-rest-spread", { "loose": true, "useBuiltIns": true }]
      ]
    }))
    .pipe(concat('script.js'))
    .pipe(dest(`${buildPath.js}`))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(`${buildPath.js}`));
}

/**
 * Sprites
 * --------------------------------------------------------------------------
 */

/**
 * Создание svg-спрайта
 * 1. Сбор всех файлов .svg из ./src/assets/img/sprite/svg/ в спрайт
 * 2. Оптимизация собранного svg-спрайта
 * 3. Сохранение sprite.svg в ./src/assets/img/sprite/
 */

function compileSvgSprite() {
  return src(`${srcPath.assets.img.sprite.svg}/*.svg`)
    .pipe(plumber())
    .pipe(svgSprite({ inlineSvg: true }))
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false },
        ],
      }),
    ]))
    .pipe(rename({ basename: 'sprite' }))
    .pipe(dest(`${srcPath.assets.img.sprite.root}`));
}

/**
 * Отслеживание изменений svg:
 * 1. Отслеживание файлов svg в ./src/assets/img/sprite/svg/ на все события (add, del, change)
 */

function watchSvgSprite() {
  watch(`${srcPath.assets.img.sprite.svg}/*.svg`, series(compileSvgSprite, liveReload));
}

/**
 * Создание png-спрайта
 * 1. Сбор всех файлов .png, @2x.png, @3x.png из ./src/assets/img/sprite/png/ в спрайт
 * 2. Сохранение sprite.png, sprite@2x.png, sprite@3x.png в ./src/assets/img/sprite/
 * 3. Сохранение sprite.scss в ./src/style/dependencies/mixins/
 */

function compilePngSprite() {
  const spriteCssPath = '../assets/img/sprite/sprite';
  let plugin = pngSprite;
  let spriteSrc = `${srcPath.assets.img.sprite.png}/*.png`;
  let imgs = 0;
  let imgs2x = 0;
  let imgs3x = 0;

  const options = {
    imgName: 'sprite.png',
    imgPath: `${spriteCssPath}.png`,
    cssName: '_sprites.scss',
    padding: 20,
  };
  const options2x = {
    retinaImgName: 'sprite@2x.png',
    retinaImgPath: `${spriteCssPath}@2x.png`,
    retinaSrcFilter: `${srcPath.assets.img.sprite.png}/*@2x.png`,
  };
  const options3x = {
    retina3xImgName: 'sprite@3x.png',
    retina3xImgPath: `${spriteCssPath}@3x.png`,
    retina3xSrcFilter: `${srcPath.assets.img.sprite.png}/*@3x.png`,
  };

  fs.readdirSync(`${srcPath.assets.img.sprite.png}`).forEach((file) => {
    if ((/^[^@]+\.png$/i).test(file)) {
      imgs++;
    }
    if ((/@2x\.png$/i).test(file)) {
      imgs2x++;
    }
    if ((/@3x\.png$/i).test(file)) {
      imgs3x++;
    }
  });

  if (imgs === imgs2x && imgs === imgs3x) {
    plugin = pngSprite3x;
    Object.assign(options, options2x, options3x);
  } else if (imgs === imgs2x) {
    spriteSrc = [
      `${srcPath.assets.img.sprite.png}/*.png`,
      `!${srcPath.assets.img.sprite.png}/*@3x.png`,
    ];
    Object.assign(options, options2x);
  } else {
    spriteSrc = [
      `${srcPath.assets.img.sprite.png}/*.png`,
      `!${srcPath.assets.img.sprite.png}/*@2x.png`,
      `!${srcPath.assets.img.sprite.png}/*@3x.png`,
    ];
  }

  return src(spriteSrc)
    .pipe(plumber())
    .pipe(plugin(options))
    .pipe(gulpIf('*.png', dest(`${srcPath.assets.img.sprite.root}`)))
    .pipe(gulpIf('*.scss', dest(`${srcPath.styles.dependencies.mixins}`)));
}

/**
 * Отслеживание изменений png:
 * 1. Отслеживание файлов .png в ./src/assets/img/sprite/png/ на все события (add, del, change)
 */

function watchPngSprite() {
  watch(`${srcPath.assets.img.sprite.png}`, series(compilePngSprite, liveReload));
}

/**
 * Asset
 * --------------------------------------------------------------------------
 */

/**
 * Экспорт файлов:
 * 1. Перенос всех файлов из ./src/assets/
 * (кроме ./src/assets/sprite.png и ./src/assets/sprite.svg) в ./dev/assets/
 */

function exportAssetsDev() {
  return src([
    `${srcPath.assets.root}/**/*.*`,
    `!${srcPath.assets.img.sprite.png}`,
    `!${srcPath.assets.img.sprite.png}/**/*`,
    `!${srcPath.assets.img.sprite.svg}`,
    `!${srcPath.assets.img.sprite.svg}/**/*`,
  ])
    .pipe(dest(`${devPath.assets.root}`));
}

/**
 * Очистка директории ./dev/assets/ от всех файлов
 */

function cleanAsset() {
  return del(`${devPath.assets.root}`);
}

/**
 * Отслеживание изменений assets:
 * 1. Отслеживание всех файлов из ./src/assets/
 * (кроме ./src/assets/sprite.png и ./src/assets/sprite.svg) на все события (add, del, change)
 */

function watchAssets() {
  watch([
    `${srcPath.assets.root}/**/*.*`,
    `!${srcPath.assets.img.sprite.png}`,
    `!${srcPath.assets.img.sprite.png}/**/*`,
    `!${srcPath.assets.img.sprite.svg}`,
    `!${srcPath.assets.img.sprite.svg}/**/*`,
  ], series(cleanAsset, exportAssetsDev, liveReload));
}

/**
 * Fonts
 * --------------------------------------------------------------------------
 */

/**
 * Генерация веб-шрифтов:
 * 1. Из файлов .ttf в ./src/fonts/ генерируются файлы .woff, .woff2, .eot
 * 2. Сохранение сгенерированных шрифтов в ./dev/fonts/
 */

function convertTTFToWOFF() {
  return src([`${srcPath.fonts}/*.ttf`])
    .pipe(ttf2woff())
    .pipe(dest([`${devPath.fonts}`]));
}

function convertTTFToWOFF2() {
  return src([`${srcPath.fonts}/*.ttf`])
    .pipe(ttf2woff2())
    .pipe(dest([`${devPath.fonts}`]));
}

function convertTTFToEOT() {
  return src([`${srcPath.fonts}/*.ttf`])
    .pipe(ttf2eot())
    .pipe(dest([`${devPath.fonts}`]));
}

/**
 * Очистка директории ./dev/fonts/ от всех файлов
 */

function cleanFonts() {
  return del(`${devPath.fonts}`);
}

/**
 * Отслеживание изменений fonts:
 * 1. Отслеживание файлов .ttf в ./src/fonts/ на все события (add, del, change)
 */

function watchFonts() {
  watch(`${srcPath.fonts}/*.ttf`, series(fontGeneration, liveReload));
}

const fontGeneration = series(
  cleanFonts,
  parallel(convertTTFToWOFF, convertTTFToWOFF2, convertTTFToEOT),
);

/**
 * Финальная сборка fonts:
 * 1. Перенос всех .woff, .woff2, .eot  ./build/fonts/
 */

function buildFonts() {
  return src(`${devPath.fonts}/*.*`)
    .pipe(dest(`${buildPath.fonts}`));
}

/**
 * Optimization reports
 * --------------------------------------------------------------------------
 */

/**
 * Psi:
 * 1. Получение всех url html-страниц в ./build/
 * 2. Вывод десктопного отчета
 * 3. Вывод мобильного отчета
 */

function getAllBuildUrls() {
  return src(`${buildRoot}/*.html`)
    .pipe(
      tap((file) => {
        const filename = path.basename(file.path);
        const url = `${buildUrl}/${filename}`;

        urls.push(url);
      }),
    );
}

function getPsiDesktopReport(done) {
  logPsiReport('DESKTOP PSI REPORT', 'desktop', done);
}

function getPsiMobileReport(done) {
  logPsiReport('MOBILE PSI REPORT', 'mobile', done);
}

function logPsiReport(title, strategy, done) {
  console.log('--------------------------------------');
  console.log(title);
  console.log('--------------------------------------');
  urls.forEach((url, index) => {
    psi(url, {
      nokey: 'true',
      strategy,
    }).then((data) => {
      console.log(url);
      console.log('Speed score:', data.ruleGroups.SPEED.score);
      if (strategy === 'mobile') {
        console.log('Usability score:', data.ruleGroups.USABILITY.score);
      }
      console.log('---');

      setTimeout(() => {
        if (index === (urls.length - 1)) {
          done();
        }
      }, 1000);
    });
  });
}

const getPsiReport = series(getAllBuildUrls, getPsiDesktopReport, getPsiMobileReport);

/**
 * Final (build)
 * --------------------------------------------------------------------------
 */

/**
 * Перенос и оптимизация изображений
 * 1. Сбор всех файлов .png, .jpg, .svg из ./dev/assets/img/
 * 2. Оптимизация изображений
 * 3. Сохранение в ./build/assets/img/
 */

function exportImgBuild() {
  return src([
    `${devPath.assets.img}/**/*.{png,jpg,svg}`,
  ])
    .pipe(plumber())
    .pipe(imagemin([
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false },
        ],
      }),
    ]))
    .pipe(dest(`${buildPath.assets.img}`));
}

/**
 * Перенос файлов
 * Экспорт всех файлов из ./dev/assets/ (кроме ./dev/assets/img) в ./build/assets/
 */

function exportFilesBuild() {
  return src([
    `${devPath.assets.root}/**/*`,
    `!${devPath.assets.img}`,
    `!${devPath.assets.img}/**/*`,
  ])
    .pipe(dest(`${buildPath.assets.root}`));
}


const buildAssets = series(exportImgBuild, exportFilesBuild);

/**
 * Exports
 * --------------------------------------------------------------------------
 */

// список задач и вотчеров для создания dev-версии
exports.serve = series(
  // очистка
  cleanDev,
  // общие задачи
  fontGeneration,
  // спрайты
  compileSvgSprite,
  compilePngSprite,
  // html
  compileHtml,
  // css
  compileCssGeneral,
  compileCssVendors,
  compileCssUiKit,
  compileCssComponents,
  // js
  compileJsCommon,
  compileJsVendors,
  compileJsUiKit,
  compileJsComponents,
  // export
  exportAssetsDev,
  // инициализация dev-сервера
  initDevServer,

  // колбек с вотчерами
  (done) => {
    watchHtml();
    watchCss();
    watchJs();
    watchSvgSprite();
    watchPngSprite();
    watchAssets();
    watchFonts();

    done();
  },
);

// список задач и вотчеров для создания components-library
exports.lib = series(
  // очистка
  cleanLib,
  // html
  compileHtmlLib,
  // css
  compileCssGeneralLib,
  compileCssVendorsLib,
  compileCssUiKitLib,
  compileCssComponentsLib,
  // js
  compileJsCommonLib,
  compileJsVendorsLib,
  compileJsComponentsLib,
  compileJsUiKitLib,
  // инициализация lib-сервера
  initLibServer,

  // колбек с вотчерами
  (done) => {
    watchHtmlLib();
    watchCssLib();
    watchJsLib();

    done();
  },
);

// список задач для создания build-версии
exports.build = series(
  // очистка
  cleanBuild,
  // сборка
  buildHtml,
  buildCss,
  buildJs,
  buildFonts,
  buildAssets,
  // инициализация build-сервера
  initBuildServer,
  // Psi отчет
  getPsiReport,
);
