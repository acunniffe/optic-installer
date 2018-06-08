const config = require('./config.json')
const request = require('request');
const progress = require('request-progress');
const colors = require('colors');
const ProgressBar = require('cli-progress-bar')
const dmg = require('dmg');
const fs = require('fs-extra')


const destination = '/tmp/Optic.dmg'
const homedir = require('os').homedir();

function download(downloadedCallback) {

    console.log('Starting App Install\n'.bold)
    const bar = new ProgressBar()
    // The options argument is optional so you can omit it
    progress(request(config.app.url), {
        throttle: 500,
    })
    .on('progress', function (state) {
        bar.show("Downloading App " + (state.percent*100).toFixed(1)+"% of "+(state.size.total/(1024*1024)).toFixed(0)+'MB', state.percent)
    })
    .on('error', function (err) {
        console.log('Unable to download file. Check connection'.red)
        bar.hide()
    })
    .on('end', function () {
        bar.hide()
        if (downloadedCallback) {
            downloadedCallback(destination)
        }
    })
    .pipe(fs.createWriteStream(destination));
}


function mountAndMoveToApplications(downloaded, callback) {
    console.log('Installing Optic...'.yellow)
    dmg.mount(downloaded, function(err, path) {
        const app = path+'/Optic.app'
        fs.copySync(app, '/Applications/Optic.app', { overwrite: true })
        const demoProject = path+'/optic-demo-project'
        fs.copySync(demoProject, homedir+'/Downloads/optic-demo-project', { overwrite: true })

        console.log('Success: '.bold+'Optic.app installed in /Applications')
        console.log('Success: '.bold+'Demo project downloaded to ~/Downloads/optic-demo-project')

        callback()

        dmg.unmount(path, function(err) {});

    });
}

module.exports.install = function (complete) {
    download((downloaded)=> mountAndMoveToApplications(downloaded, complete))
}