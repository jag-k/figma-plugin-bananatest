import "./styles/styles.scss";

const form = document.querySelector('form') as HTMLFormElement;
const selectionText = document.querySelector('.selection-text') as HTMLElement;
const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
const totalTextNodesOutput = document.querySelector('.total-text-nodes output') as HTMLElement;

let selected = false;

function post(type: string, data: any) {
  parent.postMessage({pluginMessage: {type, data}}, '*')
}

window.addEventListener("message", (event) => {
  const {data: {pluginMessage: {type: msgType, data}}} = event
  switch (msgType) {

    case "change-selection": {
      const {count: selectedCount, textNodesCount} = data;
      const nodeStr = (count: number) => `${count} node${count === 1 ? '' : 's'}`

      selectionText.innerHTML = selectedCount
        ? `You selected <b>${nodeStr(selectedCount)}</b>!`
        : 'Please, select frames or texts to replace!'

      totalTextNodesOutput.innerText = textNodesCount;
      selected = !!selectedCount;
      submitButton.disabled = !selectedCount;
      break;
    }
  }
})

form.addEventListener('submit', (event) => {
  event.preventDefault();
  // @ts-ignore
  selected && post('submit-form', Object.fromEntries(new FormData(form)))
})
