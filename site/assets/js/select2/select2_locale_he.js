(function(a){a.extend(a.fn.select2.defaults,{formatNoMatches:function(){return"לא נמצאו התאמות"},formatInputTooShort:function(b,c){var d=c-b.length;return"נא להזין עוד "+d+" תווים נוספים"},formatInputTooLong:function(c,b){var d=c.length-b;return"נא להזין פחות "+d+" תווים"},formatSelectionTooBig:function(b){return"ניתן לבחור "+b+" פריטים"},formatLoadMore:function(b){return"טוען תוצאות נוספות..."},formatSearching:function(){return"מחפש..."}})})(jQuery);