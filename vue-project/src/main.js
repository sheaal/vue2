Vue.component('board', {
    template: `
        <div class="board">
          <column v-for="column in columns" :column="column" :key="column.id"></column>
          <form @submit.prevent="addCardToColumn">
            <input type="text" v-model="newCardTitle" placeholder="Введите задачу">
            <button type="submit" border-radius: 7px>Add Card to Column 1</button>
          </form>
        </div>
    `,
    data() {
        return {
            columns: [
                { id: 1, title: "0%", maxCards: 3, cards: [] },
                { id: 2, title: "50%", maxCards: 5, cards: [] },
                { id: 3, title: "100%", maxCards: Infinity, cards: [] }
            ],
            newLists: [
                {
                    items: [
                        { title: '', checked: false },
                        { title: '', checked: false },
                        { title: '', checked: false }
                    ]
                },
                {
                    items: [
                        { title: '', checked: false },
                        { title: '', checked: false },
                        { title: '', checked: false }
                    ]
                },
                {
                    items: [
                        { title: '', checked: false },
                        { title: '', checked: false },
                        { title: '', checked: false }
                    ]
                }
            ],
            maxNumberOfLists: 5,
            newCardTitle: "",
            minNumberOfLists: 3,
        }
    },
    mounted() {
        this.loadSavedData();
    },
    methods: {
        loadSavedData() {
            const savedData = JSON.parse(localStorage.getItem('trello-board'));
            if (savedData) {
                this.columns = savedData;
            }
        },
        moveCardToColumn(card, column) {
            const columnIndex = this.columns.findIndex(c => c.id === column);
            if (columnIndex !== -1) {
                const cardIndex = this.columns[card.column - 1].cards.findIndex(c => c === card);
                if (cardIndex !== -1) {
                    this.columns[card.column - 1].cards.splice(cardIndex, 1);
                    this.columns[column - 1].cards.push(card);
                    card.column = column;
                }
            }
        },
        addCardToColumn() {
            if (this.newCardTitle.trim() !== '') {
                this.addCard(1, { title: this.newCardTitle, items: [], completed: '', column: 1 });
                this.newCardTitle = ""; // Clear the input field after adding the card
            }
        },
        addCard(columnId, newCard) {
            const columnIndex = this.columns.findIndex(c => c.id === columnId);
            if (columnIndex !== -1) {
                if (this.columns[columnIndex].cards.length < this.columns[columnIndex].maxCards) {
                    this.columns[columnIndex].cards.push(newCard);
                } else {
                    alert('Column is full');
                }
            } else {
                console.log('Column not found');
            }
        },
    },

    watch: {
        columns: {
            handler(newColumns) {
                localStorage.setItem('trello-board', JSON.stringify(newColumns));
            },
            deep: true
        }
    }
});

Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="column">
          <h2>{{ column.title }}</h2>
          <div v-for="card in column.cards">
            <card :card="card" @move-to-column="moveCard"></card>
          </div>
          <div v-if="column === 1 && isColumnFull">
            <p>Column 1 is full. Move cards to column 2 to continue editing.</p>
          </div>
        </div>
    `,
    computed: {
        isColumnFull() {
            return this.column.cards.length >= this.column.maxCards;
        }
    },
    methods: {
        moveCard(card, column) {
            if (column === 2) {
                this.$parent.moveCardToColumn(card, column);
            }
        }
    }
});

Vue.component('card', {
    props: {
        card: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            newListTitle: "",
            items: {
                lists: []
            }
        };
    },
    template: `
        <div class="card" style="background-color: #33b24e; border-radius: 7px; text-align: center;" @add-list="addList">
          <h3>{{ card.title }}</h3>
          <div v-for="list in items.lists">
              <input type="checkbox" v-model="list.checked" @change="checkItems">
              <label :class="{ completed: list.checked }">{{ list.title }}</label>
          </div>
          <span v-if="card.completed">{{ card.completed }}</span>
          <form @submit.prevent="addToList">
            <input type="text" v-model="newListTitle" placeholder="Введите название списка">
            <button type="submit">Добавить список</button>
          </form>

          <div v-for="(item, index) in card.items">
            <input type="checkbox" v-model="item.checked" @change="markItemDone(card, index)">
            <label :class="{ completed: item.checked }">{{ item.text }}</label>
          </div>
          <p v-if="card.completed">Completed at: {{ card.completed }}</p>
        </div>
    `,
    methods: {
        checkItems() {
            const checkedCount = this.items.lists.filter(item => item.checked).length;
            const completionPercentage = (checkedCount / this.items.lists.length) * 100;
            if (this.card.column === 1 && completionPercentage > 50) {
                this.$emit('move-to-column', this.card, 2);
            }
            else if (this.card.column === 2 && completionPercentage === 100) {
                this.$emit('move-to-column', this.card, 3);
            }
        },
        addList() {
            console.log(this.items.lists);
            if (typeof this.newListTitle === 'string' && this.newListTitle.trim() !== '') {
                this.items.lists.push({ title: this.newListTitle });
                this.newListTitle = "";
            }
        },
        addToList() {
            this.addList(1, { title: this.newListTitle });
            this.newListTitle = "";
        },
        loadSavedData() {
            const savedData = JSON.parse(localStorage.getItem('trello-board'));
            if (savedData) {
                this.items = savedData;
            }
        },
    },
    watch: {
        items: {
            handler(newItems) {
                localStorage.setItem('trello-board', JSON.stringify(newItems));
            },
            deep: true
        }
    }
});

new Vue({
    el: '#app',
});