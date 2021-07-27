export default function bootstrap(selector: string, appComponent: string) {
  const rootNode = document.querySelector(selector);
  if (!rootNode) {
    throw new Error(`DOM with selector "${selector}" cannot be found!`);
  }
  if (!appComponent) {
    throw new Error(`Invalid app component "${appComponent}"!`);
  }
}
