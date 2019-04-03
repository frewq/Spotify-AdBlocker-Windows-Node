//Voy a hacer un bloqueador de publicidad de spotify para windows
// otra idea hacerme un script que le de al Play si la app de spotify se queda colgada en la publicidad que me tiene podrido

//TODO
// empaquetar el programa https://www.npmjs.com/package/pkg
// chequear que spotify no este muteado al inicio, tambien unmutear cuando se cierra el programa.

//TODO completadas:
// regexp para detectar cuando hay publicidad(esta es la variable)
    //String que aparecen cuando hay publicidad, son las que tengo que bloquear:
    //Spotify
    //Advertisement
    
// https://www.npmjs.com/package/node-powershell

// Powershell:
//  Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle
// Tengo que agregar un script que monitoree los cambios en tiempo real porque powershell no tiene uno nativo
// https://blog.csmac.nz/a-powershell-watch-command/
// http://wragg.io/watch-for-changes-with-powershell/

// Node, extraigo la informacion
// regexp

// nircmdc.exe, si hay publicidad en el titulo muteo
// muteappvolume Spotify.exe 1


let {exec} = require('child_process');
let path = require('path');

const Shell = require('node-powershell');


let publicidad = "";
let programas = [{ programa: path.normalize(`"nircmdc.exe"`) }] // tiene doble comillas porque son necesarias para que reconozca el path.


setInterval( () => { 
  const ps = new Shell({
    verbose: false,
    executionPolicy: 'Bypass',
    noProfile: true
  });
  ps.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');
  ps.invoke()
  .then(title => {
    title = title.replace(/(\W|MainWindowTitle)/gi, "");
    if (publicidad != title){
      publicidad = title;
      ((publicidad == 'Spotify') || (publicidad == 'Advertisement'))? mute(): unmute();
    }
  })
  .then( () => {
    // console.log('aca deberua fkallar');
    ps.dispose()
  })
  // .catch(error => { console.log('Algo ha fallado:', error)})
  }, 1000)
  
  

  //regexp para limpiar la salida de powershell, esto va al principio, llama a ps.invoke
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

// .then( () => 
//   //cierra la app, deberia borrarla
//   ps.dispose()
//   .then(code => {})
//   .catch(error => {})
// )
// .catch(err => console.log(err));