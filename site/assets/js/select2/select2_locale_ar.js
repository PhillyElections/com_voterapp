(function(a){a.extend(a.fn.select2.defaults,{formatNoMatches:function(){return"لا توجد نتائج"},formatInputTooShort:function(b,c){var d=c-b.length;return"من فضلك أدخل "+d+" حروف أكثر"},formatInputTooLong:function(c,b){var d=c.length-b;return"من فضلك أحذف  "+d+" حروف"},formatSelectionTooBig:function(b){return"يمكنك ان تختار "+b+" أختيارات فقط"},formatLoadMore:function(b){return"تحمل المذيد من النتائج ..."},formatSearching:function(){return"جاري البحث ..."}})})(jQuery);