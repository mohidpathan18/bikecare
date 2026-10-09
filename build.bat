@echo off
setlocal
set "JAVA_HOME=C:\Program Files\Java\jdk-27"
set "PROJECT_DIR=%~dp0"
set "SRC=%PROJECT_DIR%src\main\java\com\bikecare\BikeCareApplication.java"
set "OUT=%PROJECT_DIR%src\main\java\com\bikecare"
set "SQLITE=%PROJECT_DIR%src\main\resources\sqlite-jdbc.jar"
if not exist "%JAVA_HOME%\bin\javac.exe" (
  echo JDK compiler not found at "%JAVA_HOME%\bin\javac.exe".
  exit /b 1
)
if not exist "%SQLITE%" (
  echo SQLite JDBC driver is missing at "%SQLITE%".
  echo SQLite features cannot run without that local JDBC JAR.
  exit /b 1
)
"%JAVA_HOME%\bin\javac.exe" --add-modules jdk.httpserver -encoding UTF-8 -d "%OUT%" "%SRC%"
if errorlevel 1 exit /b 1
echo BikeCare compiled successfully with JDK 27.
