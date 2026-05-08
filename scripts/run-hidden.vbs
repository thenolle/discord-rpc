Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

exePath = fso.BuildPath(fso.GetParentFolderName(WScript.ScriptFullName), "drpc.exe")
shell.Run """" & exePath & """", 0, False