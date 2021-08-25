/**
 * build commonjs
 */

const path = require('path');
const gulp = require('gulp');
const merge = require('merge2');
const ts = require('gulp-typescript');

gulp.task('build-cjs', async function () {
  const { OUTPUT_PATH, ROOT_PATH, SRC_PATH } = require('../constants');

  const outputPath = path.join(OUTPUT_PATH, 'commonjs');

  // Build command.js
  const TsProjectCMD = ts.createProject(path.join(ROOT_PATH, 'tsconfig.json'), {
    declaration: false,
    module: 'commonjs'
  });

  const tsResultCMD = await gulp
    .src([path.resolve(SRC_PATH, '**/*.ts'), '!' + path.resolve(SRC_PATH, '**/*.d.ts'), '!' + path.resolve(SRC_PATH, '**/*.test.ts')])
    .pipe(TsProjectCMD());

  merge([tsResultCMD.js.pipe(gulp.dest(outputPath))]);

  // Copy other files to output
  await new Promise((resolve) => {
    gulp
      .src([path.join(SRC_PATH, '**/*'), '!' + path.join(SRC_PATH, '**/*.ts')], {
        base: SRC_PATH
      })
      .pipe(gulp.dest(outputPath))
      .on('end', resolve);
  });
});
