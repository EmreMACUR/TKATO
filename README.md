## Project Structure
  * Gruntfile.js              __Configuration of all Grunt tasks__
  * package.json              __Dev dependencies and required Cordova plugins__
  * bower.json                __Lists front-end dependencies__
  * config.xml                __Global Cordova configuration__
  * .gitignore                __Best practices for checking in Cordova apps__
  * resources/                __Scaffolded placeholder Icons and Splashscreens__
    * ios/
    * android/
  * app/
    * index.html              __Main Ionic app entry point__
    * lib/                    __Libraries managed by Bower__
    * scripts/                __Custom AngularJS Scripts__
    * styles/                 __Stylesheets__
    * templates/              __HTML views__
  * platforms/                __Targeted operating systems__
  * plugins/                  __Native plugins__
  * hooks/                    __Cordova lifecycle hooks__
  * merges/                   __Platform specific overrides__
  * coverage/                 __Istanbul reports__
  * test/                     __Unit tests__
    * spec/
  * www/                      __Copied from app/ to be used by Cordova__

## Project Requirements
  ``` 
  npm install -g grunt-cli bower ionic
  npm install
  bower install
  ```

## Workflow Commands
   > Add Platforms 
   -------------
    ``` 
    grunt platform:add:ios
    grunt platform:add:android
    ```
  > Add Cordova Plugins (examples)
  ------------------------------
  ```
    grunt plugin:add:org.apache.cordova.device
    grunt plugin:add:https://github.com/EddyVerbruggen/cordova-plugin-actionsheet.git
    grunt plugin:add:org.apache.cordova.splashscreen
   ```
  > Add Splashscreen and App Icon
  -----------------------------
    ``` 
    ionic resources
    ```
  > Start, Emulate, Compile And Build Project
  -----------------------------------------
  ```
     grunt serve // Compile Project
     grunt serve --consolelogs // Compile, Start and Show ConsoleLogs Project
     ionic serve // Start Project on Web Browser
     ionic serve --labs // Start Project on Web Browser and Compare Android - IOS Views
     grunt emulate:ios // Compile and Start Project on IOS Emulator
     grunt emulate:android // Compile and Start Project on Android Emulator
     grunt emulate:ios --livereload // Compile, Start and livereload Project on IOS Emulator
     grunt emulate:android --livereload // Compile, Start and livereload Project on Android Emulator
     grunt emulate:android --consolelogs // Compile, Start and Show ConsoleLogs Project on Android Emulator
     grunt emulate:ios --target=iPad -lc // Compile and Start Project on IOS IPad Emulator
     grunt emulate:ios --target=iPhone-5s -lc // Compile and Start Project on IOS iPhone-5s Emulator
     grunt compress // Compress Project
     grunt build:ios // Build Project for IOS Platform
     grunt build:android // Build Project for Android Platform
     grunt karma // Launches the configured "karma" test running framework using PhantomJS
  ```
