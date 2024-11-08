# azur-drawingbook
A [DrawingBook](https://azurlane.koumakan.jp/wiki/Template:DrawingBook) template generator for [Azur Lane Wiki](https://azurlane.koumakan.jp/).

It takes an image like this:

<img src="sample.jpg">

And creates a MediaWiki template like this:

```wiki
{{DrawingBook
|a=rgb(255, 255, 255)
|b=rgb(49, 36, 33)
|c=rgb(255, 211, 115)
|d=rgb(247, 105, 90)
|e=rgb(115, 130, 255)
|f=rgb(255, 215, 198)
|g=rgb(90, 40, 66)
|h=rgb(82, 56, 90)
|i=rgb(82, 97, 165)
|c     baaa iiiii aabb  bbbbbbbbbbc   
|     caaa b bbbbaaaab bbbbbbbbbbbbc c
|c   c babaaaaaaabaaa bbbbbbbbbbbbb d 
| c c  abaaaaaaaaabaaabbbbfbbbbfbbbcbc
|  d   iaaafaafafaabaabbbffffffffbc b 
| cbc ibaaffaafaffaababbbffefffefbbbb 
|c b cibabfdfffdffaaab bfffefffeffbbb 
|   b caabfdfffdffaaabibffffffffffbffb
|c   b abfffffffffbaabibbffffddfffbffb
|  biibabfffddfffffaaibbbffffdfffbfffb
| biiiibabfffdffffbaab bbbffffffb afb 
| biiiiib bffffffbaab   b  bbbbb beaab
|biiiiiiib bbbbb aab  ba abdd dddaaeaa
|biiddiiiibadddabababba aaedddddbaaaeb
|ididddiiibab baabaaaeaaaaebdadbaeaab 
|iiiidddiibbiiibaaaab eaaebdaaadaaab  
|bidiiddiibibibiibbb b eebaaacaaabb  c
|abiiiiiiibiibiii iii b baaaaaaaaab cb
|aabidiidibbbbbbibiiiibcabaaacaaabb   
|aaabbiiii bbibbibddddibaabaaaaabaab  
|aaaaabbibibbibbibdddddbaaabbabbaaaab 
| aaaaaaaabiiiiiiibdddddbbaaaaaaabaacb
}}
```

Which can be added to a Painting Gallery section like this:

```wiki
== Painting Gallery ==
<tabber>
...
|-|
Nº 7=
{{DrawingBook
...
}}
</tabber>
```

This particular example was taken from painting Nº 7 of the [Happy Lunar New Year 2021](https://azurlane.koumakan.jp/wiki/Happy_Lunar_New_Year_2021#Painting_Gallery) event page.
