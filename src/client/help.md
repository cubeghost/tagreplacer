### ordering of tags
if you find and replace the same number of tags, the first tag will replace the first,
the second the second, and so on. for example:
```
tags on post: tag1, tag2, tag3, tag4

find: tag2, tag4
replace: replaced2, replaced4

tags on post: tag1, replaced2, tag3, replaced4
```

if you find and replace an uneven number of tags, it works slightly differently,
but still tries to retain the original ordering of the tags.

if you replace more than you find, it appends to the end:
```
tags on post: tag1, tag2, tag3, tag4

find: tag2
replace: replaced2, replaced5

tags on post: tag1, replaced2, tag3, tag4, replaced5
```

if you find more than you replace, it deletes any extras:
```
tags on post: tag1, tag2, tag3, tag4

find: tag2, tag4
replace: replaced2

tags on post: tag1, replaced2, tag3
```
