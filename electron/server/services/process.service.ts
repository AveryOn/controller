import { type ChildProcess, fork } from 'child_process';

// запуск дочернего процесса
export function execProcess(filename: string): ChildProcess {
    const process = fork(filename);
    return process;
}