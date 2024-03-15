const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const sass = require('gulp-sass')(require('sass'))
const fs = require('fs').promises
const util = require('util')
const webpack = util.promisify(require('webpack'))
const merge = require('merge-stream')
const { ActionRegistry } = require('trivial-core')
const actionRegistry = new ActionRegistry()

let staticFolders = [
  {
    from: 'assets/images/**/*',
    to: 'assets/images'
  },
  {
    from: 'assets/fonts/**/*',
    to: 'assets/fonts'
  },  {
    from: 'components/**/*.js',
    to: 'components'
  },
  {
    from: 'lib/**/*.js',
    to: 'components/lib'
  },
  {
    from: 'views/**/*.html',
    to: 'views'
  }
]

let sassFolders = [
  {
    from: 'assets/stylesheets/**/*.scss',
    to: 'assets/stylesheets'
  },
  {
    from: 'views/**/*.scss',
    to: 'views'
  }
]

function staticFiles(){
  var tasks = staticFolders.map(function(element){
    return gulp.src(`source/${element.from}`)
    .pipe(gulp.dest(`public/${element.to}`))
  })

  return merge(tasks)
}

function sassFiles(){
  var tasks = sassFolders.map(function(element){
    return gulp.src(`source/${element.from}`)
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest(`public/${element.to}`))
  })

  return merge(tasks)
}

function actionFiles(){
  return gulp.src(`source/actions/**`)
    .pipe(gulp.dest(`${actionRegistry.actionsRoot}/actionsv2/actions`))
}

async function buildActions() {
  return actionRegistry.build()
}

gulp.task('pack', async () => {

  let stats = await webpack(require('./webpack.config.js'))
  if (stats.hasErrors())
    throw new Error(stats.compilation.errors.join('\n'))
})

gulp.task('build', gulp.series(staticFiles, sassFiles, actionFiles, buildActions, 'pack'))


gulp.task('start', gulp.series('build', (done) => {
  nodemon({
    script: 'serve.js',
    ext: 'js html scss vue',
    ignore: ['public','slugs', 'tmp', 'test'],
    tasks: ['build'],
    delay: '300',
  // , env: { 'NODE_ENV': 'development' }
    done: done
  })
}))


gulp.task('clean', async () => {
  try {
    await fs.rmdir(__dirname + '/public/assets/js', {recursive: true})
    await fs.rmdir(__dirname + '/public/assets/stylesheets', {recursive: true})
    await fs.rmdir(__dirname + '/public/components', {recursive: true})
    await fs.rmdir(__dirname + '/public/packs', {recursive: true})
    await fs.rmdir(__dirname + '/public/views', {recursive: true})
  } catch(e) {
    console.log(e)
  }
})

gulp.task('default', gulp.series('start'))
