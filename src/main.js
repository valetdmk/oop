import './style.css';
import { elementMethods } from './baseline.js';
import { renderAddForm, renderWordList } from './renderers.js';
import { WordList } from './wordlist.js';

const { first } = elementMethods();
const root = first("#root");
const gridContainer = first("#grid-container");
const placementModal = first("#placement-modal");

root.innerHTML = `
  <div id="app">
    <div class="words"></div>
    <div class="add-form"></div>
  </div>
`;

const app = root.first("#app");

const gridBtn = document.createElement('button');
gridBtn.id = 'grid-btn';
gridBtn.textContent = 'Grid';
gridBtn.style.margin = '10px';
app.appendChild(gridBtn);

let currentPosition = { row: 0, col: 0 };

const generateGrid = () => {
  const grid = first("#grid");
  const realGrid = grid.el;
  if (realGrid.rows.length > 0) return;

  for (let i = 0; i < 10; i++) {
    const row = realGrid.insertRow();
    for (let j = 0; j < 10; j++) {
      const cell = row.insertCell();
      cell.classList.add('cell');
      cell.contentEditable = false;
      cell.textContent = '';

      cell.addEventListener('click', (e) => {
  const td = e.currentTarget; // ВСЕГДА TD
  const tr = td.parentElement;

  currentPosition.row = tr.rowIndex;
  currentPosition.col = td.cellIndex;

  openPlacementModal();
});
    }
  }
};

const openPlacementModal = () => {
  const grid = first("#grid").el;
  const startRow = currentPosition.row;
  const startCol = currentPosition.col;
  const isFilled = grid.rows[startRow].cells[startCol].textContent !== '';

  let horizontalWord = '';
  let verticalWord = '';

  if (isFilled) {
    for (let j = startCol; j < 10; j++) {
      const cellText = grid.rows[startRow].cells[j].textContent;
      if (cellText === '') break;
      horizontalWord += cellText;
    }

    for (let i = startRow; i < 10; i++) {
      const cellText = grid.rows[i].cells[startCol].textContent;
      if (cellText === '') break;
      verticalWord += cellText;
    }
  }

  placementModal.el.innerHTML = `
    <div class="modal-content">
      <h1>Заполнить сетку</h1>
      <label>Горизонтальное слово:</label>
      <input type="text" id="horizontal-input" placeholder="Введите горизонтальное слово" value="${horizontalWord}">
      <label>Вертикальное слово:</label>
      <input type="text" id="vertical-input" placeholder="Введите вертикальное слово" value="${verticalWord}">
      <button id="save-words">Сохранить</button>
      <button id="cancel-place">Отмена</button>
    </div>
  `;
  placementModal.el.style.display = 'block';

  const saveBtn = placementModal.el.querySelector('#save-words');
  saveBtn.addEventListener('click', () => {
    const horizontalWordNew = placementModal.el.querySelector('#horizontal-input').value.trim().toUpperCase();
    const verticalWordNew = placementModal.el.querySelector('#vertical-input').value.trim().toUpperCase();

    placeWords(horizontalWordNew, verticalWordNew);
    placementModal.el.style.display = 'none';
  });

  const cancelBtn = placementModal.el.querySelector('#cancel-place');
  cancelBtn.addEventListener('click', () => {
    placementModal.el.style.display = 'none';
  });
};

const placeWords = (horizontalWord, verticalWord) => {
  const grid = first("#grid").el;
  const startRow = currentPosition.row;
  const startCol = currentPosition.col;

  horizontalWord = (horizontalWord || '').toUpperCase();
  verticalWord = (verticalWord || '').toUpperCase();

  //
  // ====== ГОРИЗОНТАЛЬ ======
  //
  if (horizontalWord.length > 0) {
    // 1. Очистить старые буквы вправо, пока они есть (не трогаем пересечения)
    for (let j = startCol; j < 10; j++) {
      const cell = grid.rows[startRow].cells[j];
      if (cell.textContent === '') break;       // дошли до пустой — стоп
      if (j - startCol >= horizontalWord.length) {
        // за пределами нового слова — очищаем
        cell.textContent = '';
        cell.classList.remove('filled');
      }
    }

    // 2. Записать новое слово
    for (let j = 0; j < horizontalWord.length && startCol + j < 10; j++) {
      const cell = grid.rows[startRow].cells[startCol + j];
      cell.textContent = horizontalWord[j];
      cell.classList.add('filled');
    }
  }


  //
  // ====== ВЕРТИКАЛЬ ======
  //
  if (verticalWord.length > 0) {
    // 1. Очистить старые буквы вниз
    for (let i = startRow; i < 10; i++) {
      const cell = grid.rows[i].cells[startCol];
      if (cell.textContent === '') break;
      if (i - startRow >= verticalWord.length) {
        cell.textContent = '';
        cell.classList.remove('filled');
      }
    }

    // 2. Записать новое слово
    for (let i = 0; i < verticalWord.length && startRow + i < 10; i++) {
      const cell = grid.rows[startRow + i].cells[startCol];
      cell.textContent = verticalWord[i];
      cell.classList.add('filled');
    }
  }
};



gridBtn.addEventListener('click', () => {
  if (gridContainer.el.style.display === 'none' || gridContainer.el.style.display === '') {
    generateGrid();
    gridContainer.el.style.display = 'block';
    gridBtn.textContent = 'Скрыть Grid';
  } else {
    gridContainer.el.style.display = 'none';
    gridBtn.textContent = 'Grid';
  }
});

const wl = new WordList();

const onChangeWordList = () => {
  app.first('.words').innerHTML = renderWordList(wl);
  const wlEl = app.first(".word-list");
  if (wlEl) {
    wlEl.on('click', (e) => {
      const target = e.target;
      if (target.classList.contains('remove')) {
        const row = target.closest('tr');
        const word = row.querySelector(".word");
        if (word) {
          wl.removeWord(word.innerText.trim());
        }
      }
    });
  }
};

wl.onChange = onChangeWordList;

wl.addWord("повар", "такая профессия");
wl.addWord("чай", "вкусный, делает меня человеком");
wl.addWord("яблоки", "с ананасами");
wl.addWord("сосисочки", "я — Никита Литвинков!");
onChangeWordList();

app.first('.add-form').innerHTML = renderAddForm();
const formEl = app.first('.add-form form');
if (formEl) {
  formEl.on('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formEl.el);
    const word = formData.get('word')?.trim();
    const description = formData.get('description')?.trim();

    if (word && description) {
      try {
        wl.addWord(word, description);
        formEl.el.reset();
      } catch (e) {
        console.error('Ошибка добавления:', e);
      }
    }
  });
}