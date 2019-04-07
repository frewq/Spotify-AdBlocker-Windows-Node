// TODO
//  tasklist /fi "IMAGENAME eq spotify.exe" /v               https://www.computerhope.com/tasklist.htm
// tasklist /fi "IMAGENAME eq spotify.exe" /v /fo list      falta mejorar este comando
// hacer un .ini con opciones configurables: bat oculto, sin log, archivos a monitorear, ubicacion de carpeta personal, etc.
// ver porque powershell escribe constantemente en el disco
// si hay mas de 1 usuario se bugea, para esto va a servir 'pending messsages'
// los mensajes no salen si inicio spotify antes que el script
// si sale como mensaje 'ad blocked', entonces esperar 1 minuto(es un tiempo prudencial, los ads no duran más de 30 segundos), luego deberia usar tasklist para ver que el proceso está corriendo, y si es así usar autohoykey para iniciar el script 'pausar-->play'
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

const starting = (function (){
  console.log('Loading...');
  let logFile = false;
  let users = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/`));
  // aca deberia ir tasklist
  return () => {
    users.map((userFolder) => {
      let userPath = path.normalize(process.env.APPDATA + `/Spotify/Users/${userFolder}`)
      eventFileChanged(userPath, spotify, userFolder, true, 100, 'Session started...')

      files = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/${userFolder}`))
      files.map((searchLog) => {if (searchLog === 'log') logFile = true;})
      logFile === false? console.log('Spotify adblock has started'): console.log('Spotify adblock has started. Waiting for Spotify...');
    })
  }
})()

function mute(args, song = 'unknown') {
    exec(`nircmdc.exe muteappvolume Spotify.exe ${args}`)
    if (args === 1) console.log('Ad blocked!')
    if (args === 0) console.log(`Now playing: ${song}`)
    // if ((args === 0) && (song != 'Spotify Free')) console.log(`Now playing: ${song}`)
};

function isPaused(ads, song) {
  if (ads == 'Spotify Free') console.log('Spotify is paused');
};

function adBlocker(ads, song) {
  ads == 'Spotify' || ads == 'Advertisement' ? mute(1, song): mute(0, song);
};

const powershell = (function () {
  let ads = ''; //evita la dupliacion de mensajes a consola
  return (callb) => {
    const pshell = new Shell({ verbose: false, executionPolicy: 'Bypass', noProfile: true });
    pshell.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
    pshell.invoke()
    .then(song => {
      song = song.replace(/(MainWindowTitle)/gi, '').replace(/(^\W*|\W*$)/gim, '');
      if (ads != song) {
        ads = song;
        callb(ads, song)
      }
      pshell.dispose();
    })
    .catch(() => process.exit(1))
  }
})();

function eventFileChanged(file, callback, args, endEvent, delay, message = undefined) {
  let fsWait = false;
  fs.watch(file, (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = setTimeout(() => {
        if (message != undefined) console.log(message);
        callback(args);
        fsWait = endEvent;
      }, delay);
    }
  })
}

function spotify (usuarioactivo) {
  //si cierro spotify, este archivo deja de exister y el script termina
  let playing = path.normalize(process.env.APPDATA + `/Spotify/Users/${usuarioactivo}/ad-state-storage.bnk`)
  let paused = path.normalize(process.env.APPDATA + `/Spotify/Users/${usuarioactivo}`)
  console.log(`Monitoring: ${playing}`);
  eventFileChanged(playing, powershell, adBlocker, false, 100)
  eventFileChanged(paused, powershell, isPaused, false, 1000)
}

starting();