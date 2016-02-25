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
  npm install -g grunt-cli bower ionic cordova
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
  
  _Compile Project_
  ```
  grunt serve
  ```  
  _Compile, Start and Show ConsoleLogs Project_
  ```
  grunt serve --consolelogs
  ```  
  _Start Project on Web Browser_
  ```
  ionic serve
  ```  
  _Start Project on Web Browser and Compare Android - IOS Views_
  ```
  ionic serve --labs
  ```  
  _Compile and Start Project on IOS Emulator_
  ```
  grunt emulate:ios
  ```  
  _Compile and Start Project on Android Emulator_
  ```
  grunt emulate:android
  ```  
  _Compile, Start and livereload Project on IOS Emulator_
  ```
  grunt emulate:ios --livereload
  ```  
  _Compile, Start and livereload Project on Android Emulator_
  ```
  grunt emulate:android --livereload
  ```  
  _Compile, Start and Show ConsoleLogs Project on Android Emulator_
  ```
  grunt emulate:android --consolelogs
  ```  
  _Compile and Start Project on IOS IPad Emulator_
  ```
  grunt emulate:ios --target=iPad -lc
  ```  
  _Compile and Start Project on IOS iPhone-5s Emulator_
  ```
  grunt emulate:ios --target=iPhone-5s -lc
  ```  
  _Compress Project_
  ```
  grunt compress
  ```  
  _Build Project for IOS Platform_
  ```
  grunt build:ios
  ```  
  _Build Project for Android Platform_
  ```
  grunt build:android
  ```  
  _Launches the configured "karma" test running framework using PhantomJS_
  ```
  grunt karma
  ```
  
## Copyright and Licence
  Copyright (c) 2016 Telekurye Co.
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
