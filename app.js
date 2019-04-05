// TODO
// ahora tengo que detectar la condicion de que inicio spotify pero no esta escuchando ninguna cancion (pending-messages no existe)
// los mensajes se duplican

// tengo que usar tracklist para ver si está corriendo spotify y luego buscar el archivo pending-messages o voy a tener que cuidarme de no iniciar el bloqueador antes de iniciar spotify
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




//Detecta si inicio o no spotify

let inicioSpotify = ''
let hayLog = 0
let usuarioactivo = ''


let carpetaUsuario = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/`));
  carpetaUsuario.map( (buscaLog) => {
    //   console.log('este es el directorio activo:', directorioActivo)
    // }
    // if (buscaLog === 'pending-messages') {
      // console.log(buscaLog)
      
    inicioSpotify = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/${buscaLog}`))
    
    inicioSpotify.map( (archivoLog) => {
      // si hay log entonces no inicio
      archivoLog === 'log'? hayLog++: hayLog = hayLog;
      //tengo que poner la condicion de que reinicie el valor cuando entra a otra carpeta
      if (hayLog == 0) usuarioactivo = buscaLog
    }
    )
    if (hayLog > 0) {
      console.log('Esperando a que inicie Spotify...')

      //aca meto un fswait hasta que inicie
      let fsWait = false;

      //en el directorio esta el error
      
      // tengo que dejar de watch si empiezo el script cuando spotify esta pausado porque duplica la informacion
      fs.watch(path.normalize(process.env.APPDATA + `/Spotify/Users/`), (event, filename) => {
        if (filename) {
          if (fsWait) { console.log('running'); return};
          fsWait = setTimeout(() => {
            // si desaparece el log lo mando a spotify
            // detecto el usuario activo
            // aca tengo que mandar al directorio del usuario activo 'directorioActivo'
            console.log('filename', filename)
            spotify(filename)
            fsWait = true;
          }, 2000);
        }
      });
    }
    else {
      console.log('inicio')
      // tengo que pasar este directorio a spotify (el del log = 0)
      spotify(usuarioactivo)
    }
})




//tiene que recibir como parametro el directorio activo
function spotify(directorioactual){
  
  // console.log(directorioactual)
  //borrar?
  let directorioActivo = ''
  
//Encuentro el archivo 'ad-state-storage.bnk' del usuario activo. El usuario activo se lo puede distinguir porque es el único que tiene el archivo 'pending-messages' en su directorio personal
// let listaUsuarios = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users`))

  // let carpetaUsuario = fs.readdirSync(path.normalize(process.env.APPDATA + `/Spotify/Users/${directorioactual}`));
  // carpetaUsuario.map( (archivo_pending_messages) => {


  //   // tengo que detectar el directorio con el log=0 mejor
  //   if (archivo_pending_messages === 'pending-messages') {






      directorioActivo = path.normalize(process.env.APPDATA + `/Spotify/Users/${directorioactual}/ad-state-storage.bnk`)
      console.log('este es el directorio activo:', directorioActivo)
  //   }
  // })


// ahora tengo que detectar la condicion de que inicio spotify pero no esta escuchando ninguna cancion (el titulo es 'spotify free')


const pausado = (function(){
  let ads = "";
  
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
        (ads == 'MainWindowTitleSpotifyFree')? console.log("Spotify esta en pausa"): unmute(); //unmute() sirve para que no este silenciado al inicio
      }
      powershell.dispose();
    })
    .catch( () => process.exit(1) )
}})()



pausado()









const programs = [{ program: path.normalize(`"nircmdc.exe"`),
                    log: directorioActivo
                  }];

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

}