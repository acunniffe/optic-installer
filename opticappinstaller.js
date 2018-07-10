const config = require('./config.json')
const request = require('request');
const progress = require('request-progress');
const colors = require('colors');
const ProgressBar = require('cli-progress-bar')
const dmg = require('dmg');
const fs = require('fs-extra')
const exec = require('sync-exec');

const destination = '/tmp/Optic.zip'
const homedir = require('os').homedir();

function download(downloadedCallback) {

    console.log('Starting App Install\n'.bold)
    const bar = new ProgressBar()
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
    try {
        exec('rm -rf /Applications/Optic.app && unzip /tmp/Optic.zip -d /Applications/  && rm -rf /Applications/__MACOSX')
        console.log('Success: '.bold+'Optic.app installed in /Applications')
         exec('cd ~/Downloads && rm -rf optic-demo-project && git clone https://github.com/opticdev/optic-demo-project')
        console.log('Success: '.bold+'Demo project downloaded to ~/Downloads/optic-demo-project')
    }
    catch (e) {
        console.error("Failed to install " + e)
    } finally {
        callback()
    }
}

module.exports.install = function (complete = ()=> console.log('done')) {
    download((downloaded)=> mountAndMoveToApplications(downloaded, complete))
}

module.exports.testMount = function (zipTest) {
    mountAndMoveToApplications(zipTest, ()=> console.log('done'))
}