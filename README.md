## Project Structure
  * Gruntfile.js   ..........           Configuration of all Grunt tasks
  * package.json   ..........           Dev dependencies and required Cordova plugins
  * bower.json     ..........           Lists front-end dependencies
  * config.xml     ..........           Global Cordova configuration
  * .gitignore     ..........           Best practices for checking in Cordova apps
  * resources/     ..........           Scaffolded placeholder Icons and Splashscreens
    * ios/
    * android/
  * app/
    * index.html   ..........           Main Ionic app entry point
    * lib/         ..........           Libraries managed by Bower
    * scripts/     ..........           Custom AngularJS Scripts
    * styles/      ..........           Stylesheets
    * templates/   ..........           HTML views
  * platforms/     ..........           Targeted operating systems
  * plugins/       ..........           Native plugins
  * hooks/         ..........           Cordova lifecycle hooks
  * merges/        ..........           Platform specific overrides
  * coverage/      ..........           Istanbul reports
  * test/          ..........           Unit tests
    * spec/
  * www/           ..........          Copied from app/ to be used by Cordova

## Project Requirements
  ``` 
  npm install -g grunt-cli bower ionic
  npm install
  bower install
  ```

## Workflow Commands
   __Add Platforms__
   -----------------
   
  ``` 
  grunt platform:add:ios
  grunt platform:add:android
  ```
    
  __Add Cordova Plugins (examples)__
  ----------------------------------
  
  ```
  grunt plugin:add:org.apache.cordova.device
  grunt plugin:add:https://github.com/EddyVerbruggen/cordova-plugin-actionsheet.git
  grunt plugin:add:org.apache.cordova.splashscreen
  ```
   
  __Add Splashscreen and App Icon__
  ---------------------------------
  
  ``` 
  ionic resources
  ```
    
  __Start, Emulate, Compile And Build Project__
  ---------------------------------------------
  
  >Compile Project
  ```
  grunt serve
  ```
  
  >Compile, Start and Show ConsoleLogs Project
  ```
  grunt serve --consolelogs
  ```
  
  >Start Project on Web Browser
  ```
  ionic serve
  ```
  
  >Start Project on Web Browser and Compare Android - IOS Views
  ```
  ionic serve --labs
  ```
  
  >Compile and Start Project on IOS Emulator
  ```
  grunt emulate:ios
  ```
  
  >Compile and Start Project on Android Emulator
  ```
  grunt emulate:android
  ```
  
  >Compile, Start and livereload Project on IOS Emulator
  ```
  grunt emulate:ios --livereload
  ```
  
  >Compile, Start and livereload Project on Android Emulator
  ```
  grunt emulate:android --livereload
  ```
  
  >Compile, Start and Show ConsoleLogs Project on Android Emulator
  ```
  grunt emulate:android --consolelogs
  ```
  
  >Compile and Start Project on IOS IPad Emulator
  ```
  grunt emulate:ios --target=iPad -lc
  ```
  
  >Compile and Start Project on IOS iPhone-5s Emulator
  ```
  grunt emulate:ios --target=iPhone-5s -lc
  ```
  
  >Compress Project
  ```
  grunt compress
  ```
  
  >Build Project for IOS Platform
  ```
  grunt build:ios
  ```
  
  >Build Project for Android Platform
  ```
  grunt build:android
  ```
  
  >Launches the configured "karma" test running framework using PhantomJS
  ```
  grunt karma
  ```
