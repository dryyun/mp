const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();

gulp.task('browser-sync', ['nodemon'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        port: 5000,
        notify: true
    });
});

gulp.task('default', ['browser-sync'], function () {
    gulp.watch('./views/*.html', browserSync.reload);
    gulp.watch('./public/**/*.js', browserSync.reload);
    gulp.watch('./public/**/*.css', browserSync.reload);
    gulp.watch(['**/*.js', '!node_modules/**/*.js'], ['bs-delay']);
});

gulp.task('bs-delay', function () {
    setTimeout(function () {
        browserSync.reload();
    }, 300);
});

gulp.task('nodemon', function (cb) {
    var started = false;
    return nodemon({
        script: 'index.js',
        ext: 'js html',
        ignore: [
            'gulpfile.js',
            'node_modules/',
            'sessions/',
        ],
        env: {
            'NODE_ENV': 'development',
        }
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    }).on('crash', function () {
        console.log('nodemon.crash');
    }).on('restart', function () {
        console.log('nodemon.restart');
    }).once('quit', function () {
        console.log('nodemon.quit');
        process.exit();
    });
});