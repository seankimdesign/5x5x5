var gulp = require('gulp')
var dust = require('gulp-dust')
var sass = require('gulp-sass')
var concat = require('gulp-concat')
var nodemon = require('gulp-nodemon')
var path = require('path')

var paths = {
    dust: ["templates/*.dust", "!templates/*.backup.dust"],
    sass: ["templates/sass/*.scss", "!templates/sass/*.backup.scss", "!templates/sass/critical-*.scss"],
    criticalSass: ["templates/sass/critical-*.scss"]
}


gulp.task('dust', function(){
    return gulp.src(paths.dust)
        .pipe(dust())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('public/template'))
})

gulp.task('sass', function(){
    return gulp.src(paths.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('public/style'));
})

gulp.task('criticalSass', function(){
    return gulp.src(paths.criticalSass)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/style'));
})

gulp.task('watchall', function(){
    nodemon({
        script: 'server.js',
        ext: 'js dust scss',
        tasks: function (changedFiles){
            var tasks = []
            changedFiles.forEach(function (file) {
                if (path.extname(file) == '.dust' && !~tasks.indexOf('dust')) tasks.push('dust')
                if (~path.basename(file).indexOf('.scss')){
                    if (!~path.basename(file).indexOf('critical-') && !~tasks.indexOf('criticalSass')){
                        tasks.push('criticalSass')
                    } else if (!~tasks.indexOf('scss')){
                        tasks.push('sass')
                    }
                }
            })
            return tasks
        }
    }).on('restart', function(){
        console.log('Gulp initiated restart')
    })
})

gulp.task('default', ['dust', 'sass', 'criticalSass', 'watchall'])