import './styles/styles.css';
import { createNavbar } from './components/navbar';
import { createFooter } from './components/footer';
import { initRouter, navigateTo } from './router/router';

function bootstrap() 
{
  const app = document.getElementById('app')!;
  app.innerHTML = ''; // reset

  // Layout de base
  const header = document.createElement('header');
  const main = document.createElement('main');
  const footer = document.createElement('footer');

  header.className = 'border-b bg-white';
  main.className = 'flex-1 py-8';
  footer.className = 'border-t bg-white';

  header.appendChild(createNavbar((path) => navigateTo(path)));
  footer.appendChild(createFooter());

  app.append(header, main, footer);

  // Router
  initRouter({
    mount: main
  });
}

bootstrap();
