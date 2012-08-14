## Overview

Colorpal is a fun online app for kids to learn color mixing. They mix colors (like red and yellow to create orange) and use those colors to paint drawings. Starting from a limited palette; they explore new colors and produce their own custom palette. The app takes advantage of the flexibility of the digital world by being able to experiment quickly without any waste.
 
Play with the app [here](http://nehacrosby.github.com/colorpal/)
 
![App preview](http://i.imgur.com/Qp9P9.png)

### Getting started

The app is built using HTML5, jQuery and Canvas and only works in webkit browsers (chrome and safari) currently. You can run it easily using the following ruby script:

       $ cd colorpal
       $ ./serve_directory.rb ./

### Fun facts

Mastering color mixing itself is quite difficult even for professional artists. While Colorpal emulates the practice of paint mixing, it is actually mixing lights instead of paint pigments. Since it carries out additive color mixing, blue and yellow make grey instead of green. This can be counterintuitive to those who are are used to subtractive color system of pigments. Since mixing pigments does not follow exact color theory, simulating paint mixing using a software library and outputting a human perceivable color is [difficult](http://www.quora.com/Color-and-Colors/Are-there-good-software-libraries-that-accurately-model-mixing-of-different-colors). However, additive mixing is surprisingly similar to mixing paints when not blending from yellow to blue.

The goal is for kids to have fun by painting using the new colors that they create. If they stumble upon a strange mix then hopefully they'll ask the right question: [why do blue and yellow not make green?](http://www.amazon.com/Blue-Yellow-Dont-Make-Green/dp/0967962870)
