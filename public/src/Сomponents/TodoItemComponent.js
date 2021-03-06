import Store from '../Store/Store.js';
import { editTodo, deleteTodo } from '../Store/Actions.js';
import { formatDate, parseStringToBoolean } from '../Utilities/utilities.js';
import ApiTodo from '../Api/TodoApi.js';

const template = document.createElement('template');

template.innerHTML = `
	<style>
		li {
			display: flex;
			align-items: center;
			min-height: 50px;
			font-size: 1em;
			color: #999fc0;
			border-bottom: 2px solid #e3e9ff;
		}

		input[type=checkbox] {
			cursor: pointer;
		}

		li:hover, li:hover input[type=text] {
			background: #f7f9ff;
		}

		label {
			width: 90%;
			margin-left: 10px;
			cursor: pointer;
		}

		input[type=text] {
			width: 100%;
			font-size: 1em;
			color: #999fc0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			border: none;
			outline: none;
		}

		.date {
			margin: 0 15px;
		}

		.remove-item {
			font-size: 1.3em;
			cursor: pointer;
			color: red;
		}

	</style>
	
	<li>
		<input type="checkbox" >
		<label><input type="text" ></label>
		<div class="date"></div>
		<div class="remove-item">
			<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" style="fill: #bb0000">
				<path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2zm-7-10.414l3.293-3.293 1.414 1.414-3.293 3.293 3.293 3.293-1.414 1.414-3.293-3.293-3.293 3.293-1.414-1.414 3.293-3.293-3.293-3.293 1.414-1.414 3.293 3.293zm10-8.586h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-8-3h-4v1h4v-1z"/>
			</svg>
		</div>
	</li>
`;

export default class TodoItemComponent extends HTMLElement {

	_template;
	_checkbox;
	_textInput;
	_removeBtn;

	constructor() {
		super();
		this.attachShadow({mode: "open"});
	}

	/**
	 * @returns {HTMLTemplateElement}
	 */
	get template() { return this._template; }

	/**
	 * @returns {HTMLTemplateElement}
	 */
	get checkbox() { return this._checkbox; }

	/**
	 * @returns {HTMLTemplateElement}
	 */
	get textInput() { return this._textInput; }

	/**
	 * @returns {HTMLTemplateElement}
	 */
	get removeBtn() { return this._removeBtn; }

	connectedCallback(){
		this.render();
		this.subscribeEvents();
	}

	disconnectedCallback() {
		this.unSubscribeEvents();
	}

	/**
	 * Изменяет атрибут статуса задания и меняет его UI
	 */
	toggleStatus() {
		if (this.getAttribute('completed') === 'true') {
			this.setAttribute('completed', 'false');
		}
		else if (this.getAttribute('completed') === 'false') {
			this.setAttribute('completed', 'true');
		}
	}

	/**
	 * Изменяет статус задания
	 */
	onChangeStatus() {
		this.toggleStatus();
		let data = this.getTodoData();

		ApiTodo.updateTodo(data._id, data)
			.then(updatedTodo => {
				this.dispatchEditTodo(updatedTodo);
			})
			.catch(error => console.error(error));
	}

	/**
	 * Удаляет задание из общего списка
	 */
	onRemoveItem() {
		ApiTodo.deleteTodo(this.getTodoData()._id)
			.then(this.dispatchDeleteTodo())
			.catch(error => toastr.error(error))
	}

	/**
	 * Изменяет текст задания при потере фокуса
	 */
	onChangeText() {
		let data = this.getTodoData();

		if (this.textInput.value == '') { toastr.error('Error: Text should be at least 5 characters') }

		ApiTodo.updateTodo(data._id, data)
			.then(updatedTodo => {
				this.dispatchEditTodo(updatedTodo);
			})
			.catch(error => {
				toastr.error(error);
				this.textInput.focus();
			})
	}

	/**
	 * Применяет новый текст в атрибут text 
	 */
	onInputText() {
		this.setAttribute('text', this.textInput.value);
	}

	/**
	 * Оформление подписок событий элемента
	 */
	subscribeEvents() {
		this.checkbox.addEventListener('click', () => this.onChangeStatus());
		this.removeBtn.addEventListener('click', () => this.onRemoveItem());
		this.textInput.addEventListener('change', () => this.onChangeText());
		this.textInput.addEventListener('input', () => this.onInputText());
	}

	/**
	 * Отписка от всех событий
	 */
	unSubscribeEvents() {
		this.checkbox.removeEventListener('click', () => this.onChangeStatus());
		this.removeBtn.removeEventListener('click', () => this.onRemoveItem());
		this.textInput.removeEventListener('change', () => this.onChangeText());
		this.textInput.removeEventListener('input', () => this.onInputText());
	}

	/**
	 * Вызывает событие изменения задачи из списка дел
	 * @param {Object} data - обект с данными todo задачи
	 */
	dispatchEditTodo(data) {
		Store.dispatch(editTodo(data));
	}

	/**
	 * Вызывает событие удаления задачи из списка дел
	 */
	dispatchDeleteTodo() {
		Store.dispatch(deleteTodo(this.getTodoData()));
	}

	/**
	 * Собирает все пропсы в объект
	 * @returns {Object}
	 */
	getTodoData() {
		return {
			_id: this.getAttribute('task-id'),
			text: this.getAttribute('text'),
			createDate: new Date(this.getAttribute('createDate')),
			completed: parseStringToBoolean(this.getAttribute('completed')),
		}
	}

	/**
	 * Отрисовка элемента
	 */
	render() {		
		this._template = template.content.cloneNode(true);

		this._checkbox = this.template.querySelector('input[type=checkbox]');
		this._removeBtn = this.template.querySelector('.remove-item');
		this._textInput = this.template.querySelector('label input[type=text]');

		this.shadowRoot.innerHTML = '';

		this.template.querySelector('li').setAttribute('task-id', this.getAttribute('task-id'));
		this.template.querySelector('label').setAttribute('for', this.getAttribute('task-id'));
		this.template.querySelector('label input[type=text]').value = this.getAttribute('text');
		this.template.querySelector('.date').innerText = formatDate(new Date(this.getAttribute('createDate')));

		if (this.getAttribute('completed') === 'true') { 
			this.checkbox.checked = true;
			this.textInput.style.textDecoration = 'line-through';
		}

		this.shadowRoot.appendChild(this.template);
	}
}