(function(a){a.extend(a.fn.select2.defaults,{formatNoMatches:function(){return"沒有找到相符的項目"},formatInputTooShort:function(b,c){var d=c-b.length;return"請再輸入"+d+"個字元"},formatInputTooLong:function(c,b){var d=c.length-b;return"請刪掉"+d+"個字元"},formatSelectionTooBig:function(b){return"你只能選擇最多"+b+"項"},formatLoadMore:function(b){return"載入中..."},formatSearching:function(){return"搜尋中..."}})})(jQuery);