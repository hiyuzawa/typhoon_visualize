var gulp = require('gulp');
var browserify = require('browserify')
var webserver = require('gulp-webserver');
var source = require('vinyl-source-stream');
var babelify = require('babelify');

gulp.task('browserify', function() {
    browserify('./js/index.js', {debug: true})
        .transform(babelify, {presets: ["es2015"]})
        .bundle()
        .on("error", function(e){
            console.log(e.message);
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./'))
});

gulp.task('watch', function(){
    gulp.watch('./js/*.js', ['browserify'])
});

gulp.task('webserver', function(){
    gulp.src('./')
        .pipe(webserver({
                host: '127.0.0.1',
                livereload: true
        }));
});

gulp.task('default', ['browserify', 'watch', 'webserver']);