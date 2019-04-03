const {exec} = require('child_process');
const path = require('path');
const Shell = require('node-powershell');
const programas = [{ programa: path.normalize(`"nircmdc.exe"`) }]
let publicidad = "";

setInterval( () => { 

  const powershell = new Shell({
    verbose: false,
    executionPolicy: 'Bypass',
    noProfile: true
  });

  powershell.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
  powershell.invoke()
  .then(title => {
    title = title.replace(/(\W)/gi, "");
    if (publicidad != title){
      publicidad = title;
      ((publicidad == 'MainWindowTitleSpotify') || (publicidad == 'MainWindowTitleAdvertisement'))? mute(): unmute();
    }
    powershell.dispose();
  })
}, 2000)

function mute(){
  programas.map( iniciar => {
    exec( iniciar.programa + " muteappvolume Spotify.exe 1" )
    },(error) => console.error('Algo ha fallado:', error)
  )
}

function unmute(){
  programas.map( iniciar => {
    exec( iniciar.programa + " muteappvolume Spotify.exe 0" )
    },(error) => console.error('Algo ha fallado:', error)
  ) 
}