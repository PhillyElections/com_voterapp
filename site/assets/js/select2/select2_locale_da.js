(function(a){a.extend(a.fn.select2.defaults,{formatNoMatches:function(){return"Ingen resultater fundet"},formatInputTooShort:function(b,c){var d=c-b.length;return"Angiv venligst "+d+" tegn mere"},formatInputTooLong:function(c,b){var d=c.length-b;return"Angiv venligst "+d+" tegn mindre"},formatSelectionTooBig:function(b){return"Du kan kun vælge "+b+" emne"+(b===1?"":"r")},formatLoadMore:function(b){return"Indlæser flere resultater…"},formatSearching:function(){return"Søger…"}})})(jQuery);