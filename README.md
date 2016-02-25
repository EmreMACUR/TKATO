> Project Structure
  ├── Gruntfile.js            - Configuration of all Grunt tasks
  ├── package.json            - Dev dependencies and required Cordova plugins
  ├── bower.json              - Lists front-end dependencies
  ├── config.xml              - Global Cordova configuration
  ├── .gitignore              - Best practices for checking in Cordova apps
  ├── resources/              - Scaffolded placeholder Icons and Splashscreens
  │   ├── ios/
  │   ├── android/
  ├── app/
  │   ├── index.html          - Main Ionic app entry point
  │   ├── lib/                - Libraries managed by Bower
  │   ├── scripts/            - Custom AngularJS Scripts
  │   ├── styles/             - Stylesheets
  │   ├── templates/          - HTML views
  ├── platforms/              - Targeted operating systems
  ├── plugins/                - Native plugins
  ├── hooks/                  - Cordova lifecycle hooks
  ├── merges/                 - Platform specific overrides
  ├── coverage/               - Istanbul reports
  ├── test/                   - Unit tests
  │   ├── spec/
  ├── www/                    - Copied from app/ to be used by Cordova

> Project Requirements
  --> npm install -g grunt-cli bower ionic
  --> npm install
  --> bower install

> Workflow Commands
  > Add Platforms
    --> grunt platform:add:ios
    --> grunt platform:add:android
  > Add Cordova Plugins (examples)
    --> grunt plugin:add:org.apache.cordova.device
    --> grunt plugin:add:https://github.com/EddyVerbruggen/cordova-plugin-actionsheet.git
    --> grunt plugin:add:org.apache.cordova.splashscreen
  > Add Splashscreen and App Icon
    --> ionic resources
  > Start, Emulate, Compile And Build Project
    --> grunt serve // Compile Project
    --> grunt serve --consolelogs // Compile, Start and Show ConsoleLogs Project
    --> ionic serve // Start Project on Web Browser
    --> ionic serve --labs // Start Project on Web Browser and Compare Android - IOS Views
    --> grunt emulate:ios // Compile and Start Project on IOS Emulator
    --> grunt emulate:android // Compile and Start Project on Android Emulator
    --> grunt emulate:ios --livereload // Compile, Start and livereload Project on IOS Emulator
    --> grunt emulate:android --livereload // Compile, Start and livereload Project on Android Emulator
    --> grunt emulate:android --consolelogs // Compile, Start and Show ConsoleLogs Project on Android Emulator
    --> grunt emulate:ios --target=iPad -lc // Compile and Start Project on IOS IPad Emulator
    --> grunt emulate:ios --target=iPhone-5s -lc // Compile and Start Project on IOS iPhone-5s Emulator
    --> grunt compress // Compress Project
    --> grunt build:ios // Build Project for IOS Platform
    --> grunt build:android // Build Project for Android Platform
    --> grunt karma // Launches the configured "karma" test running framework using PhantomJS
