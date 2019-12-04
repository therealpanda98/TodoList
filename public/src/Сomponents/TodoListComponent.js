import TodoItemComponent from './TodoItemComponent.js';
import { generateRandomNum, formatDate } from '../Utilities/utilities.js';

customElements.define('todo-item', TodoItemComponent);

const template = document.createElement('template');

template.innerHTML = `
	<style>
		ul {
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 100%;
			margin-left: 0;
			padding-left: 0;
		}
	</style>
	
	<ul>
	</ul>
`;

export default class TodoListComponent extends HTMLElement {

	_template;

	constructor() {
		super();
		this.attachShadow({mode: "open"});
		
		this.list = [
			{
				id: generateRandomNum(),
				text: 'Повседневная практика показывает, что начало повседневной работы.',
				date: '03.12.19',
				status: 'waiting'
			},
			{
				id: generateRandomNum(),
				text: 'Повседневная практика показывает, что социально-экономическое развитие.',
				date: '20.11.19',
				status: 'waiting'
			},
			{
				id: generateRandomNum(),
				text: 'Сделать тесты по всем предметам.',
				date: '01.10.19',
				status: 'done'
			},
		];
	}

	/**
	 * @returns {HTMLTemplateElement}
	 */
	get template() { return this._template; }

	connectedCallback() {
		this.render();
		this.subscribeEvents();
	}

	disconnectedCallback() {
		this.unSubscribeEvents();
	}

	/**
	 * Обновляет список и рендерит новый список дел
	 * @param {HTMLEventElement} event 
	 */
	onCreateTodo(event) {
		this.addTodoToList(event.detail);
		this.render();
	}

	/**
	 * Удаляет элемент из списка дел и рендерит новый список дел
	 * @param {HTMLEventElement} event 
	 */
	onDeleteTodo(event) {
		this.deleteTodoFromList(event.detail.id);
		//this.render();
	}

	/**
	 * Редактирует задачу в списке дел 
	 * @param {HTMLEventElement} event 
	 */
	onEditTodo(event) {
		this.editTodoInList(event.detail);
	}


	/**
	 * Оформление подписок событий элемента
	 */
	subscribeEvents() {
		window.addEventListener('createTodo', (event) => this.onCreateTodo(event));
		window.addEventListener('deleteTodo', (event) => this.onDeleteTodo(event));
		window.addEventListener('editTodo', (event) => this.onEditTodo(event));
	}

	/**
	 * Отписка от всех событий
	 */
	unSubscribeEvents() {
		window.removeEventListener('createTodo', (event) => this.onCreateTodo(event));
		window.removeEventListener('deleteTodo', (event) => this.onDeleteTodo(event));
		window.removeEventListener('editTodo', (event) => this.onEditTodo(event));
	}

	/**
	 * Вовзращает найденный по id объект списка дел
	 * @param {String} id 
	 * @returns {Object}
	 */
	findTodoInList(id) {
		return this.list.filter(item => item.id === id)[0];
	}

	/**
	 * Добваляет новое задание в список
	 * @param {Object} data
	 */
	addTodoToList(data) {
		this.list.push({
			id: generateRandomNum(),
			text: data.text,
			date: formatDate(data.date),
			status: data.status
		})
	}

	/**
	 * Удаляет из списка дел элемент по id
	 * @param {String} id
	 */
	deleteTodoFromList(id) {
		this.list = this.list.filter(item => item.id !== id);
	}

	/**
	 * Заменяет значения задачи на новые в списке дел
	 * @param {Object} data
	 */
	editTodoInList(data) {
		let todo = this.findTodoInList(data.id);
		// заменяет в первом аргументе одинаковые поля со вторым аргументом, на значения второго аргумента
		Object.assign(todo, data);
	}

	/**
	 * Отрисовка элемента
	 */
	render() {
		this._template = template.content.cloneNode(true);
		
		this.shadowRoot.innerHTML = '';

		const fragment = document.createDocumentFragment();
		

		this.list.map( ({ id, text, date, status }) => {
			const todoItem = document.createElement('todo-item');
			todoItem.setAttribute('task-id', id);
			todoItem.setAttribute('text', text);
			todoItem.setAttribute('date', date);
			todoItem.setAttribute('status', status);
			fragment.appendChild(todoItem);
		});

		this.template.querySelector('ul').appendChild(fragment);
		this.shadowRoot.appendChild(this.template);

		setInterval(() => console.log(this.list), 5000);
	}
}