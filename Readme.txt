Code Created by Travis Crumley (travis.crumley@gmail.com) based on code by Brian Tombari.

-----------------------

To Run:

Start up touchDemo.html using Google Chrome. It doesn't work in other browsers.

To replace the images:
Name the new images Demo1.png etc, and delete or rename the current ones.
This does unfortunately mean that .jpg and other image formats are not as easily supported. 

If you want to use a different file name or extension, edit the demoImage variable in touchDemo.js as well as the .css file, just look at the bottom under #img1 etc and change the image links there.

If any errors occur, or something seems off, simply refresh the page (f5 or Ctrl+F5 to clear cache) and the demo should reset.

Notable performance hogs are the touch locations printout and the image processing, when these are not enabled however everything should run well even on very minimal hardware. If only the demo is running everything functions relatively well on the Intel Compute Sticks.

-----------------------

Things To Upgrade:

Besides any performance enhancements to the touch locations/image processing (the former could probably be optimized easier than the latter), there are a few other things that could be upgraded without too much issue and might improve the demo.

1. Make the currently selected images layer on top of the others when they're selected. Also check for overlap when selecting an image. This would prevent tapping on an enlarged image and getting the image underneath instead. This would require a bit more computation though, as a few more things would need to be checked and you might have to compare the distance from the centerpoints or something similar to the touch point and use the current scale to see what is selected. There might be an easier way to simply detect layers though or something similar.

2. There are a few issues still that crop up every once in a while when running the demo. One is that sometimes when you switch to the images, one isn't there, or you can't do anything with them. Refreshing usually fixes this, but it appears that some of the settings when running the drawing portion could cause errors in the image manipulation portion. 

3. The thickness on the border circles of the Toggle Touch Locations mode seems to make a big impression on quality, with thicker seeming more high definition up to a point. On lower resolutions screens the border seems too thin, and perhaps it could dynamically be scaled, or simply be enlarged a bit (or have its own variable setting) to compensate.

4. On some touchscreens, there is an odd issue for the touch locations where it grabs a bunch and then skips and grabs some more. Probably not something you can fix, but it certainly creates an odd pattern.

5. Perhaps adding Fade mode would be more intuitive for a first time demo than the current swipe, especially since swipe will erase things if you add a finger at all. Perhaps just modify Swipe so it doesn't do that.

-----------------------

A Few Notes:

- My only previous experience with web development was two Hackathons, so there may be some things in the code that an experienced web developer could improve a great deal. 

- This code was based on code produced by Brian Tombari. I modified it so much that it's probably unrecognizable now, but his work greatly assisted my learning curve and gave a great base point to start from. That combined with a number of great online resources, most especially Paul Irish's multitouch demo here: http://www.paulirish.com/demo/multi resulted in the final product.

- If any assistance is needed, please feel free to email me at travis.crumley@gmail.com. I enjoyed working on this but I didn't comment as well as I should have so some things might be rather less clear than is ideal.

