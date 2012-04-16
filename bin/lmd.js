/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */
new (require(__dirname + '/lmd_builder.js'))({
    config: process.argv[2],
    output: process.argv[3],
    version: process.argv[4]
});