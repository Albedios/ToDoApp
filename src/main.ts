import './style.css';
import './components/TodoList';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <todo-list></todo-list>
`;
