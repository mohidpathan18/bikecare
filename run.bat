@echo off
setlocal
call "%~dp0build.bat"
if errorlevel 1 exit /b 1
set "JAVA_HOME=C:\Program Files\Java\jdk-27"
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"
set "APP_CP=%PROJECT_DIR%src\main\java\com\bikecare;%PROJECT_DIR%src\main\resources\sqlite-jdbc.jar"
"%JAVA_HOME%\bin\java.exe" --add-modules jdk.httpserver --enable-native-access=ALL-UNNAMED -cp "%APP_CP%" BikeCareApplication
