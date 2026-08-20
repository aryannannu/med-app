const { execSync } = require('child_process');

const jdkPath = 'C:\\Program Files\\Microsoft\\jdk-17.0.20.8-hotspot';
const binPath = `${jdkPath}\\bin`;

try {
  // Set JAVA_HOME in User environment
  execSync(`powershell -Command "[Environment]::SetEnvironmentVariable('JAVA_HOME', '${jdkPath}', 'User')"`);
  console.log('Set JAVA_HOME:', jdkPath);

  // Update PATH
  execSync(`powershell -Command "$p = [Environment]::GetEnvironmentVariable('Path', 'User'); if ($p -notlike '*jdk-17*') { [Environment]::SetEnvironmentVariable('Path', $p + ';${binPath}', 'User') }"`);
  console.log('Added to User PATH:', binPath);

  console.log('Java 17 successfully registered in Windows environment!');
} catch (err) {
  console.error('Error setting Java env:', err);
}
