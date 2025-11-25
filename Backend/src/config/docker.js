import Docker from 'dockerode';
import config from './env.js';
import os from 'os';

let dockerClient = null;

export const getDockerClient = () => {
  if (dockerClient) {
    return dockerClient;
  }

  try {
    // Determine Docker connection based on OS
    const isWindows = os.platform() === 'win32';
    
    let dockerOptions;
    
    if (isWindows) {
      // Windows: Docker Desktop uses named pipe
      dockerOptions = {
        socketPath: '\\\\.\\pipe\\docker_engine',
      };
    } else {
      // Linux/Mac: Use Unix socket
      dockerOptions = {
        socketPath: config.docker.socketPath || '/var/run/docker.sock',
      };
    }

    dockerClient = new Docker(dockerOptions);
    return dockerClient;
  } catch (error) {
    console.error('Docker client initialization error:', error);
    throw new Error('Docker is not available');
  }
};

export default getDockerClient;

