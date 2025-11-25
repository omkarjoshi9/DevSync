import Docker from 'dockerode';
import { getDockerClient } from '../config/docker.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import tar from 'tar-stream';

const LANGUAGE_CONFIGS = {
  cpp: {
    image: 'gcc:latest',
    compileCmd: ['g++', '-O0', '-o', 'main', 'main.cpp'],
    runCmd: ['./main'],
    file: 'main.cpp',
  },
  python: {
    image: 'python:3.13',
    runCmd: ['python', 'main.py'],
    file: 'main.py',
  },
  java: {
    image: 'openjdk:24',
    compileCmd: ['javac', 'Main.java'],
    runCmd: ['java', 'Main'],
    file: 'Main.java',
  },
  javascript: {
    image: 'node:20',
    runCmd: ['node', 'main.js'],
    file: 'main.js',
  },
  typescript: {
    image: 'node:20',
    compileCmd: ['npx', 'tsc', 'main.ts'],
    runCmd: ['node', 'main.js'],
    file: 'main.ts',
  },
  php: {
    image: 'php:8.4',
    runCmd: ['php', 'main.php'],
    file: 'main.php',
  },
  go: {
    image: 'golang:1.24',
    runCmd: ['go', 'run', 'main.go'],
    file: 'main.go',
  },
  kotlin: {
    image: 'openjdk:24',
    compileCmd: ['kotlinc', 'main.kt', '-include-runtime', '-d', 'main.jar'],
    runCmd: ['java', '-jar', 'main.jar'],
    file: 'main.kt',
  },
  rust: {
    image: 'rust:1.86',
    compileCmd: ['rustc', 'main.rs', '-o', 'main'],
    runCmd: ['./main'],
    file: 'main.rs',
  },
};

export class CodeExecutorService {
  static async executeCode({ language, code, input = null }) {
    const langConfig = LANGUAGE_CONFIGS[language];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const docker = getDockerClient();
    let container = null;

    try {
      await this.ensureImage(docker, langConfig.image);

      container = await docker.createContainer({
        Image: langConfig.image,
        Cmd: ['sleep', '3600'],
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        Tty: false,
        OpenStdin: true,
        StdinOnce: false,
        WorkingDir: '/tmp',
        HostConfig: {
          Memory: 512 * 1024 * 1024,
          MemorySwap: 512 * 1024 * 1024,
          CpuQuota: 100000,
          CpuPeriod: 100000,
          NetworkMode: 'none',
          ReadonlyRootfs: false,
          Tmpfs: {
            '/tmp': 'rw,noexec,nosuid,size=200m'
          },
          AutoRemove: true,
        },
      });

      await container.start();

      // Write code file using tar (more reliable than stdin)
      await this.writeFileWithEcho(container, langConfig.file, code);
      
      logger.info('Code file written to container', { file: `/tmp/${langConfig.file}` });

      // Verify file was written
      const verifyExec = await container.exec({
        Cmd: ['test', '-f', `/tmp/${langConfig.file}`],
        AttachStdout: true,
        AttachStderr: true,
      });
      
      const verifyStream = await verifyExec.start({ hijack: true, stdin: false });
      await this.streamToString(verifyStream);
      
      const verifyInspect = await verifyExec.inspect();
      
      if (verifyInspect.ExitCode !== 0) {
        throw new Error(`Failed to write file ${langConfig.file} to container`);
      }
      
      logger.info('Code file verified in container', { file: `/tmp/${langConfig.file}` });

      // Compile if needed
      if (langConfig.compileCmd) {
        logger.info('Compiling code', { language, file: langConfig.file });
        
        const compileExec = await container.exec({
          Cmd: ['sh', '-c', `cd /tmp && ${langConfig.compileCmd.join(' ')}`],
          AttachStdout: true,
          AttachStderr: true,
          WorkingDir: '/tmp',
        });

        const compileStream = await compileExec.start({ hijack: true, stdin: false });
        const compileOutput = await this.streamToString(compileStream);
        const compileInspect = await compileExec.inspect();
        
        if (compileInspect.ExitCode !== 0 || (compileOutput.stderr && compileOutput.stderr.trim())) {
          await container.remove({ force: true });
          return {
            output: null,
            error: compileOutput.stderr || compileOutput.stdout || 'Compilation failed',
            executionTime: 0,
          };
        }
      }

      // Execute code
      const runCmd = langConfig.runCmd.map(cmd => {
        if (cmd.startsWith('./')) {
          return `/tmp/${cmd.substring(2)}`;
        }
        if (cmd.startsWith('/')) {
          return cmd;
        }
        if (cmd.includes(langConfig.file)) {
          return cmd.replace(langConfig.file, `/tmp/${langConfig.file}`);
        }
        if (langConfig.compileCmd && !cmd.includes('.') && !cmd.includes('/')) {
          return `/tmp/${cmd}`;
        }
        return cmd;
      });
      
      logger.info('Running code', { language, runCmd: runCmd.join(' ') });

      const timeout = (config.execution.timeout || 10000) / 1000;
      const exec = await container.exec({
        Cmd: ['sh', '-c', `cd /tmp && timeout ${timeout} ${runCmd.join(' ')}`],
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        WorkingDir: '/tmp',
      });

      const stream = await exec.start({ hijack: true, stdin: true });
      
      // Send input if provided
      if (input) {
        stream.write(input);
      }
      stream.end();

      const startTime = Date.now();
      const executionTimeout = (config.execution.timeout || 10000) + 2000;
      let timeoutId = null;
      
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Execution timeout after ${executionTimeout}ms`));
        }, executionTimeout);
      });
      
      try {
        const output = await Promise.race([
          this.streamToString(stream),
          timeoutPromise
        ]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const execInspect = await exec.inspect();
        const executionTime = Date.now() - startTime;
        
        logger.info('Code execution completed', { 
          exitCode: execInspect.ExitCode,
          executionTime,
          hasOutput: !!output.stdout,
          hasError: !!output.stderr
        });

        try {
          await container.stop({ t: 0 });
        } catch (e) {
          // Container might have already stopped
        }

        const stdoutStr = (output.stdout || '').toString();
        const stderrStr = (output.stderr || '').toString();
        
        return {
          output: stdoutStr,
          error: stderrStr,
          executionTime,
        };
      } catch (timeoutError) {
        if (timeoutId) clearTimeout(timeoutId);
        
        try {
          await container.stop({ t: 0 });
          await container.remove({ force: true });
        } catch (e) {
          logger.warn('Error cleaning up container after timeout', { error: e.message });
        }
        
        throw timeoutError;
      }
    } catch (error) {
      logger.error('Code execution error', { language, error: error.message });
      
      if (container) {
        try {
          await container.remove({ force: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      return {
        output: null,
        error: error.message || 'Execution failed',
        executionTime: 0,
      };
    }
  }

  static async ensureImage(docker, imageName) {
    try {
      await docker.getImage(imageName).inspect();
      logger.info(`Docker image already exists: ${imageName}`);
    } catch (error) {
      logger.info(`Pulling Docker image: ${imageName} (this may take a while on first run)`);
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Docker image pull timeout after 5 minutes for ${imageName}`));
          }, 300000);
          
          docker.pull(imageName, (err, stream) => {
            if (err) {
              clearTimeout(timeout);
              return reject(err);
            }
            docker.modem.followProgress(stream, (err, output) => {
              clearTimeout(timeout);
              if (err) return reject(err);
              logger.info(`Docker image pulled successfully: ${imageName}`);
              resolve(output);
            });
          });
        });
      } catch (pullError) {
        logger.error(`Failed to pull Docker image: ${imageName}`, { error: pullError.message });
        throw pullError;
      }
    }
  }

  static async writeFileWithTar(container, filename, content) {
    return new Promise((resolve, reject) => {
      const pack = tar.pack();
      const chunks = [];
      
      // Collect all chunks from tar stream
      pack.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      // When pack is complete, send to container
      pack.on('end', async () => {
        try {
          const tarBuffer = Buffer.concat(chunks);
          logger.info('Tar archive created', { filename, bufferSize: tarBuffer.length });
          
          // Put tar archive into container
          await container.putArchive(tarBuffer, { path: '/tmp' });
          logger.info('File written via tar', { filename });
          resolve();
        } catch (err) {
          logger.error('Error putting archive to container', { 
            error: err.message,
            stack: err.stack
          });
          reject(err);
        }
      });
      
      pack.on('error', (err) => {
        logger.error('Error in tar pack stream', { error: err.message });
        reject(err);
      });
      
      // Create entry and write content
      try {
        const entry = pack.entry({ 
          name: filename,
          mode: 0o644,
          size: Buffer.byteLength(content, 'utf8')
        }, (err) => {
          if (err) {
            logger.error('Error in entry callback', { error: err.message });
            return reject(err);
          }
          // Finalize pack after entry is complete
          pack.finalize();
        });
        
        if (!entry) {
          return reject(new Error('Failed to create tar entry'));
        }
        
        // Write content as buffer and end entry
        entry.end(Buffer.from(content, 'utf8'));
      } catch (err) {
        logger.error('Error creating tar entry', { error: err.message });
        reject(err);
      }
    });
  }

  static async writeFileWithEcho(container, filename, content) {
    // Base64 encode content to avoid shell escaping issues
    const base64Content = Buffer.from(content, 'utf8').toString('base64');
    
    // Use printf instead of echo for better reliability
    const writeExec = await container.exec({
      Cmd: ['sh', '-c', `printf '%s' '${base64Content}' | base64 -d > /tmp/${filename}`],
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: '/tmp',
    });
    
    const writeStream = await writeExec.start({ hijack: true, stdin: false });
    const writeOutput = await this.streamToString(writeStream);
    const writeInspect = await writeExec.inspect();
    
    logger.info('Echo write result', {
      exitCode: writeInspect.ExitCode,
      stdout: writeOutput.stdout,
      stderr: writeOutput.stderr,
      filename
    });
    
    if (writeInspect.ExitCode !== 0) {
      throw new Error(`Echo write failed: ${writeOutput.stderr || writeOutput.stdout || 'Unknown error'}`);
    }
    
    logger.info('File written via echo/base64', { filename });
  }

  static async writeFileWithBase64(container, filename, content) {
    // Base64 encode content to avoid shell escaping issues
    const base64Content = Buffer.from(content, 'utf8').toString('base64');
    
    // Split into chunks if too large (base64 can be long)
    const chunkSize = 10000;
    if (base64Content.length > chunkSize) {
      // Write in chunks
      const writeExec = await container.exec({
        Cmd: ['sh', '-c', `rm -f /tmp/${filename} && touch /tmp/${filename}`],
        AttachStdout: true,
        AttachStderr: true,
      });
      await this.streamToString(await writeExec.start({ hijack: true, stdin: false }));
      
      for (let i = 0; i < base64Content.length; i += chunkSize) {
        const chunk = base64Content.substring(i, i + chunkSize);
        const appendExec = await container.exec({
          Cmd: ['sh', '-c', `echo '${chunk}' >> /tmp/${filename}.b64`],
          AttachStdout: true,
          AttachStderr: true,
        });
        const appendOutput = await this.streamToString(await appendExec.start({ hijack: true, stdin: false }));
        if (appendOutput.stderr) {
          throw new Error(`Failed to write chunk: ${appendOutput.stderr}`);
        }
      }
      
      // Decode base64 file
      const decodeExec = await container.exec({
        Cmd: ['sh', '-c', `base64 -d /tmp/${filename}.b64 > /tmp/${filename} && rm /tmp/${filename}.b64`],
        AttachStdout: true,
        AttachStderr: true,
      });
      const decodeOutput = await this.streamToString(await decodeExec.start({ hijack: true, stdin: false }));
      const decodeInspect = await decodeExec.inspect();
      
      if (decodeInspect.ExitCode !== 0) {
        throw new Error(`Base64 decode failed: ${decodeOutput.stderr || 'Unknown error'}`);
      }
    } else {
      // Small file - write directly
      const writeExec = await container.exec({
        Cmd: ['sh', '-c', `echo '${base64Content}' | base64 -d > /tmp/${filename}`],
        AttachStdout: true,
        AttachStderr: true,
      });
      
      const writeStream = await writeExec.start({ hijack: true, stdin: false });
      const writeOutput = await this.streamToString(writeStream);
      const writeInspect = await writeExec.inspect();
      
      if (writeInspect.ExitCode !== 0) {
        throw new Error(`Base64 write failed: ${writeOutput.stderr || 'Unknown error'}`);
      }
    }
    
    logger.info('File written via base64', { filename });
  }

  static async writeFileWithBase64(container, filename, content) {
    // Base64 encode to avoid shell escaping issues
    const base64Content = Buffer.from(content, 'utf8').toString('base64');
    
    // Use printf instead of echo for better handling
    const writeExec = await container.exec({
      Cmd: ['sh', '-c', `printf '%s' '${base64Content}' | base64 -d > /tmp/${filename}`],
      AttachStdout: true,
      AttachStderr: true,
    });
    
    const writeStream = await writeExec.start({ hijack: true, stdin: false });
    const writeOutput = await this.streamToString(writeStream);
    const writeInspect = await writeExec.inspect();
    
    if (writeInspect.ExitCode !== 0) {
      throw new Error(`Base64 write failed: ${writeOutput.stderr || writeOutput.stdout || 'Unknown error'}`);
    }
    
    logger.info('File written via base64', { filename });
  }

  static async streamToString(stream) {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let streamEnded = false;

      const finish = () => {
        if (streamEnded) return;
        streamEnded = true;
        resolve({ stdout: stdout || '', stderr: stderr || '' });
      };

      stream.on('data', (chunk) => {
        // Docker streams use multiplexed format
        // [STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4, PAYLOAD...]
        // STREAM_TYPE: 1 = stdout, 2 = stderr
        if (chunk.length >= 8) {
          const streamType = chunk[0];
          const payload = chunk.slice(8);
          
          if (streamType === 1) {
            stdout += payload.toString();
          } else if (streamType === 2) {
            stderr += payload.toString();
          } else {
            stdout += chunk.toString();
          }
        } else {
          stdout += chunk.toString();
        }
      });

      stream.on('end', finish);
      stream.on('close', finish);

      stream.on('error', (error) => {
        logger.error('Stream error', { error: error.message });
        if (!streamEnded) {
          streamEnded = true;
          reject(error);
        }
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!streamEnded) {
          logger.warn('Stream timeout - finishing anyway');
          finish();
        }
      }, 30000);
    });
  }
}