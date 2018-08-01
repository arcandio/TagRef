# Reference Flipper

* Features
  * Pick Folder
  * Search Filter/GLOB
    * (Designed to work with TagSpaces)
  * Clear Filter (removes results from search filter return)
  * Finish Countdown
  * Save state
    * Search/filter criteria
    * List of images
    * position in the list
  * Buttons
    * Next/Previous
    * Blacklist
    * Pause/break button
    * Volume control Slider
    * Mute
  * Session Modes
    * Endless, 1 length
    * Class, increasing lengths
    * Relaxed, no time limits
    * custom number and times
  * Image Modes
    * Flip images horizontally randomly
    * Flip images vertically randomly
    * Black & White Mode
    * Length
      * `>0`: Countdown timer
      * `<0`: Infinite time
    * Break
  * Log filenames, times, thumbnails
  * Vibrant color selection https://jariz.github.io/vibrant.js/
  * Blacklist
    * 
  * Customizable event list
    * Length
    * FlipV
    * FlipH
    * B&W
    * BreakAfterLength
    * IsBreak
* Tech
  * Electron
    * Building
      * https://github.com/electron/electron/blob/master/docs/tutorial/application-distribution.md
      * https://github.com/electron-userland/electron-forge
      * https://v6.electronforge.io/
  * Json files
  * Pages
    * Display Page
    * Setup Page