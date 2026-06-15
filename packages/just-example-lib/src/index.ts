import clippy from './clippy.jpg';
import './style1.css';
// style2.scss.ts is created by the sass task
import './style2.scss';

export { sub } from './sub/sub';

export const sample = 5;

const root = document.createElement('div');
root.innerHTML = `
  <h1>Hello, world!</h1>
  <button class="btn">button</button>
  <img src="${clippy}" alt="Clippy" />
`;
document.body.appendChild(root);
