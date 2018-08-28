let node;

const makeNode = () => {
  const container = document.createElement('div');
  container.id = 'network-warning';
  container.classList.add('network-warning', 'no-animate');
  container.role= 'dialog';
  container.setAttribute('aria-live', 'polite');

  const inner = document.createElement('div');
  container.appendChild(inner);

  inner.innerHTML = [
    'You are currently offline. Don\'t worry − your changes have been saved ',
    'locally and will be synced as soon as possible.',
    'This message will not be displayed again during this offline session.'
  ].join(' ');

  const button = document.createElement('button');
  inner.appendChild(button);

  button.id = 'close-network-warning';
  button.tabIndex = '-1';
  button.setAttribute('aria-label', 'Close');

  container.enableAnimation = () => {
    container.classList.remove('no-animate');
  };

  container.activate = prevElement => {
    if (localStorage.getItem('user_warned') === 'true') return;
    button.onclick = event => {
      button.blur();
      if (prevElement) prevElement.focus();
      event.preventDefault();
    };
    localStorage.setItem('user_warned', true);
    button.focus();
  };

  container.deactivate = () => void button.blur();

  return container;
};

export default () => {
  if (!node) node = makeNode();
  return node;
};
