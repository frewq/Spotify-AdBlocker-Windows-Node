//Voy a hacer un bloqueador de publicidad de spotify para windows

//TODO
// empaquetar el programa completo https://www.npmjs.com/package/pkg
// chequear que no este muteado al inicio, unmutear cuando se cierra el programa.

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


// regexp para detectar cuando hay publicidad(esta es la variable)
    //String que aparecen cuando hay publicidad, son las que tengo que bloquear:
    //Spotify
    //Advertisement
let {exec} = require('child_process');
let path = require('path');

const Shell = require('node-powershell');

const ps = new Shell({
  verbose: true,
  executionPolicy: 'Bypass',
  noProfile: true
});

let publicidad;
let regexe;
let programas = [
  { programa: path.normalize(`"nircmdc.exe"`) }] // tiene doble comillas porque son necesarias para que reconozca el path.

// al inicio del programa debería chequear que Spotify no este muteado por defecto para que no arranque sin sonido, creo.

// ps.addCommand('Get-Process -Name Spotify | Format-List mainWindowtitle');
ps.addCommand('Get-Process -Name Spotify | where-Object {$_.mainWindowTitle}  | Format-List mainWindowtitle');

// deberia invocarlo dentro del timer??
ps.invoke()

.then(output => {
  publicidad = output;
})
.then( () => console.log(publicidad) )

//regexp para limpiar la salida de powershell
.then( () => 
  publicidad = publicidad.replace(/(\W|MainWindowTitle)/gi, "")
)

.then( 
  // aca va la logica que detecta si hay musica o publicidad
  programas.map( iniciar => {
    if (publicidad === 'Spotify' || publicidad === 'Advertisement') exec( iniciar.programa + " muteappvolume Spotify.exe 1" )
    if (publicidad !== 'Spotify' && publicidad !== 'Advertisement') exec( iniciar.programa + " muteappvolume Spotify.exe 0" )
  
  },(error, stdout, stderr) => {
    if (error) {console.error(error); return;}
    console.log('bloqueado ', stdout);
  })
  )
  


.then((publicidad) => 
  //cierra la app, deberia borrarla
  ps.dispose()
  .then(code => {})
  .catch(error => {})
)
.catch(err => {
  console.log(err);
});

//timer
setInterval( () => { 
  if (publicidad === 'Spotify' || publicidad === 'Advertisement') console.log('bloqueado!')
  if (publicidad !== 'Spotify' && publicidad !== 'Advertisement') console.log(publicidad)
}, 1000)