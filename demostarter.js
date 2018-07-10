const List = require('prompt-list');
const exec = require('sync-exec');


module.exports.startDemo = function (ides, demoFolder) {
    var list = new List({
        name: 'ide',
        message: 'Which IDE should we open the demo with?',
        choices: Object.keys(ides)
    });

    list.ask(function(answer) {

        exec('open https://useoptic.com/workflow')
        exec('open /Applications/Optic.app')

        switch (answer) {
            case 'VSCode': {
                const codeBinCommand = ides.VSCode.replace(/(\s+)/g, '\\$1')+'/Contents/Resources/app/bin/code '+demoFolder
                exec(codeBinCommand)
                break;
            }
            case 'Atom': {
                exec('atom '+demoFolder)
                break;
            }
			case 'Sublime Text 3': {
				exec('open -a "sublime text" '+demoFolder)
				break;
			}
            case 'IntelliJ CE': {
                exec('open -a '+ides['IntelliJ CE'].replace(/(\s+)/g, '\\$1')+' '+demoFolder)
                break;
            }
            case 'IntelliJ Ultimate': {
                exec('open -a '+ides['IntelliJ Ultimate'].replace(/(\s+)/g, '\\$1')+' '+demoFolder)
                break;
            }
            case 'WebStorm': {
                exec('open -a '+ides['WebStorm'].replace(/(\s+)/g, '\\$1')+' '+demoFolder)
                break;
            }
        }

        console.log('\n\nMy work here is done. Happy Coding! :)')

    });
}

// startDemo({'VSCode': '/Applications/Visual Studio Code.app', 'Atom': true, JetBrains: '/Applications/IntelliJ IDEA CE.app'}, '/Users/aidancunniffe/Downloads/optic-demo-project')
