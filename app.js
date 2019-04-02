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

const ps = new Shell({
  verbose: true,
  executionPolicy: 'Bypass',
  noProfile: true
});

let publicidad;
let programas = [{ programa: path.normalize(`"nircmdc.exe"`) }] // tiene doble comillas porque son necesarias para que reconozca el path.

ps.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');

// deberia invocarlo dentro del timer??
ps.invoke()

.then(output => {
  publicidad = output;

  //ps.invoke y el resto va dentro de una funcion
  //regexp para limpiar la salida de powershell, esto va al principio, llama a ps.invoke
  publicidad = publicidad.replace(/(\W|MainWindowTitle)/gi, "")
  // console.log('Regexp:',publicidad)
})

.then( () => {
  programas.map( iniciar => {
    ((publicidad == 'Spotify') || (publicidad == 'Advertisement'))? 
      exec( iniciar.programa + " muteappvolume Spotify.exe 1" ): 
      exec( iniciar.programa + " muteappvolume Spotify.exe 0" )
      
  },(error) => console.error('Algo ha fallado:', error)
  )
}
)

.then( () => 
  //cierra la app, deberia borrarla
  ps.dispose()
  .then(code => {})
  .catch(error => {})
)
.catch(err => console.log(err));

//timer
setInterval( () => { 
    ((publicidad == 'Spotify') || (publicidad == 'Advertisement'))? 
      console.log('bloqueado!'): 
      console.log('No es', publicidad)
}, 1000)