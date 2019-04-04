//TODO: cuando spotify está oculto en la bandeja este es el comando que tengo que utilizar en Powershell
//Get-Process -Name Spotify | Format-List ProcessName
//no se como integrarlo a este programa todavía

//si se cierra spotify antes que el script, entonces este se crashea, tengo que usar tasklist(CMD) para chequear que la ap este corriendo
//https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-xp/bb491010(v=technet.10)
//https://github.com/sindresorhus/tasklist
//tambien sirve para ver el titulo de los procesos, despues lo veo.
// o tambien en el CMD: WMIC PROCESS where name='evil.exe'
//https://social.technet.microsoft.com/Forums/windowsserver/en-US/ab6c7e6e-4ad4-4237-bab3-0349cd76c094/wmic-command-line-utilities?forum=winservercore

const {exec} = require('child_process');
const path = require('path');
const Shell = require('node-powershell');
const programs = [{ program: path.normalize(`"nircmdc.exe"`) }]
let ads = "";

// const tasklist = require('tasklist');

// (async () => {
// 	console.log(await tasklist());
// 	/*
// 	[{
// 		imageName: 'taskhostex.exe',
// 		pid: 1820,
// 		sessionName: 'Console',
// 		sessionNumber: 1,
// 		memUsage: 4415488
// 	}, …]
// 	*/
// })();


setInterval( () => { 

  const powershell = new Shell({
    verbose: false,
    executionPolicy: 'Bypass',
    noProfile: true
  });

  powershell.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
  powershell.invoke()
  .then(title => {
    title = title.replace(/(\W)/g, "");
    if (ads != title){
      ads = title;
      ((ads == 'MainWindowTitleSpotify') || (ads == 'MainWindowTitleAdvertisement'))? mute(): unmute();
    }
    powershell.dispose();
  })
  .catch( () => process.exit(1) )
}, 2000)

function mute(){
  programs.map( start => {
    exec( start.program + " muteappvolume Spotify.exe 1" )
    },(error) => console.error('Algo ha fallado:', error)
  )
}

function unmute(){
  programs.map( start => {
    exec( start.program + " muteappvolume Spotify.exe 0" )
    },(error) => console.error('Algo ha fallado:', error)
  ) 
}

// process.exit(22) sale del script
// process.kill https://stackabuse.com/how-to-exit-in-node-js/