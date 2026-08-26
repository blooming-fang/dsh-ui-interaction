//#region src/index.ts
/**
* dsh-ui-interaction, node half.
*
* Deliberately empty. The provider-first model picker is browser UI only: it
* reads the session model directory through the client runtime and submits
* through `session.selectModel`. Nothing here needs the host. The row exists
* so the loader mounts the entry — which the client-modules node half scans
* for its `dsh.client` declaration and serves the browser bundle for.
*/
/** Host plugin body — no host behavior. */
function apply() {}
//#endregion
export { apply };
