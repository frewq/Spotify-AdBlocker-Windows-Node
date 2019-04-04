// TODO
// regexp para el path de ad-state-storage

// https://stackoverflow.com/questions/13206724/how-to-get-the-list-of-process

// https://thisdavej.com/how-to-watch-for-files-changes-in-node-js/
// https://www.npmjs.com/package/node-watch

// C:\Users\Fabian\AppData\Roaming\Spotify\Users\mrfrewq-user
// -ad-state-storage.bnk (creo que tengo trabajar con este)
// 	cuando hay un cambio de cancion se actualiza
// 	cuando pauso y le doy play se actualiza 
// 		(se actualiza al darle play no al pausar)
// -pending-messages
// 	aparece cuando se esta ejecutando una cancion
// 	desaparece cuando se cierra spotify o hay un se escucha un ad
// 	se actualiza constantemente
// 	cuando pauso y le doy play se actualiza


const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const programs = [{ program: path.normalize(`"nircmdc.exe"`),
                    log: path.normalize(`C:/Users/Fabian/AppData/Roaming/Spotify/Users/mrfrewq-user/ad-state-storage.bnk`)
                  }];
const Shell = require('node-powershell');

const spotifyfile = String(programs.map( (changes) => changes.log ));

console.log(`Watching for file changes on ${spotifyfile}`);

let fsWait = false;
fs.watch(spotifyfile, (event, filename) => {
  if (filename) {
    if (fsWait) return;
    fsWait = setTimeout(() => {
      silencer();
      fsWait = false;
    }, 100);
    // console.log(`${filename} file Changed`);
  }
});

const silencer = (function(){
  let ads = "";
  console.log("Spotify adblocker is running");
  return () =>  { 

    const powershell = new Shell({
      verbose: false,
      executionPolicy: 'Bypass',
      noProfile: true
    });

    powershell.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
    powershell.invoke()
    .then(title => {
      title = title.replace(/(\W)/gi, "");
      if (ads != title){
        ads = title;
        ((ads == 'MainWindowTitleSpotify') || (ads == 'MainWindowTitleAdvertisement'))? mute(): unmute();
      }
      powershell.dispose();
    })
    .catch( () => process.exit(1) )
}})();

function mute(){
  programs.map( start => {
    exec( start.program + " muteappvolume Spotify.exe 1" )
    },(error) => console.error('Algo ha fallado:', error)
  )
};

function unmute(){
  programs.map( start => {
    exec( start.program + " muteappvolume Spotify.exe 0" )
    },(error) => console.error('Algo ha fallado:', error)
  )
};