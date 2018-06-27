const platform = require('platform');
const colors = require('colors');
const read = require('read')
const appPath = require('app-path');
const getInstalledIDEs = require('./ides.js').getInstalledIDEs
const installIDEPlugins = require('./ides.js').installIDEPlugins

const appinstaller = require('./opticappinstaller.js').install
const startDemo = require('./demostarter.js').startDemo

const publicIp = require('public-ip')

var ipaddress = null
publicIp.v4().then(address => {
    ipaddress = address
});

//Step 1: Verify Machine is a Mac
if (platform.os.family !== 'Darwin') {
    console.warn('Optic currently only supports MacOS. Aborting Install'.red)
    reportToMixpanel({}, false, false)
    return
}

getInstalledIDEs(function (installedIDEs) {
if (!Object.keys(installedIDEs).length) {
    reportToMixpanel({}, false, false)
    console.log("\nBummer. Doesn't look like you have any IDEs that support Optic. Download Atom, VSCode, IntelleJ or WebStorm and then let's try this again.".red)
    return
}

//Step 2: Show Logo
const logo = "\n   _ \\          |   _)       \n  |   |  __ \\   __|  |   __| \n  |   |  |   |  |    |  (    \n \\___/   .__/  \\__| _| \\___| \n        _|                   "
console.log(logo)
console.log("\n\nWelcome to Optic! Let's get you setup! ")
console.log("\nToday we're going to install the standalone Optic.app and the Optic plugins for your IDEs.")
console.log("\nWe found these Optic Enabled IDEs on your computer:")
console.log("\n - "+Object.keys(installedIDEs).join("\n - ")+"\n\n")
//Step 3: Ask for permission
read({ prompt: '  Do you want to install Optic and all the above IDE Plugins? (y/n)?' }, function(er, yOrN) {
    if (yOrN === 'y' || yOrN === 'Y' || yOrN === 'yes') {

    appinstaller(()=>  installIDEPlugins(installedIDEs, ()=> {
        console.log('\n\n\n')
        read({ prompt: '\n\n'+ 'Optic is Installed! Before I go can I help you start the Optic Demo Project? (y/n)' }, function(er, yOrN) {
            if (yOrN === 'y' || yOrN === 'Y' || yOrN === 'yes') {
                const homedir = require('os').homedir();
                const demopath = homedir+'/Downloads/optic-demo-project'
                reportToMixpanel(installedIDEs, true, true)
                startDemo(installedIDEs, demopath)
            } else {
                reportToMixpanel(installedIDEs, true, false)
                console.log('Great! Have fun. Here are a few parting links before my process is terminated.')
                console.log('Optic is open source! '+ 'https://github.com/opticdev'.underline.blue)
                console.log('Here are our docs '+ 'https://useoptic.com/docs'.underline.blue)
                console.log('Watch our Product Video '+ 'https://www.youtube.com/watch?v=sMXcKMKYZ8c'.underline.blue)
                console.log('\n\n Happy Coding :) '.bold)
            }
        })
    }))

    } else {
        reportToMixpanel(installedIDEs, false, false)
        console.log("\n\nInstall cancelled. You can run optic-installer anytime to try again OR run 'npm uninstall optic-installer -g' to remove this installer".bold.yellow)
    }
})

})


function reportToMixpanel(installedIDEs, didInstall, didDemo) {
    const Mixpanel = require('mixpanel');
    const mixpanel = Mixpanel.init('c0297cb80a0ef23482d83ec59c74b8f9');

    mixpanel.track('Installer Run', {
        ip: ipaddress, //to compare with web traffic
        platform,
        ides: Object.keys(installedIDEs),
        didInstall,
        didDemo
    }, (e)=> {

    })

}
