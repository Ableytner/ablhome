import { isService, type Service } from './types';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app element');
}

const services = (window.__SERVICES__ ?? []).filter(isService);

const header = document.createElement('h1');
header.className = 'app-title';
header.textContent = "Ableytners' HomeLab";
app.appendChild(header);

if (services.length === 0) {
  const empty = document.createElement('p');
  empty.className = 'empty';
  empty.textContent = 'No services configured.';
  app.appendChild(empty);
} else {
  // Group services by `group`, preserving first-appearance order.
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    const key = service.group?.trim() || 'Other';
    const list = groups.get(key);
    if (list) {
      list.push(service);
    } else {
      groups.set(key, [service]);
    }
  }

  for (const [groupName, groupServices] of groups) {
    const section = document.createElement('section');
    section.className = 'group';

    const title = document.createElement('h2');
    title.className = 'group-title';
    title.textContent = groupName;
    section.appendChild(title);

    const grid = document.createElement('nav');
    grid.className = 'grid';
    grid.setAttribute('aria-label', groupName);
    for (const service of groupServices) {
      grid.appendChild(createCard(service));
    }
    section.appendChild(grid);

    app.appendChild(section);
  }
}

const footer = document.createElement('footer');
footer.className = 'footer';
footer.textContent = 'Ableytners\' HomeLab';
app.appendChild(footer);

function createCard(service: Service): HTMLAnchorElement {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = service.url;
  card.title = service.url;

  const image = document.createElement('img');
  image.className = 'card-image';
  image.src = service.image;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 240;
  image.height = 120;
  // The image is decorative (the name below is the label), so a broken
  // image should not show the browser's broken-image chrome.
  image.addEventListener('error', () => {
    image.style.visibility = 'hidden';
  });

  const label = document.createElement('span');
  label.className = 'card-label';

  const name = document.createElement('span');
  name.className = 'card-name';
  name.textContent = service.name;
  label.append(name);

  const description = service.description?.trim();
  if (description) {
    const desc = document.createElement('span');
    desc.className = 'card-desc';
    desc.textContent = description;
    label.append(desc);
  }

  card.append(image, label);
  return card;
}
