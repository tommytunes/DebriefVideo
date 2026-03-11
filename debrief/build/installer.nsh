!macro customInit
  ; Kill all instances + child processes at the earliest point
  ; This gives maximum time for file handles to release before uninstallOldVersion runs
  nsExec::Exec `taskkill /IM "Sailing Debrief.exe" /T /F`
  Sleep 2000
!macroend

!macro customCheckAppRunning
  ; Kill again in case anything respawned, skip default dialog-based check
  nsExec::Exec `taskkill /IM "Sailing Debrief.exe" /T /F`
  Sleep 1000
!macroend
