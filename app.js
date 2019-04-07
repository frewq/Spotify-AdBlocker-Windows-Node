const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const Shell = require('node-powershell');

const starting = (function (){
  console.log('Loading...');
  let logFile = false;
  let users = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/`));
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
};

function isPaused(ads, song) {
  if (ads == 'Spotify Free') console.log('Spotify is paused');
};

function adBlocker(ads, song) {
  ads == 'Spotify' || ads == 'Advertisement' ? mute(1, song): mute(0, song);
};

const powershell = (function () {
  let ads = '';
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
  let playing = path.normalize(process.env.APPDATA + `/Spotify/Users/${usuarioactivo}/ad-state-storage.bnk`)
  let paused = path.normalize(process.env.APPDATA + `/Spotify/Users/${usuarioactivo}`)
  console.log(`Monitoring: ${playing}`);
  eventFileChanged(playing, powershell, adBlocker, false, 100)
  eventFileChanged(paused, powershell, isPaused, false, 1000)
}

starting();