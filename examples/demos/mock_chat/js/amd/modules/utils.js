define({
    $: function (string, relativeTo) {
        return (relativeTo || document).querySelector(string);
    }
});