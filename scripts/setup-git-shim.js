const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA;
const localAppData = process.env.LOCALAPPDATA;

const gitExe = path.join(localAppData, 'Programs', 'Git', 'cmd', 'git.exe');
const npmDir = path.join(appData, 'npm');

if (fs.existsSync(gitExe)) {
  const cmdContent = `@echo off\r\n"${gitExe}" %*\r\n`;
  fs.writeFileSync(path.join(npmDir, 'git.cmd'), cmdContent, 'utf8');
  console.log('Created:', path.join(npmDir, 'git.cmd'));

  const ps1Content = `& "${gitExe}" $args\r\n`;
  fs.writeFileSync(path.join(npmDir, 'git.ps1'), ps1Content, 'utf8');
  console.log('Created:', path.join(npmDir, 'git.ps1'));

  console.log('Git command is now available immediately in any terminal!');
} else {
  console.error('Git executable not found at:', gitExe);
}
