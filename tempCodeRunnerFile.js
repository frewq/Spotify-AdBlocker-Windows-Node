function fsWaitChanges(watchThis, call, wait, timer){
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
