import {useQuery} from "react-query";

export default function useVersion() {
  const {isLoading, error, data} = useQuery('app-version', () => fetch(`asset-manifest.json`).then(r => r.json()));
  try {
    return isLoading ? '...' : error ? 'error' : data.entrypoints[1].split('/')[2].split('.')[1];
  } catch (e) {
    console.error(e);
  }
  return "error!";
}
