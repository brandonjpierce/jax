var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('build', function() {
  gulp
    .src('./lib/jax.js')
    .pipe(uglify())
    .pipe(rename('jax.min.js'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['build']);
