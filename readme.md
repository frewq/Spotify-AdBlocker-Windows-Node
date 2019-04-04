# Spotify ad blocker for Windows

(EN) This little SCRIPT blocks spotify's ads. Tested on Windows 10 x64.

(ESP) Este pequeño SCRIPT bloquea la publicidad de spotify. Testeado en Windows 10 x64.

***
## Requirements:
* Node.js: https://nodejs.org/es/download/

***
## How to run it:
(EN) 
  * First start Spotify,
  * then open a Node.js's terminal and execute app.js 

      > `node app.js`   or just run run.bat.

(ESP)
  * Primero inicia Spotify,
  * luego habre una terminal de Node.js y ejecuta app.js 

      > `node app.js`   o simplemente ejecuta run.bat.


***
## Toolset:
* Windows PowerShell
* node-powershell: https://www.npmjs.com/package/node-powershell
* NirCmd: http://www.nirsoft.net/utils/nircmd.html

***
## Como funciona
Lo que hace este script es obtener mediante Powershell el título de lo que se está reproduciendo en la aplicación de Spotify. Luego, mediante un timer que se inicia cada cierto tiempo (2 segundos) detecta si lo que se reproduce es publicidad, y si es así, entonces con el programa NirCmd silencia Spotify hasta que comience proxima canción.

***
## Nota
A corregir: si se minimiza a la bandeja de entrada no funciona.
***
### Fabian Perez