let {exec} = require('child_process');
let path = require('path');

const Shell = require('node-powershell');


let publicidad = "";
let programas = [{ programa: path.normalize(`"nircmdc.exe"`) }]

setInterval( () => { 

  const powershell = new Shell({
    verbose: false,
    executionPolicy: 'Bypass',
    noProfile: true
  });

  powershell.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
  powershell.invoke()
  .then(title => {
    title = title.replace(/(\W|MainWindowTitle)/gi, "");
    if (publicidad != title){
      publicidad = title;
      ((publicidad == 'Spotify') || (publicidad == 'Advertisement'))? mute(): unmute();
    }
  })
  .then( () => {
    powershell.dispose()
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