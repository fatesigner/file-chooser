/**
 * build esm module
 */

const path = require('path');
const gulp = require('gulp');
const merge = require('merge2');
const ts = require('gulp-typescript');

gulp.task('build-esm', async function () {
  const { OUTPUT_PATH, ROOT_PATH, SRC_PATH } = require('../constants');

  const outputPath = path.join(OUTPUT_PATH, 'esm');

  // Build esm module
  const TsProject = ts.createProject(path.join(ROOT_PATH, 'tsconfig.json'), {
    declaration: true
  });
  const tsResult = gulp
    .src(
      [
        path.join(SRC_PATH, '**/*.ts'),
        '!' + path.join(SRC_PATH, '**/types.ts'),
        '!' + path.join(SRC_PATH, '**/*.d.ts'),
        '!' + path.join(SRC_PATH, '**/*.test.ts')
      ],
      {
        allowEmpty: true
      }
    )
    .pipe(TsProject());
  merge([tsResult.dts.pipe(gulp.dest(outputPath)), tsResult.js.pipe(gulp.dest(outputPath))]);

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
