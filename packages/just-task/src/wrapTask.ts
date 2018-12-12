export function wrapTask(fn: any) {
  return function(done: any) {
    let origFn = fn;
    if (fn.unwrap) {
      origFn = fn.unwrap();
    }

    if (origFn.length > 0) {
      (fn as any).call(null, done);
    } else {
      let results = (fn as any).call();

      // The result is a function, we will assume that this is a task function to be called
      if (results && typeof results === 'function') {
        results.call(null, done);
      } else if (results && results.then) {
        results
          .then(() => {
            done();
          })
          .catch((e: any) => {
            done(e);
          });
      } else {
        done();
      }
    }
  };
}
