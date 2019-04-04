const {exec} = require('child_process');
const path = require('path');
const programs = [{ program: path.normalize(`"nircmdc.exe"`) }];
const Shell = require('node-powershell');

const silenciador = ( function(){
  let ads = "";
  
  return () => {setInterval( () => { 

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
}, 2000);
}})()

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

silenciador();