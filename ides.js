const appPath = require('app-path');
const exec = require('sync-exec');
const colors = require('colors')
const request = require('request');
const fs = require('fs-extra')
const unzipper = require('unzipper');

const installed = {}

function checkFor(bundleId, name) {
    return appPath(bundleId).then(path => {
        installed[name] = path
    }).catch(e => {
        1+1
    })
}

const vscheck = checkFor('com.microsoft.VSCode', 'VSCode');
const atomcheck = checkFor('com.github.atom', 'Atom');
const intellejcecheck = checkFor('com.jetbrains.intellij.ce', 'IntelliJ CE');
const intellejultimatecheck = checkFor('com.jetbrains.intellij.ultimate', 'IntelliJ Ultimate');
const webstormcheck = checkFor('com.jetbrains.WebStorm', 'WebStorm');

module.exports.getInstalledIDEs = function(callback) {
    Promise.all([vscheck, atomcheck, intellejcecheck, intellejultimatecheck, webstormcheck]).then(function(values) {
        callback(installed)
    }).catch(e=> console.log(e));
}

module.exports.installIDEPlugins = function(installedIDEs, allDone) {

    console.log('\n\nInstalling IDE Plugins'.bold)

    if (installedIDEs.Atom) {
        console.log('\nInstalling Atom Plugin...'.yellow);
        const result = exec('apm install optic')
        if (result.status === 0) {
            console.log('Success: '.bold+'Atom Plugin Installed'.green)
        } else {
            console.log("Unable to install Atom Plugin. 'apm' failed. Try running 'apm install optic' manually".red)
        }
    
    }

    if (installedIDEs.VSCode) {
        console.log('\nInstalling VSCode Plugin...'.yellow);
        const codeBinCommand = installedIDEs.VSCode.replace(/(\s+)/g, '\\$1')+'/Contents/Resources/app/bin/code --install-extension useoptic.optic'
        const result = exec(codeBinCommand)
        if (result.status === 0) {
            console.log('Success: '.bold+'VSCode Plugin Installed'.green)
        } else {
            console.log("Unable to install VSCode Plugin. Try running 'code --install-extension useoptic.optic' manually".red)
        }
    
    }

    let jetbrains = 'https://plugins.jetbrains.com/plugin/download?rel=true&updateId=46598'
    
    function downloadJetBrains(afterDownload) {
        const destination = '/tmp/jetbrains-optic.zip'
        request(jetbrains)
        .on('end', (a)=> {
            afterDownload(destination)
        })
        .pipe(fs.createWriteStream(destination))
    }

    function installJetBrainsIfPresent(name, zippedPlugin) {
        const pluginsEnd = '/Contents/plugins'

            if (installedIDEs[name]) {
                console.log(('\nInstalling '+ name +' Plugin...').yellow);
                const path = installedIDEs[name] + pluginsEnd
                fs.createReadStream(zippedPlugin).pipe(unzipper.Extract({ path }));    
                console.log('Success: '.bold+(name+' Installed').green)
            }
    }

    if (installedIDEs['IntelliJ CE'] || installedIDEs['IntelliJ Ultimate'] || installedIDEs['WebStorm']) {
        downloadJetBrains((zippedPlugin)=> {

            installJetBrainsIfPresent('IntelliJ CE', zippedPlugin)
            installJetBrainsIfPresent('IntelliJ Ultimate', zippedPlugin)
            installJetBrainsIfPresent('WebStorm', zippedPlugin)

            if (allDone) {
                allDone()
            }

        })
    } else {
        if (allDone) {
            allDone()
        }
    }

}

// module.exports.getInstalledIDEs((ides) => module.exports.installIDEPlugins(ides, ()=> console.log('done')))