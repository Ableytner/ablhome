// Dev stub for local development (npm run dev).
// In the container, the entrypoint overwrites this file with data
// generated from the mounted /config/services.yaml.
// Keep in sync with config/services.yaml.
window.__SERVICES__ = [
  {
    name: 'GitLab',
    group: 'Development',
    url: 'https://git.example.com',
    image: 'https://git.example.com/assets/logo.png',
    description: 'Source code and CI',
    description_de: 'Quellcode und CI',
  },
  {
    name: 'Jira',
    group: 'Development',
    url: 'https://jira.example.com',
    image: 'https://jira.example.com/images/jira-logo.png',
    description: 'Issue and project tracking',
    description_de: 'Issue- und Projektverfolgung',
  },
  {
    name: 'Open-WebUI',
    group: 'AI',
    url: 'https://open-webui.example.com',
    image: 'https://open-webui.example.com/logo.png',
    description: 'AI chats and automation',
    description_de: 'KI-Chats und Automatisierung',
  },
  {
    name: 'Grafana',
    group: 'Monitoring',
    url: 'https://grafana.example.com',
    image: 'https://grafana.example.com/static/logo.png',
    description: 'Dashboards and metrics',
    description_de: 'Dashboards und Metriken',
  },
];
