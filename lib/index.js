import z from "@deepseek-ai/schemastery";
// src/index.ts
/**
* dsh-ui-interaction, node half.
*
* The only host-side surface is the config schema behind the bundle's two
* feature switches. Declaring it does two things at once: the loader validates
* the switches and re-resolves them when the profile row changes, and the Host
* projects this entry as a settings namespace (`dsh-ui-interaction`), which is
* what the browser card writes through `ctx.configForms` and what every feature
* gate reads. Both fields are volatile, so a flip reaches a running browser
* without a restart.
*
* Both switches default to on: an install whose profile row carries no config
* behaves exactly like the release that had no switches at all, and a Host that
* serves no such namespace leaves the browser gates at their defaults (on).
*/
/** Config schema; the Host projects this entry into the Plugins page as this bundle's settings. */
const Config = z.object({
	interaction: z.boolean().default(true).volatile(),
	appearance: z.boolean().default(true).volatile()
});
/**
* Host plugin body.
*
* Nothing to do here: the row exists so the loader mounts the entry (which the
* client-modules node half scans for its `dsh.client` declaration), and so the
* switches have a validated schema to live in. The browser half reads them.
*/
function apply() {}
export { Config, apply };
