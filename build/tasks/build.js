/**
 * build
 * copy src files to output path
 */

const Gulp = require('gulp');
const Path = require('path');
const Merge = require('merge2');
const Ts = require('gulp-typescript');

Gulp.task('build', async function () {
  const env = require('../env')();

  // build esm
  const TsProject = Ts.createProject(Path.join(env.rootPath, 'tsconfig.json'), {
    declaration: true
  });
  const tsResult = await Gulp.src(
    [
      Path.join(env.srcPath, '**/*.ts'),
      '!' + Path.join(env.srcPath, 'types.ts'),
      '!' + Path.join(env.srcPath, '**/*.d.ts'),
      '!' + Path.join(env.srcPath, '**/*.spec.ts')
    ],
    {
      allowEmpty: true
    }
  ).pipe(TsProject());
  Merge([tsResult.dts.pipe(Gulp.dest(env.outputPath)), tsResult.js.pipe(Gulp.dest(env.outputPath))]);

  // copy other files to output
  await Gulp.src([Path.join(env.srcPath, '**/*'), '!' + Path.join(env.srcPath, '**/*.ts')], {
    base: env.srcPath
  }).pipe(Gulp.dest(env.outputPath));

  // copy type.ts
  await Gulp.src([Path.join(env.srcPath, 'types.ts')], {
    allowEmpty: true,
    base: env.srcPath
  }).pipe(Gulp.dest(env.outputPath));

  // copy npm publish files to output
  await Gulp.src(['package.json', 'README.md'].map((x) => Path.join(env.rootPath, x))).pipe(Gulp.dest(env.outputPath));
});
