const fs = require('fs');
const { spawn } = require('child_process');

class ProcessStatistics {
    static async getProcessStatistics(command, args = [], timeout = Infinity) {
        const start = new Date();
        const commandSuccess = true;

        try {
            const process = spawn(command, args);
            const processPromise = new Promise((resolve, reject) => {
                let processOutput = '';

                process.stdout.on('data', (data) => {
                    processOutput += data;
                });

                process.on('close', (code) => {
                    if (code === 0) {
                        resolve(processOutput);
                    } else {
                        reject(`Process exited with code ${code}`);
                    }
                });
            });

            let processOutput;
            if (timeout === Infinity) {
                processOutput = await processPromise;
            } else {
                processOutput = await Promise.race([
                    processPromise,
                    new Promise((resolve, reject) => {
                        setTimeout(() => reject('Process timeout'), timeout);
                    }),
                ]);
            }

            const duration = new Date() - start;
            const success = true;

            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const filename = `${timestamp}${command.replace(/\s+/g, '-')}.json`;
            const filePath = `./logs/${filename}`;

            const statistics = {
                start: start.toISOString(),
                duration,
                success,
                commandSuccess,
                output: processOutput.trim(),
            };

            fs.writeFileSync(filePath, JSON.stringify(statistics));
            console.log(`Process statistics saved: ${filePath}`);
        } catch (error) {
            const duration = new Date() - start;
            const success = false;
            const commandSuccess = false;

            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const filename = `${timestamp}${command.replace(/\s+/g, '-')}.json`;
            const filePath = `./logs/${filename}`;

            const statistics = {
                start: start.toISOString(),
                duration,
                success,
                commandSuccess,
                error: error.toString(),
            };

            fs.writeFileSync(filePath, JSON.stringify(statistics));
            console.error(`Error occurred. Process statistics saved: ${filePath}`);
        }
    }
}
ProcessStatistics.getProcessStatistics('ls', ['-l'], 5000);
