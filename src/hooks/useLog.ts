import {atom, useRecoilState, useSetRecoilState} from "recoil";
import {useCallback} from "react";

const logsAtom = atom<string[]>({
  key: 'logs',
  default: [],
});

export default function useLog(prefix: string = "") {
  const [logs, setLogs] = useRecoilState(logsAtom);
  const updateLogs = useSetRecoilState(logsAtom); // TODO setLogs what's difference?

  const log = useCallback((...args: any[]) => {
    const newLog = `${new Date().toISOString()} [INFO]  [${prefix}]\t: ` + args.toString();
    updateLogs(logs => ([...logs, newLog]));
    console.log(...args);
  }, [prefix, updateLogs]);
  const error = useCallback((...args: any[]) => {
    const newLog = `${new Date().toISOString()} [ERROR] [${prefix}]\t: ` + args.toString();
    updateLogs(logs => ([...logs, newLog]));
    console.error(...args);
  }, [prefix, updateLogs]);

  return {logs, log, error};
}
