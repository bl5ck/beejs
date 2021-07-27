export default function bootstrap(selector) {
  const rootNode = document.querySelector(selector);
  if (!rootNode) {
    throw new Error(`DOM with selector "${selector}" cannot be found!`);
  }
}
