// TODO
// si hay mas de 1 usuario se bugea, para esto va a servir 'pending messsages'
// los mensajes no salen si inicio spotify antes que el script
// autohotkey + https://www.npmjs.com/package/hotkeys-js

// O la alternativa a tracklist es detectar que ad-state-storage.bnk este funcionando y pending_messages no, si se dan ambos casos a la vez entonces no buscar en el directorio hasta que esto cambie. Creo que fs.readdirsync puede retornar null si no encuentra algo, investigar.
// Spotify a veces se cuelga en los estados MainWindowTitleSpotify o MainWindowTitleAdvertisement, no es culpa de este programa si no de la aplicacion oficial. Buscaré una solución. Pensé en usar hotkeys de windows para pausar y darle play automaticamente si pasa algún tiempo en esos estados. MainWindowTitleSpotifyFree es el estado que se activa si manualmente pauso la aplicación.

// https://stackoverflow.com/questions/13206724/how-to-get-the-list-of-process

// https://thisdavej.com/how-to-watch-for-files-changes-in-node-js/

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
// -'log' APARECE cuando se CIERRA la app y DESAPARECE cuando se INICIA

const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const Shell = require('node-powershell');

const pausado = (function () {
  let ads = "";
  return () => {
    const powershell = new Shell({
      verbose: false,
      executionPolicy: 'Bypass',
      noProfile: true
    });
    powershell.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
    powershell.invoke()
      .then(title => {
        title = title.replace(/(\W)/gi, "");
        if (ads != title) {
          ads = title;
          if (ads == 'MainWindowTitleSpotifyFree') console.log("Spotify is paused")
        }
        powershell.dispose();
      })
      .catch(() => process.exit(1))
  }
})();

const silenciar = (function () {
  let ads = "";

  return () => {
    console.log("Spotify adblocker is running");

    const powershell = new Shell({
      verbose: false,
      executionPolicy: 'Bypass',
      noProfile: true
    });
    powershell.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
    powershell.invoke()
      .then(title => {
        title = title.replace(/(\W)/gi, "");
        if (ads != title) {
          ads = title;
          ((ads == 'MainWindowTitleSpotify') || (ads == 'MainWindowTitleAdvertisement')) ? mute(1): mute(0);
        }
        powershell.dispose();
      })
      .catch(() => process.exit(1))
  }
})();

let logFile = false
let usuarioactivo = ''

let carpetasUsuario = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/`));
carpetasUsuario.map((carpeta) => {
  let inicioSpotify = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/${carpeta}`))
  inicioSpotify.map((searchLog) => {if (searchLog === 'log') logFile = true;})

  if (logFile === false) {usuarioactivo = carpeta; console.log('Starting'); spotify(usuarioactivo);}
  if (logFile === true) {
    console.log('Waiting for Spotify...')

    let fsWait = false;
    fs.watch(path.normalize(process.env.APPDATA + `/Spotify/Users/`), (event, usuarioactivo) => {
      if (usuarioactivo) {
        if (fsWait) {
          console.log(`The folder ${usuarioactivo} has been modified`);
          return
        };
        fsWait = setTimeout(() => {
          console.log(`${usuarioactivo}: logged in`)
          spotify(usuarioactivo)
          fsWait = true;
        }, 2000);
      }
    });
  } 
})

function mute(args) {
    exec(`nircmdc.exe muteappvolume Spotify.exe ${args}`)
    if (args === 1) console.log("Ad blocked!")
    if (args === 0) console.log("Next song")
};

function fsWaitChanges(watchThis, call, wait, timer) {
  let fsWait = false;
  fs.watch(watchThis, (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = setTimeout(() => {
        call();
        fsWait = wait;
      }, timer);
    }
  })
}

function spotify(usuarioactivo) {
  let directorioActivo = path.normalize(process.env.APPDATA + `/Spotify/Users/${usuarioactivo}/ad-state-storage.bnk`)
  console.log(`Watching for changes on ${directorioActivo}`);
  fsWaitChanges(path.normalize(process.env.APPDATA + `/Spotify/Users/${usuarioactivo}`), pausado, false, 1000)
  fsWaitChanges(directorioActivo, silenciar, false, 100)
}