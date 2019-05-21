const gulp = require('gulp');

const settings = {
	copy : {
		files: ['src/**/*.html']
	},
	watch: {
		files: ['src/**/*.html']
	},
	base: './'
};

gulp.task('copy', function () {
	return gulp.src(settings.copy.files)
		.pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
	return gulp.watch(settings.watch.files, function(obj){
		if( obj.type === 'changed') {
			gulp.src(obj.path)
				.pipe(gulp.dest('build'));
		}
	});
});
