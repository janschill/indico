import SolidAutocomplete from 'solid-autocomplete';

document.addEventListener('DOMContentLoaded', async () => {
  observeFormCreation();
});

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
            solidAutocomplete.setupSolidAutocomplete();
          }
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  // observer.disconnect();
}
