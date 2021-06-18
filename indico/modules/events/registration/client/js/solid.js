import SolidAutocomplete from 'solid-autocomplete';

document.addEventListener('DOMContentLoaded', async () => {
  observeFormCreation();
});

function triggerInputEvent(inputs) {
  for (let i = 0; i < inputs.length; i++) {
    const element = inputs[i];
    [element, element.parentNode].forEach(node => {
      if ('createEvent' in document) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent('input', false, true);
        node.dispatchEvent(evt);
      } else {
        node.fireEvent('oninput');
      }
    });
  }
}

function observeFormCreation() {
  const formId = 'registrationForm';
  const $conferencePage = document.querySelector('.conference-page');
  const targetNode = $conferencePage;
  const config = {attributes: false, childList: true, subtree: true};

  const callback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.id === formId) {
            observer.disconnect();
            const solidAutocomplete = new SolidAutocomplete({form: node});
            solidAutocomplete.createAutocompleteDomControls(node);
            solidAutocomplete.setupSolidAutocomplete(triggerInputEvent);
          }
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  // observer.disconnect();
}
