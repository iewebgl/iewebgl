REM "%ProgramFiles(x86)%\Microsoft SDKs\Windows\v7.0A\Bin\signtool.exe" sign /f IEWebGL2012.pfx /t http://timestamp.comodoca.com/authenticode /p @Rawacosi82 "..\bin\win32\release\iewebgl.dll"
REM "%ProgramFiles(x86)%\Microsoft SDKs\Windows\v7.0A\Bin\signtool.exe" sign /f IEWebGL2012.pfx /t http://timestamp.comodoca.com/authenticode /p @Rawacosi82 "..\bin\x64\release\iewebgl.dll"

"%ProgramFiles(x86)%\Inno Setup 5\iscc.exe" /O".\" "setup.iss"

REM "%ProgramFiles(x86)%\Microsoft SDKs\Windows\v7.0A\Bin\signtool.exe" sign /f IEWebGL2012.pfx /t http://timestamp.comodoca.com/authenticode /p @Rawacosi82 "iewebgl.exe"

makecab /f cab.txt

REM "%ProgramFiles(x86)%\Microsoft SDKs\Windows\v7.0A\Bin\signtool.exe" sign /f IEWebGL2012.pfx /t http://timestamp.comodoca.com/authenticode /p @Rawacosi82 "iewebgl.cab"

move iewebgl.cab ..\bin\
move iewebgl.exe ..\bin\