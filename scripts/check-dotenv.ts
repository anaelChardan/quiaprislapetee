import { cwd } from 'process';

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

const LIST_ENV_FILES = ['.env', '.env.test'];
LIST_ENV_FILES.forEach(async (envFile) => await checkEnvFile(envFile));

async function checkEnvFile(filename: string) {
  const currentDir = cwd();
  const directoryFiles = fs.readdirSync(currentDir);
  const dotenvExamplePath = path.join(currentDir, `${filename}.example`);
  const dotenvPath = path.join(currentDir, filename);
  const dotenvExample = fs.readFileSync(dotenvExamplePath, 'utf8');
  if (!directoryFiles.includes(filename)) {
    console.log(''); // Intentional adding extra spacing to make the output more readable.
    console.log(`Service does not have a ${filename} file.`);
    const affirmative = await askYesNoQuestion('Do you want to create it?');
    if (affirmative) {
      fs.writeFileSync(dotenvPath, dotenvExample, 'utf8');
      console.log(`File ${dotenvPath} filled with content of ${filename}.example.`);
    } else {
      console.log(`Skipped creation of file ${dotenvPath}.`);
    }
  } else {
    const dotenv = fs.readFileSync(dotenvPath, 'utf8');

    const secretsInDotEnv = parseDotEnvToKeyValueArray(dotenv);
    const secretsInDotEnvExample = parseDotEnvToKeyValueArray(dotenvExample);

    const missingKeys = secretsInDotEnvExample
      .filter((secret) => !secretsInDotEnv.some((s) => s.key === secret.key))
      .map((secret) => secret.key);

    const differentValues = secretsInDotEnvExample
      .filter((secret) => {
        const matchingSecret = secretsInDotEnv.find((s) => s.key === secret.key);
        return matchingSecret && matchingSecret.value !== secret.value;
      })
      .map((secret) => secret.key);

    if (missingKeys.length === 0 && differentValues.length === 0) {
      console.log(`File ${dotenvPath} already up to date.`);
    } else {
      console.log(`Service has a ${filename} file that does not match the ${filename}.example.`);
      console.log(''); // Intentional adding extra spacing to make the output more readable.

      if (missingKeys.length > 0) {
        console.log(
          `The following keys are missing: ${missingKeys
            .map((value) => chalk.red(value))
            .join(', ')}`,
        );
      }

      if (differentValues.length > 0) {
        console.log(
          `The following keys have different values: ${differentValues
            .map((value) => chalk.green(value))
            .join(', ')}`,
        );
      }

      console.log(''); // Intentional to provide a space between the lists and the question.

      const affirmative = await askYesNoQuestion(
        `Do you want to replace ${filename} with the content of ${filename}.name?`,
      );

      if (affirmative) {
        fs.writeFileSync(dotenvPath, dotenvExample, 'utf8');
        console.log(`File ${dotenvPath} filled with content of ${filename}.example.`);
      } else {
        console.log(`File ${dotenvPath} left untouched.`);
      }
    }
  }
}

function parseDotEnvToKeyValueArray(dotenv: string) {
  return dotenv
    .split('\n')
    .filter((line: string) => line.match(/^\w+=/))
    .map((line: string) => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      return { key, value };
    });
}

function askQuestion(question: string, defaultValue: string): Promise<string> {
  if (process.env.CHECK_DOTENV_NO_INTERACTION && process.env.CHECK_DOTENV_NO_INTERACTION === '1') {
    return new Promise((resolve) => resolve(defaultValue));
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    }),
  );
}

async function askYesNoQuestion(question: string) {
  const answer = await askQuestion(`${question} [Y/n]`, 'y');
  return !answer || answer.toLowerCase() === 'y';
}
