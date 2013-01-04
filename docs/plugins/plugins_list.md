## List of plugins


### Off-package LMD module loader

<table>
    <tr>
        <th>Plugin</th>
        <th>Description</th>
        <th>Default</th>
    </tr>
    <tr>
        <td>async</td>
        <td>if modules uses off-package module set this to true</td>
        <td>false</td>
    </tr>
    <tr>
        <td>async_plain</td>
        <td>enables async require of both plain and function-modules</td>
        <td>false</td>
    </tr>
    <tr>
        <td>async_plainonly</td>
        <td>if you are using only plain modules enable that flag instead of async_plain</td>
        <td>false</td>
    </tr>
</table>

### Cache

<table>
    <tr>
        <th>Plugin</th>
        <th>Description</th>
        <th>Default</th>
    </tr>
    <tr>
        <td>cache</td>
        <td>stores all application lmd itself + all modules in localStorage this flag will force all modules to be lazy</td>
        <td>false</td>
    </tr>
    <tr>
        <td>cache_async</td>
        <td>depend on cache flag, enables localStorage cache for require.async()</td>
        <td>false</td>
    </tr>
</table>

### Non-LMD modules loader

<table>
    <tr>
        <th>Plugin</th>
        <th>Description</th>
        <th>Default</th>
    </tr>
    <tr>
        <td>js</td>
        <td>if you are going to load non LMD javascript modules require.js() set this flag to true</td>
        <td>false</td>
    </tr>
    <tr>
        <td>css</td>
        <td>enables css-loader feature require.css()</td>
        <td>false</td>
    </tr>

</table>

### Environment optimization

<table>
    <tr>
        <th>Plugin</th>
        <th>Description</th>
        <th>Default</th>
    </tr>
    <tr>
        <td>worker</td>
        <td>set true if LMD package will run as worker</td>
        <td>false</td>
    </tr>
    <tr>
        <td>node</td>
        <td>set true if LMD package will run as Node.js script</td>
        <td>false</td>
    </tr>
    <tr>
        <td>ie</td>
        <td>set false if script will run only in modern browsers</td>
        <td>true</td>
    </tr>
    <tr>
        <td>opera_mobile</td>
        <td>set true if LMD package will run in Opera Mobile</td>
        <td>false</td>
    </tr>
</table>

### Async loaders features and optimizations

<table>
    <tr>
        <th>Plugin</th>
        <th>Description</th>
        <th>Default</th>
    </tr>
    <tr>
        <td>race</td>
        <td>set true if you are performing simultaneous loading of the same resources</td>
        <td>false</td>
    </tr>
    <tr>
        <td>parallel</td>
        <td>enables parallel loading require.js([a, b, c], ..) resources will be executed in load order! And passed to callback in list order</td>
        <td>false</td>
    </tr>
</table>

### Extra module types

<table>
    <tr>
        <th>Plugin</th>
        <th>Description</th>
        <th>Default</th>
    </tr>
    <tr>
        <td>shortcuts</td>
        <td>enables shortcuts in LMD package</td>
        <td>false</td>
    </tr>
    <tr>
        <td>amd</td>
        <td>enables AMD modules in LMD package</td>
        <td>false</td>
    </tr>
</table>

### Stats and Code coverage

<table>
    <tr>
        <th>Plugin</th>
        <th>Description</th>
        <th>Default</th>
    </tr>
    <tr>
        <td>stats</td>
        <td>enables require.stats() function - every module require, load, eval, call statistics</td>
        <td>false</td>
    </tr>
    <tr>
        <td>stats_coverage</td>
        <td>enables code coverage for all in-package modules, you can use list of module names to cover only modules in that list</td>
        <td>false</td>
    </tr>
    <tr>
        <td>stats_coverage_async</td>
        <td>enables code coverage for all off-package function-modules for that option you can NOT use list of off-package module names.
        This options is VERY HEAVY +50Kb sources. Each async LMD module will be parsed and patched on the client - it may take A LOT of time
        </td>
        <td>false</td>
    </tr>
    <tr>
        <td>stats_sendto</td>
        <td>enables require.stats.sendTo(host[, reportName]) function. It POSTs stats&coverage report to specified stats server</td>
        <td>false</td>
    </tr>
</table>
