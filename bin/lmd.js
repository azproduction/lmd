/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */


new (require(__dirname + '/lmd_builder.js'))(process.argv.join(' ')).pipe(process.stdout);